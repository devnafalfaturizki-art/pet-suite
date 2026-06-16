export interface AuditEntry {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  metadata: Record<string, unknown>;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET'
  | 'ROLE_CHANGE'
  | 'EXPORT'
  | 'IMPORT'
  | 'VIEW_SENSITIVE';

export type AuditEntityType =
  | 'user'
  | 'customer'
  | 'pet'
  | 'appointment'
  | 'medical_record'
  | 'vaccination'
  | 'monitoring'
  | 'inpatient'
  | 'grooming'
  | 'invoice'
  | 'payment'
  | 'inventory'
  | 'product'
  | 'prescription'
  | 'settings'
  | 'module'
  | 'notification';

export interface AuditFilter {
  action?: AuditAction;
  entityType?: AuditEntityType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}