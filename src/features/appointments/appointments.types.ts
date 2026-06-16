import { z } from 'zod';
import { createStatusMachine } from '@/lib/validation';

// ============================================================
// Appointment Status Machine
// ============================================================

export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'checked_in',
  'in_consultation',
  'completed',
  'cancelled',
  'no_show',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const appointmentStatusMachine = createStatusMachine<AppointmentStatus>({
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_consultation', 'cancelled', 'no_show'],
  in_consultation: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: [],
});

// ============================================================
// Zod Validation Schemas
// ============================================================

export const appointmentFormSchema = z.object({
  customerId: z.string().uuid('Customer is required'),
  petId: z.string().uuid('Pet is required'),
  serviceId: z.string().uuid('Service is required'),
  doctorId: z.string().uuid('Doctor is required').optional().nullable(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional().nullable(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// ============================================================
// Domain Types
// ============================================================

export interface Appointment {
  id: string;
  queueNumber?: string | null;
  customerId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  petId: string;
  petName?: string | null;
  petSpecies?: string | null;
  petBreed?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  serviceId: string;
  service: string;
  serviceDuration?: number;
  servicePrice?: number;
  notes?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  scheduledAt: string;
  status: AppointmentStatus;
  checkedInAt?: string | null;
  consultationStartedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorAvailability {
  doctorId: string;
  doctorName: string;
  date: string;
  slots: TimeSlot[];
}

export interface AppointmentConflict {
  type: 'doctor' | 'room' | 'pet' | 'customer';
  conflictingAppointmentId: string;
  message: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  type: 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

// ============================================================
// Query Types
// ============================================================

export interface AppointmentQueryParams {
  page?: number;
  pageSize?: number;
  status?: AppointmentStatus;
  doctorId?: string;
  customerId?: string;
  petId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentStats {
  totalToday: number;
  completed: number;
  cancelled: number;
  noShow: number;
  pending: number;
  averageDuration: number;
  revenueToday: number;
}