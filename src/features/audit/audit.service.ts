import { supabase } from '@/lib/supabase';
import type { AuditEntry, AuditAction, AuditEntityType, AuditFilter } from './audit.types';

/**
 * Audit trail service for enterprise compliance.
 * All user actions, data modifications, and auth events are logged.
 */
export const auditService = {
  /**
   * Log an audit entry to the database.
   */
  async log(params: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    userId: string;
    userEmail: string;
    userRole: string;
    metadata?: Record<string, unknown>;
    changes?: Record<string, { old: unknown; new: unknown }> | null;
  }): Promise<void> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        user_id: params.userId,
        user_email: params.userEmail,
        user_role: params.userRole,
        metadata: params.metadata ?? {},
        changes: params.changes ?? null,
        ip_address: null, // Would be set server-side
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[AuditService] Failed to log entry:', error.message);
      }
    } catch (err) {
      // Audit failures should never block the main application flow
      console.error('[AuditService] Error logging audit entry:', err);
    }
  },

  /**
   * Query audit entries with filtering and pagination.
   */
  async query(filter: AuditFilter = {}): Promise<{ data: AuditEntry[]; total: number }> {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filter.action) {
      query = query.eq('action', filter.action);
    }
    if (filter.entityType) {
      query = query.eq('entity_type', filter.entityType);
    }
    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
    if (filter.startDate) {
      query = query.gte('created_at', filter.startDate);
    }
    if (filter.endDate) {
      query = query.lte('created_at', filter.endDate);
    }

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[AuditService] Query failed:', error.message);
      return { data: [], total: 0 };
    }

    return {
      data: (data as unknown as AuditEntry[]) ?? [],
      total: count ?? 0,
    };
  },

  /**
   * Get a single audit entry by ID.
   */
  async getById(id: string): Promise<AuditEntry | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[AuditService] Get by ID failed:', error.message);
      return null;
    }

    return data as unknown as AuditEntry;
  },

  /**
   * Get audit summary statistics.
   */
  async getStats(): Promise<{
    totalEntries: number;
    entriesToday: number;
    topActions: { action: string; count: number }[];
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [totalResult, todayResult, topActionsResult] = await Promise.all([
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase
        .from('audit_logs')
        .select('action, count')
        .order('count', { ascending: false })
        .limit(10),
    ]);

    return {
      totalEntries: totalResult.count ?? 0,
      entriesToday: todayResult.count ?? 0,
      topActions: (topActionsResult.data as unknown as { action: string; count: number }[]) ?? [],
    };
  },
};