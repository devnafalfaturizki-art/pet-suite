import { useQuery, useMutation } from '@tanstack/react-query';
import { auditService } from './audit.service';
import type { AuditAction, AuditEntityType, AuditFilter } from './audit.types';

/**
 * Hook to query audit logs with filtering and pagination.
 */
export function useAuditLogs(filter: AuditFilter = {}) {
  return useQuery({
    queryKey: ['audit-logs', filter],
    queryFn: () => auditService.query(filter),
    refetchInterval: 30_000, // Poll every 30s for live updates
  });
}

/**
 * Hook to get a single audit entry by ID.
 */
export function useAuditEntry(id: string | undefined) {
  return useQuery({
    queryKey: ['audit-entry', id],
    queryFn: () => auditService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to get audit statistics.
 */
export function useAuditStats() {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditService.getStats(),
    refetchInterval: 60_000,
  });
}

/**
 * Hook to log an audit entry.
 * Returns a mutation that can be called from any component.
 */
export function useAuditLog() {
  return useMutation({
    mutationFn: (params: {
      action: AuditAction;
      entityType: AuditEntityType;
      entityId: string;
      userId: string;
      userEmail: string;
      userRole: string;
      metadata?: Record<string, unknown>;
      changes?: Record<string, { old: unknown; new: unknown }> | null;
    }) => auditService.log(params),
  });
}