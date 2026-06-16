import type { UserRole, ModuleKey } from '@/types';

// ============================================================
// Permission System
// Role-based access control with granular action-level permissions
// ============================================================

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'restore'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'transfer'
  | 'discharge'
  | 'refund'
  | 'cancel'
  | 'reschedule';

export type PermissionResource =
  | 'appointments'
  | 'customers'
  | 'pets'
  | 'medical_records'
  | 'vaccinations'
  | 'monitoring'
  | 'inpatient'
  | 'grooming'
  | 'inventory'
  | 'pos'
  | 'invoices'
  | 'accounting'
  | 'petshop'
  | 'reports'
  | 'settings'
  | 'notifications'
  | 'users'
  | 'audit_logs'
  | 'portal';

export interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
  conditions?: Record<string, unknown>;
}

// ============================================================
// Role Definitions
// ============================================================

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    { action: 'create', resource: 'appointments' },
    { action: 'read', resource: 'appointments' },
    { action: 'update', resource: 'appointments' },
    { action: 'delete', resource: 'appointments' },
    { action: 'cancel', resource: 'appointments' },
    { action: 'reschedule', resource: 'appointments' },
    { action: 'create', resource: 'customers' },
    { action: 'read', resource: 'customers' },
    { action: 'update', resource: 'customers' },
    { action: 'delete', resource: 'customers' },
    { action: 'create', resource: 'pets' },
    { action: 'read', resource: 'pets' },
    { action: 'update', resource: 'pets' },
    { action: 'delete', resource: 'pets' },
    { action: 'create', resource: 'medical_records' },
    { action: 'read', resource: 'medical_records' },
    { action: 'update', resource: 'medical_records' },
    { action: 'delete', resource: 'medical_records' },
    { action: 'create', resource: 'vaccinations' },
    { action: 'read', resource: 'vaccinations' },
    { action: 'update', resource: 'vaccinations' },
    { action: 'delete', resource: 'vaccinations' },
    { action: 'create', resource: 'monitoring' },
    { action: 'read', resource: 'monitoring' },
    { action: 'update', resource: 'monitoring' },
    { action: 'delete', resource: 'monitoring' },
    { action: 'create', resource: 'inpatient' },
    { action: 'read', resource: 'inpatient' },
    { action: 'update', resource: 'inpatient' },
    { action: 'delete', resource: 'inpatient' },
    { action: 'discharge', resource: 'inpatient' },
    { action: 'create', resource: 'grooming' },
    { action: 'read', resource: 'grooming' },
    { action: 'update', resource: 'grooming' },
    { action: 'delete', resource: 'grooming' },
    { action: 'create', resource: 'inventory' },
    { action: 'read', resource: 'inventory' },
    { action: 'update', resource: 'inventory' },
    { action: 'delete', resource: 'inventory' },
    { action: 'create', resource: 'pos' },
    { action: 'read', resource: 'pos' },
    { action: 'update', resource: 'pos' },
    { action: 'refund', resource: 'pos' },
    { action: 'create', resource: 'invoices' },
    { action: 'read', resource: 'invoices' },
    { action: 'update', resource: 'invoices' },
    { action: 'delete', resource: 'invoices' },
    { action: 'create', resource: 'accounting' },
    { action: 'read', resource: 'accounting' },
    { action: 'update', resource: 'accounting' },
    { action: 'export', resource: 'accounting' },
    { action: 'create', resource: 'petshop' },
    { action: 'read', resource: 'petshop' },
    { action: 'update', resource: 'petshop' },
    { action: 'delete', resource: 'petshop' },
    { action: 'read', resource: 'reports' },
    { action: 'export', resource: 'reports' },
    { action: 'create', resource: 'settings' },
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
    { action: 'create', resource: 'notifications' },
    { action: 'read', resource: 'notifications' },
    { action: 'update', resource: 'notifications' },
    { action: 'read', resource: 'audit_logs' },
    { action: 'export', resource: 'audit_logs' },
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users' },
  ],
  staff: [
    { action: 'create', resource: 'appointments' },
    { action: 'read', resource: 'appointments' },
    { action: 'update', resource: 'appointments' },
    { action: 'cancel', resource: 'appointments' },
    { action: 'create', resource: 'customers' },
    { action: 'read', resource: 'customers' },
    { action: 'update', resource: 'customers' },
    { action: 'create', resource: 'pets' },
    { action: 'read', resource: 'pets' },
    { action: 'update', resource: 'pets' },
    { action: 'read', resource: 'medical_records' },
    { action: 'create', resource: 'vaccinations' },
    { action: 'read', resource: 'vaccinations' },
    { action: 'read', resource: 'monitoring' },
    { action: 'read', resource: 'inpatient' },
    { action: 'create', resource: 'grooming' },
    { action: 'read', resource: 'grooming' },
    { action: 'update', resource: 'grooming' },
    { action: 'read', resource: 'inventory' },
    { action: 'update', resource: 'inventory' },
    { action: 'create', resource: 'pos' },
    { action: 'read', resource: 'pos' },
    { action: 'create', resource: 'invoices' },
    { action: 'read', resource: 'invoices' },
    { action: 'read', resource: 'petshop' },
    { action: 'read', resource: 'notifications' },
  ],
  customer: [
    { action: 'read', resource: 'appointments', conditions: { owner: true } },
    { action: 'cancel', resource: 'appointments', conditions: { owner: true } },
    { action: 'read', resource: 'customers', conditions: { self: true } },
    { action: 'update', resource: 'customers', conditions: { self: true } },
    { action: 'read', resource: 'pets', conditions: { owner: true } },
    { action: 'read', resource: 'medical_records', conditions: { owner: true } },
    { action: 'read', resource: 'vaccinations', conditions: { owner: true } },
    { action: 'read', resource: 'invoices', conditions: { owner: true } },
    { action: 'read', resource: 'notifications', conditions: { owner: true } },
    { action: 'read', resource: 'portal' },
  ],
};

// ============================================================
// Permission Check Functions
// ============================================================

export function hasPermission(
  role: UserRole | null,
  action: PermissionAction,
  resource: PermissionResource
): boolean {
  if (!role) return false;
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return permissions.some(
    (p) => p.action === action && p.resource === resource
  );
}

export function can(role: UserRole | null): {
  create: (resource: PermissionResource) => boolean;
  read: (resource: PermissionResource) => boolean;
  update: (resource: PermissionResource) => boolean;
  delete: (resource: PermissionResource) => boolean;
} {
  return {
    create: (resource) => hasPermission(role, 'create', resource),
    read: (resource) => hasPermission(role, 'read', resource),
    update: (resource) => hasPermission(role, 'update', resource),
    delete: (resource) => hasPermission(role, 'delete', resource),
  };
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

export function getResourcesForRole(role: UserRole): PermissionResource[] {
  const perms = rolePermissions[role] ?? [];
  return [...new Set(perms.map((p) => p.resource))];
}