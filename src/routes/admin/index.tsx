import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

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

export const adminRoutes: RouteObject[] = [
  // Settings
  { path: 'staff/settings/clinic', element: <ClinicProfilePage /> },
  { path: 'staff/settings/invoice', element: <InvoiceSettingsPage /> },
  { path: 'staff/settings/hours', element: <BusinessHoursPage /> },
  { path: 'staff/settings/audit', element: <AuditLogPage /> },
  { path: 'staff/settings/whatsapp', element: <WhatsAppSettingsPage /> },
  { path: 'staff/settings/email', element: <EmailSettingsPage /> },
  { path: 'staff/settings/modules', element: <ModuleManagerPage /> },

  // Reports
  { path: 'staff/reports/financial', element: <FinancialReportsPage /> },
  { path: 'staff/reports/clinical', element: <ClinicalReportsPage /> },
  { path: 'staff/reports/doctors', element: <DoctorReportsPage /> },
  { path: 'staff/reports/inventory', element: <InventoryReportsPage /> },
  { path: 'staff/reports/products', element: <ProductReportsPage /> },
];