import { lazy } from 'react';
import type { UserRole } from '@/types';

// Settings
const ClinicProfilePage = lazy(() => import('@/features/settings/pages/ClinicProfilePage'));
const InvoiceSettingsPage = lazy(() => import('@/features/settings/pages/InvoiceSettingsPage'));
const BusinessHoursPage = lazy(() => import('@/features/settings/pages/BusinessHoursPage'));
const AuditLogPage = lazy(() => import('@/features/settings/pages/AuditLogPage'));
const WhatsAppSettingsPage = lazy(() => import('@/features/settings/pages/WhatsAppSettingsPage'));
const EmailSettingsPage = lazy(() => import('@/features/settings/pages/EmailSettingsPage'));
const ModuleManagerPage = lazy(() => import('@/features/settings/pages/ModuleManagerPage'));

// Reports
const DoctorReportsPage = lazy(() => import('@/features/reports/pages/DoctorReportsPage'));
const ClinicalReportsPage = lazy(() => import('@/features/reports/pages/ClinicalReportsPage'));
const FinancialReportsPage = lazy(() => import('@/features/reports/pages/FinancialReportsPage'));
const InventoryReportsPage = lazy(() => import('@/features/reports/pages/InventoryReportsPage'));
const ProductReportsPage = lazy(() => import('@/features/reports/pages/ProductReportsPage'));

export interface AdminRouteConfig {
  path: string;
  element: React.ReactNode;
  roles?: UserRole[];
}

export const adminRoutes: AdminRouteConfig[] = [
  // Settings (admin only)
  { path: 'staff/settings/clinic', element: <ClinicProfilePage />, roles: ['admin'] },
  { path: 'staff/settings/invoice', element: <InvoiceSettingsPage />, roles: ['admin'] },
  { path: 'staff/settings/hours', element: <BusinessHoursPage />, roles: ['admin'] },
  { path: 'staff/settings/audit', element: <AuditLogPage />, roles: ['admin'] },
  { path: 'staff/settings/whatsapp', element: <WhatsAppSettingsPage />, roles: ['admin'] },
  { path: 'staff/settings/email', element: <EmailSettingsPage />, roles: ['admin'] },
  { path: 'staff/settings/modules', element: <ModuleManagerPage />, roles: ['admin'] },

  // Reports (admin only)
  { path: 'staff/reports/financial', element: <FinancialReportsPage />, roles: ['admin'] },
  { path: 'staff/reports/clinical', element: <ClinicalReportsPage />, roles: ['admin'] },
  { path: 'staff/reports/doctors', element: <DoctorReportsPage />, roles: ['admin'] },
  { path: 'staff/reports/inventory', element: <InventoryReportsPage />, roles: ['admin'] },
  { path: 'staff/reports/products', element: <ProductReportsPage />, roles: ['admin'] },
];