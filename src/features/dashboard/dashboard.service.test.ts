import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './dashboard.service';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

type SupabaseChain = Record<string, any>;

function createChain(result: any) {
  const chain: SupabaseChain = { ...result };
  const methods = ['select', 'eq', 'gte', 'lte', 'lt', 'order', 'limit', 'group'];
  for (const method of methods) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  return chain;
}

describe('dashboardService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('getOwnerStats returns consolidated metrics', async () => {
    const appointments = { data: null, count: 5, error: null };
    const inpatients = { data: null, count: 2, error: null };
    const vaccinations = { data: null, count: 3, error: null };
    const lowStock = { data: null, count: 1, error: null };
    const revenue = { data: [{ total: '150000' }], error: null };

    supabaseMock.from
      .mockReturnValueOnce(createChain(appointments))
      .mockReturnValueOnce(createChain(inpatients))
      .mockReturnValueOnce(createChain(vaccinations))
      .mockReturnValueOnce(createChain(lowStock))
      .mockReturnValueOnce(createChain(revenue));

    const result = await dashboardService.getOwnerStats();

    expect(result).toEqual({
      revenueToday: 150000,
      appointmentsToday: 5,
      activeInpatients: 2,
      pendingVaccinations: 3,
      lowStockCount: 1
    });
  });

  it('getDoctorStats returns doctor-specific appointment and inpatient data', async () => {
    const doctor = { data: { id: 'd1' }, error: null };
    const appointments = {
      data: [
        {
          id: 'a1',
          appointment_date: '2026-06-10',
          start_time: '09:00',
          services: { name: 'Consultation' },
          pets: { name: 'Rex' },
          customers: { full_name: 'Alex' },
          status: 'scheduled'
        }
      ],
      error: null
    };
    const medicalRecords = {
      data: [
        {
          id: 'm1',
          created_at: '2026-06-09T10:00:00Z',
          record_type: 'Exam',
          pets: { name: 'Rex' }
        }
      ],
      error: null
    };
    const inpatient = { data: null, count: 1, error: null };

    supabaseMock.from
      .mockReturnValueOnce(createChain(doctor))
      .mockReturnValueOnce(createChain(appointments))
      .mockReturnValueOnce(createChain(medicalRecords))
      .mockReturnValueOnce(createChain(inpatient));

    const result = await dashboardService.getDoctorStats('profile-123');

    expect(result.activeInpatients).toBe(1);
    expect(result.todayAppointments[0].service).toBe('Consultation');
    expect(result.recentMedicalRecords[0].petName).toBe('Rex');
  });
});
