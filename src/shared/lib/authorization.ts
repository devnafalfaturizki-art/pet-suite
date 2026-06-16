/**
 * Application-level authorization utilities.
 * 
 * CRITICAL: Never use supabase auth.role() for application authorization.
 * auth.role() only returns 'anon', 'authenticated', or 'service_role'.
 * Application roles must use the profiles table.
 */

import type { UserRole } from '@/types';

export type Permission = 
  | 'appointment:create'
  | 'appointment:read'
  | 'appointment:update'
  | 'appointment:delete'
  | 'appointment:checkin'
  | 'medical:create'
  | 'medical:read'
  | 'medical:update'
  | 'vaccination:create'
  | 'vaccination:read'
  | 'billing:create'
  | 'billing:read'
  | 'billing:update'
  | 'billing:delete'
  | 'inventory:read'
  | 'inventory:update'
  | 'customer:create'
  | 'customer:read'
  | 'customer:update'
  | 'pet:create'
  | 'pet:read'
  | 'pet:update'
  | 'reports:read'
  | 'settings:read'
  | 'settings:update'
  | 'users:manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete', 'appointment:checkin',
    'medical:create', 'medical:read', 'medical:update',
    'vaccination:create', 'vaccination:read',
    'billing:create', 'billing:read', 'billing:update', 'billing:delete',
    'inventory:read', 'inventory:update',
    'customer:create', 'customer:read', 'customer:update',
    'pet:create', 'pet:read', 'pet:update',
    'reports:read',
    'settings:read', 'settings:update',
    'users:manage',
  ],
  doctor: [
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:checkin',
    'medical:create', 'medical:read', 'medical:update',
    'vaccination:create', 'vaccination:read',
    'billing:read',
    'customer:read',
    'pet:create', 'pet:read', 'pet:update',
  ],
  staff: [
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:checkin',
    'medical:read',
    'vaccination:read',
    'billing:create', 'billing:read', 'billing:update',
    'inventory:read', 'inventory:update',
    'customer:create', 'customer:read', 'customer:update',
    'pet:create', 'pet:read', 'pet:update',
  ],
  cashier: [
    'appointment:read',
    'billing:create', 'billing:read', 'billing:update',
    'customer:read',
    'pet:read',
  ],
  customer: [
    'appointment:read',
    'billing:read',
    'customer:read',
    'pet:read',
  ],
};

export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: UserRole | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}