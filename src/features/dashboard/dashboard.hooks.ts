import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './dashboard.service';

export function useOwnerStats() {
  return useQuery(['dashboard', 'owner-stats'], () => dashboardService.getOwnerStats(), { staleTime: 60000 });
}

export function useWeeklyRevenue() {
  return useQuery(['dashboard', 'weekly-revenue'], () => dashboardService.getWeeklyRevenue(), { staleTime: 60000 });
}

export function useAppointmentBreakdown(month: number, year: number) {
  return useQuery(['dashboard', 'appointment-breakdown', month, year], () => dashboardService.getAppointmentStatusBreakdown(month, year), {
    staleTime: 60000,
    enabled: Boolean(month && year)
  });
}

export function useRecentTransactions() {
  return useQuery(['dashboard', 'recent-transactions'], () => dashboardService.getRecentTransactions(), { staleTime: 60000 });
}

export function useLowStockItems() {
  return useQuery(['dashboard', 'low-stock'], () => dashboardService.getLowStockItems(), { staleTime: 60000 });
}

export function useDoctorStats(doctorProfileId?: string) {
  return useQuery(['dashboard', 'doctor-stats', doctorProfileId], () => dashboardService.getDoctorStats(doctorProfileId ?? ''), {
    staleTime: 60000,
    enabled: Boolean(doctorProfileId)
  });
}

export function useStaffStats() {
  return useQuery(['dashboard', 'staff-stats'], () => dashboardService.getStaffStats(), { staleTime: 60000 });
}
