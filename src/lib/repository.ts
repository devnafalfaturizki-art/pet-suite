import { supabase } from './supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { auditService } from '@/features/audit';
import { useAuthStore } from '@/stores/auth.store';

// ============================================================
// Generic Repository Pattern
// Provides consistent CRUD with audit logging, error handling
// ============================================================

export interface RepositoryOptions {
  /** Supabase table name */
  table: string;
  /** Entity name for audit logging */
  entityName: string;
  /** Whether to enable soft delete */
  softDelete?: boolean;
  /** Whether to enable audit logging */
  auditEnabled?: boolean;
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class Repository<T extends { id: string }> {
  private options: Required<RepositoryOptions>;

  constructor(opts: RepositoryOptions) {
    this.options = {
      softDelete: false,
      auditEnabled: true,
      ...opts,
    };
  }

  get table() {
    return this.options.table;
  }

  get entityName() {
    return this.options.entityName;
  }

  // ============================================================
  // CRUD Operations
  // ============================================================

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new RepositoryError(`Failed to fetch ${this.entityName}`, error);
    return data as T | null;
  }

  async findAll(opts: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      pageSize = 20,
      search,
      searchFields,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters,
    } = opts;

    let query = supabase
      .from(this.table)
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Soft delete filter
    if (this.options.softDelete) {
      query = query.is('deleted_at', null);
    }

    // Search
    if (search && searchFields?.length) {
      const searchConditions = searchFields.map(
        (field) => `${field}.ilike.%${search}%`
      );
      query = query.or(searchConditions.join(','));
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new RepositoryError(`Failed to fetch ${this.entityName} list`, error);

    return {
      data: (data as T[]) ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async create(input: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.table)
      .insert(input)
      .select()
      .single();

    if (error) throw new RepositoryError(`Failed to create ${this.entityName}`, error);

    if (this.options.auditEnabled) {
      await this.logAudit('CREATE', data.id, { input });
    }

    return data as T;
  }

  async update(id: string, input: Partial<T>): Promise<T> {
    const oldData = this.options.auditEnabled ? await this.findById(id) : null;

    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new RepositoryError(`Failed to update ${this.entityName}`, error);

    if (this.options.auditEnabled && oldData) {
      const changes = this.computeChanges(oldData, data);
      if (Object.keys(changes).length > 0) {
        await this.logAudit('UPDATE', id, { changes });
      }
    }

    return data as T;
  }

  async delete(id: string): Promise<void> {
    if (this.options.softDelete) {
      await this.update(id, { deleted_at: new Date().toISOString() } as Partial<T>);
    } else {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) throw new RepositoryError(`Failed to delete ${this.entityName}`, error);
    }

    if (this.options.auditEnabled) {
      await this.logAudit('DELETE', id, {});
    }
  }

  async restore(id: string): Promise<T> {
    if (!this.options.softDelete) {
      throw new RepositoryError(`Soft delete not enabled for ${this.entityName}`);
    }
    return this.update(id, { deleted_at: null } as Partial<T>);
  }

  // ============================================================
  // Realtime Subscriptions
  // ============================================================

  subscribeToChanges(callback: (payload: RealtimePayload<T>) => void) {
    const subscription = supabase
      .channel(`${this.table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.table },
        (payload) => {
          callback(payload as unknown as RealtimePayload<T>);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  private async logAudit(action: string, entityId: string, extra: Record<string, unknown>) {
    const authState = useAuthStore.getState();
    if (!authState.user) return;

    await auditService.log({
      action: action as any,
      entityType: this.entityName as any,
      entityId,
      userId: authState.user.id,
      userEmail: authState.user.email,
      userRole: authState.user.role,
      metadata: extra,
    });
  }

  private computeChanges(oldData: T, newData: T): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(newData)) {
      const oldVal = JSON.stringify((oldData as any)[key]);
      const newVal = JSON.stringify((newData as any)[key]);
      if (oldVal !== newVal) {
        changes[key] = {
          old: (oldData as any)[key],
          new: (newData as any)[key],
        };
      }
    }
    return changes;
  }
}

// ============================================================
// Error Types
// ============================================================

export class RepositoryError extends Error {
  public originalError: unknown;
  public code: string;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
    this.originalError = originalError;
    this.code = (originalError as any)?.code ?? 'UNKNOWN';
  }
}

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}