import { supabase } from '@/lib/supabase';
import { Repository, RepositoryError } from '@/lib/repository';
import { appointmentStatusMachine } from './appointments.types';
import type {
  Appointment,
  AppointmentFormData,
  AppointmentStatus,
  AppointmentQueryParams,
  AppointmentStats,
  AppointmentConflict,
  DoctorAvailability,
  AppointmentServiceOption,
  TimeSlot,
} from './appointments.types';

// ============================================================
// Appointment Repository
// ============================================================

const appointmentRepo = new Repository<Appointment>({
  table: 'appointments',
  entityName: 'appointment',
  softDelete: false,
  auditEnabled: true,
});

// ============================================================
// Helper Functions
// ============================================================

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function buildTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes = 60,
): TimeSlot[] {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots: TimeSlot[] = [];

  for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
    const startHour = Math.floor(current / 60);
    const startMinute = current % 60;
    const finish = current + durationMinutes;
    const endHour = Math.floor(finish / 60);
    const endMinute = finish % 60;

    slots.push({
      startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
      endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
      available: true,
    });
  }

  return slots;
}

function mapAppointment(record: any): Appointment {
  return {
    id: record.id,
    queueNumber: record.queue_number ? String(record.queue_number) : null,
    customerId: record.customer_id,
    customerName: record.customers?.full_name ?? record.customers?.[0]?.full_name ?? null,
    customerPhone: record.customers?.phone ?? null,
    petId: record.pet_id,
    petName: record.pets?.name ?? record.pets?.[0]?.name ?? null,
    petSpecies: record.pets?.species ?? null,
    petBreed: record.pets?.breed ?? null,
    doctorId: record.doctor_id ?? null,
    doctorName: record.doctors?.profiles?.full_name ?? record.doctors?.[0]?.profiles?.full_name ?? null,
    serviceId: record.service_id,
    service: record.services?.name ?? record.services?.[0]?.name ?? '',
    serviceDuration: record.services?.duration_minutes ?? null,
    servicePrice: record.services?.price ?? null,
    notes: record.notes ?? null,
    appointmentDate: record.appointment_date,
    startTime: record.start_time ?? '00:00',
    endTime: record.end_time ?? '00:00',
    scheduledAt: `${record.appointment_date}T${record.start_time ?? '00:00:00'}`,
    status: record.status as AppointmentStatus,
    checkedInAt: record.checked_in_at ?? null,
    consultationStartedAt: record.consultation_started_at ?? null,
    completedAt: record.completed_at ?? null,
    cancelledAt: record.cancelled_at ?? null,
    cancellationReason: record.cancellation_reason ?? null,
    createdBy: record.created_by ?? null,
    updatedBy: record.updated_by ?? null,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

const APPOINTMENT_SELECT = `
  id, queue_number, customer_id, pet_id, doctor_id, service_id,
  services(name, duration_minutes, price),
  customers!inner(full_name, phone),
  pets!inner(name, species, breed),
  doctors(profiles!inner(full_name)),
  notes, appointment_date, start_time, end_time, status,
  checked_in_at, consultation_started_at, completed_at,
  cancelled_at, cancellation_reason,
  created_by, updated_by, created_at, updated_at
`;

// ============================================================
// Appointment Service
// ============================================================

export const appointmentsService = {
  // ============================================================
  // CRUD Operations
  // ============================================================

  async getAppointments(params: AppointmentQueryParams = {}) {
    const {
      page = 1,
      pageSize = 20,
      status,
      doctorId,
      customerId,
      petId,
      date,
      startDate,
      endDate,
      search,
      sortBy = 'appointment_date',
      sortOrder = 'asc',
    } = params;

    let query = supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT, { count: 'exact' });

    // Filters
    if (status) query = query.eq('status', status);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (customerId) query = query.eq('customer_id', customerId);
    if (petId) query = query.eq('pet_id', petId);
    if (date) {
      query = query.eq('appointment_date', date);
    } else {
      if (startDate) query = query.gte('appointment_date', startDate);
      if (endDate) query = query.lte('appointment_date', endDate);
    }

    // Search
    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `pets.name.ilike.${term},customers.full_name.ilike.${term},services.name.ilike.${term}`
      );
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new RepositoryError('Failed to fetch appointments', error);

    return {
      items: (data ?? []).map(mapAppointment),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('id', id)
      .single();

    if (error) throw new RepositoryError('Failed to fetch appointment', error);
    return data ? mapAppointment(data) : null;
  },

  async createAppointment(payload: AppointmentFormData): Promise<Appointment> {
    // Validate with status machine
    const validation = appointmentFormSchema.safeParse(payload);
    if (!validation.success) {
      throw new RepositoryError(
        `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`
      );
    }

    // Check for conflicts
    const conflicts = await this.detectConflicts(payload);
    if (conflicts.length > 0) {
      throw new RepositoryError(
        `Scheduling conflict: ${conflicts[0].message}`
      );
    }

    // Generate queue number
    const queueNumber = await this.generateQueueNumber(payload.appointmentDate);

    const insert = {
      queue_number: queueNumber,
      customer_id: payload.customerId,
      pet_id: payload.petId,
      doctor_id: payload.doctorId ?? null,
      service_id: payload.serviceId,
      appointment_date: payload.appointmentDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      notes: payload.notes ?? null,
      status: 'scheduled' as const,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(insert)
      .select(APPOINTMENT_SELECT)
      .single();

    if (error) throw new RepositoryError('Failed to create appointment', error);
    if (!data) throw new RepositoryError('No data returned after creating appointment');

    return mapAppointment(data);
  },

  async updateAppointment(id: string, payload: Partial<AppointmentFormData>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(APPOINTMENT_SELECT)
      .single();

    if (error) throw new RepositoryError('Failed to update appointment', error);
    return mapAppointment(data);
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw new RepositoryError('Failed to delete appointment', error);
  },

  // ============================================================
  // Status Machine Operations
  // ============================================================

  async transitionStatus(id: string, newStatus: AppointmentStatus, reason?: string): Promise<Appointment> {
    // Get current appointment
    const current = await this.getAppointmentById(id);
    if (!current) throw new RepositoryError('Appointment not found');

    // Validate transition
    const validation = appointmentStatusMachine.validateTransition(current.status, newStatus);
    if (!validation.valid) {
      throw new RepositoryError(validation.error!);
    }

    // Build update payload with timestamps
    const update: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    switch (newStatus) {
      case 'checked_in':
        update.checked_in_at = new Date().toISOString();
        break;
      case 'in_consultation':
        update.consultation_started_at = new Date().toISOString();
        break;
      case 'completed':
        update.completed_at = new Date().toISOString();
        // Auto-create invoice on completion
        await this.ensureInvoiceOnCompletion(id);
        break;
      case 'cancelled':
        update.cancelled_at = new Date().toISOString();
        update.cancellation_reason = reason ?? null;
        break;
      case 'no_show':
        update.cancelled_at = new Date().toISOString();
        update.cancellation_reason = reason ?? 'No show';
        break;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(update)
      .eq('id', id)
      .select(APPOINTMENT_SELECT)
      .single();

    if (error) throw new RepositoryError('Failed to update appointment status', error);
    return mapAppointment(data);
  },

  async getNextStatuses(id: string): Promise<AppointmentStatus[]> {
    const current = await this.getAppointmentById(id);
    if (!current) return [];
    return appointmentStatusMachine.getNextStates(current.status);
  },

  // ============================================================
  // Conflict Detection
  // ============================================================

  async detectConflicts(payload: AppointmentFormData, excludeId?: string): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = [];
    const date = payload.appointmentDate;

    // Doctor time conflict
    if (payload.doctorId) {
      const { data: doctorAppts } = await supabase
        .from('appointments')
        .select('id, start_time, end_time')
        .eq('doctor_id', payload.doctorId)
        .eq('appointment_date', date)
        .not('status', 'in', '("cancelled","no_show")')
        .neq('id', excludeId ?? '');

      if (doctorAppts) {
        for (const appt of doctorAppts) {
          if (this.timesOverlap(payload.startTime, payload.endTime, appt.start_time, appt.end_time)) {
            conflicts.push({
              type: 'doctor',
              conflictingAppointmentId: appt.id,
              message: 'Doctor already has an appointment during this time',
            });
          }
        }
      }
    }

    // Pet conflict (same pet can't be in two places)
    const { data: petAppts } = await supabase
      .from('appointments')
      .select('id, start_time, end_time')
      .eq('pet_id', payload.petId)
      .eq('appointment_date', date)
      .not('status', 'in', '("cancelled","no_show")')
      .neq('id', excludeId ?? '');

    if (petAppts) {
      for (const appt of petAppts) {
        if (this.timesOverlap(payload.startTime, payload.endTime, appt.start_time, appt.end_time)) {
          conflicts.push({
            type: 'pet',
            conflictingAppointmentId: appt.id,
            message: 'This pet already has an appointment during this time',
          });
        }
      }
    }

    return conflicts;
  },

  timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = parseTimeToMinutes(start1);
    const e1 = parseTimeToMinutes(end1);
    const s2 = parseTimeToMinutes(start2);
    const e2 = parseTimeToMinutes(end2);
    return s1 < e2 && s2 < e1;
  },

  // ============================================================
  // Calendar & Availability
  // ============================================================

  async getCalendarAppointments(from: string, to: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .gte('appointment_date', from)
      .lte('appointment_date', to)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw new RepositoryError('Failed to fetch calendar appointments', error);
    return (data ?? []).map(mapAppointment);
  },

  async getDoctorAvailability(
    doctorId: string,
    date: string,
    serviceDurationMinutes = 60,
  ): Promise<DoctorAvailability> {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get doctor's schedule for this day
    const { data: schedules, error: scheduleError } = await supabase
      .from('doctor_schedules')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (scheduleError) throw new RepositoryError('Failed to fetch doctor schedule', scheduleError);

    // Get already booked slots
    const { data: booked, error: bookedError } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .not('status', 'in', '("cancelled","no_show")');

    if (bookedError) throw new RepositoryError('Failed to fetch booked slots', bookedError);

    const bookedSlots = new Set(
      (booked ?? []).map((b: any) => b.start_time)
    );

    const availableSlots: TimeSlot[] = [];

    for (const schedule of (schedules ?? []) as any[]) {
      const candidateSlots = buildTimeSlots(
        schedule.start_time,
        schedule.end_time,
        serviceDurationMinutes,
      );

      for (const candidate of candidateSlots) {
        const isBooked = (booked ?? []).some((b: any) =>
          this.timesOverlap(
            candidate.startTime,
            candidate.endTime,
            b.start_time,
            b.end_time
          )
        );
        availableSlots.push({
          ...candidate,
          available: !isBooked,
        });
      }
    }

    // Get doctor name
    const { data: doctor } = await supabase
      .from('doctors')
      .select('profiles!inner(full_name)')
      .eq('id', doctorId)
      .single();

    return {
      doctorId,
      doctorName: (doctor as any)?.profiles?.full_name ?? 'Unknown',
      date,
      slots: availableSlots,
    };
  },

  // ============================================================
  // Statistics
  // ============================================================

  async getStats(date?: string): Promise<AppointmentStats> {
    const today = date ?? new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('appointments')
      .select('status, start_time, end_time')
      .eq('appointment_date', today);

    if (error) throw new RepositoryError('Failed to fetch appointment stats', error);

    const appointments = (data ?? []) as any[];
    const stats: AppointmentStats = {
      totalToday: appointments.length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
      noShow: appointments.filter((a) => a.status === 'no_show').length,
      pending: appointments.filter((a) =>
        ['scheduled', 'confirmed', 'checked_in', 'in_consultation'].includes(a.status)
      ).length,
      averageDuration: 0,
      revenueToday: 0,
    };

    // Calculate average duration
    const completedWithDuration = appointments.filter(
      (a) => a.status === 'completed' && a.start_time && a.end_time
    );
    if (completedWithDuration.length > 0) {
      const totalMinutes = completedWithDuration.reduce((sum: number, a: any) => {
        return sum + (parseTimeToMinutes(a.end_time) - parseTimeToMinutes(a.start_time));
      }, 0);
      stats.averageDuration = Math.round(totalMinutes / completedWithDuration.length);
    }

    return stats;
  },

  // ============================================================
  // Doctors & Services
  // ============================================================

  async getDoctors(search?: string) {
    let query = supabase
      .from('doctors')
      .select('id, profile_id, specialization, photo_url, profiles!inner(full_name)')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('profiles.full_name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new RepositoryError('Failed to fetch doctors', error);

    return ((data ?? []) as any[]).map((doc) => ({
      id: doc.id,
      profileId: doc.profile_id,
      fullName: doc.profiles?.full_name ?? 'Doctor',
      specialization: doc.specialization,
      photoUrl: doc.photo_url ?? null,
    }));
  },

  async getServices(search?: string): Promise<AppointmentServiceOption[]> {
    let query = supabase
      .from('services')
      .select('id, name, duration_minutes, price, category')
      .order('name');

    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (error) throw new RepositoryError('Failed to fetch services', error);

    return ((data ?? []) as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      durationMinutes: row.duration_minutes,
      price: Number(row.price),
      category: row.category,
    }));
  },

  // ============================================================
  // Queue Number Generation
  // ============================================================

  async generateQueueNumber(date: string): Promise<string> {
    try {
      const result = await supabase.functions.invoke('generate-queue', {
        body: { date },
      });
      const resultData = result.data as { queue_number?: string } | null;
      if (resultData?.queue_number) return resultData.queue_number;
    } catch {
      // Fallback: generate locally
    }

    const dateStr = date.replace(/-/g, '');
    const random = Math.floor(Math.random() * 900) + 100;
    return `${dateStr}-${random}`;
  },

  // ============================================================
  // Invoice Auto-creation
  // ============================================================

  async ensureInvoiceOnCompletion(appointmentId: string): Promise<void> {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('appointment_id', appointmentId)
      .limit(1);

    if (existing && existing.length > 0) return;

    // Import dynamically to avoid circular dependency
    const { posService } = await import('@/features/pos/pos.service');
    await posService.createInvoice({
      appointment_id: appointmentId,
      subtotal: 0,
      discount_amount: 0,
      loyalty_points_used: 0,
      loyalty_discount_amount: 0,
      total: 0,
      payment_method: 'cash',
      paid_amount: 0,
      change_amount: 0,
      status: 'draft',
      notes: `Auto-generated invoice for completed appointment`,
      items: [],
    });
  },

  // ============================================================
  // Realtime Subscription
  // ============================================================

  subscribeToChanges(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new ? mapAppointment(payload.new) : null,
            old: payload.old ? mapAppointment(payload.old) : null,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
};

export default appointmentsService;