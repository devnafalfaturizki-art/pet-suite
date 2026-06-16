import { ReactNode } from 'react';
import { RoleGuard } from './RoleGuard';

interface RoleRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>;
}

export function StaffRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['admin', 'staff']}>{children}</RoleGuard>;
}

export function CustomerRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['customer']}>{children}</RoleGuard>;
}
