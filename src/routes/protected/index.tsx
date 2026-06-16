import { lazy } from 'react';
import type { UserRole, ModuleKey } from '@/types';

// Dashboard
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));

// Appointments
const AppointmentsPage = lazy(() => import('@/features/appointments/pages/AppointmentsPage'));
const AppointmentCalendarPage = lazy(() => import('@/features/appointments/pages/AppointmentCalendarPage'));
const CreateAppointmentPage = lazy(() => import('@/features/appointments/pages/CreateAppointmentPage'));
const AppointmentDetailPage = lazy(() => import('@/features/appointments/pages/AppointmentDetailPage'));

// Customers
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'));
const CreateCustomerPage = lazy(() => import('@/features/customers/pages/CreateCustomerPage'));
const CustomerDetailPage = lazy(() => import('@/features/customers/pages/CustomerDetailPage'));
const EditCustomerPage = lazy(() => import('@/features/customers/pages/EditCustomerPage'));

// Pets
const PetsPage = lazy(() => import('@/features/pets/pages/PetsPage'));
const CreatePetPage = lazy(() => import('@/features/pets/pages/CreatePetPage'));
const PetProfilePage = lazy(() => import('@/features/pets/pages/PetProfilePage'));
const EditPetPage = lazy(() => import('@/features/pets/pages/EditPetPage'));

// Medical Records
const MedicalRecordsPage = lazy(() => import('@/features/medical-records/pages/MedicalRecordsPage'));
const CreateMedicalRecordPage = lazy(() => import('@/features/medical-records/pages/CreateMedicalRecordPage'));
const MedicalRecordDetailPage = lazy(() => import('@/features/medical-records/pages/MedicalRecordDetailPage'));

// Vaccinations
const VaccinationsPage = lazy(() => import('@/features/vaccinations/pages/VaccinationsPage'));
const CreateVaccinationPage = lazy(() => import('@/features/vaccinations/pages/CreateVaccinationPage'));
const VaccinationDetailPage = lazy(() => import('@/features/vaccinations/pages/VaccinationDetailPage'));

// Monitoring
const MonitoringPage = lazy(() => import('@/features/monitoring/pages/MonitoringPage'));
const CreateMonitoringPage = lazy(() => import('@/features/monitoring/pages/CreateMonitoringPage'));
const MonitoringDetailPage = lazy(() => import('@/features/monitoring/pages/MonitoringDetailPage'));

// Inpatient
const InpatientPage = lazy(() => import('@/features/inpatient/pages/InpatientPage'));
const InpatientDetailPage = lazy(() => import('@/features/inpatient/pages/InpatientDetailPage'));

// Grooming
const GroomingPage = lazy(() => import('@/features/grooming/pages/GroomingPage'));

// Inventory
const InventoryPage = lazy(() => import('@/features/inventory/pages/InventoryPage'));

// POS
const PosPage = lazy(() => import('@/features/pos/pages/PosPage'));
const TransactionsPage = lazy(() => import('@/features/pos/pages/TransactionsPage'));
const InvoiceDetailPage = lazy(() => import('@/features/pos/pages/InvoiceDetailPage'));

// Invoices
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));

// Pet Shop
const PetshopPage = lazy(() => import('@/features/petshop/pages/PetshopPage'));
const ProductFormPage = lazy(() => import('@/features/petshop/pages/ProductFormPage'));
const ProductDetailPage = lazy(() => import('@/features/petshop/pages/ProductDetailPage'));

// Accounting
const AccountingPage = lazy(() => import('@/features/accounting/pages/AccountingPage'));

// Notifications
const NotificationLogPage = lazy(() => import('@/features/notifications/pages/NotificationLogPage'));
const TemplatesPage = lazy(() => import('@/features/notifications/pages/TemplatesPage'));
const BroadcastPage = lazy(() => import('@/features/notifications/pages/BroadcastPage'));

// Profile
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

// Role-based redirect
const RoleBasedRedirect = lazy(() => import('@/features/auth/RoleBasedRedirect'));

// Error pages
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export interface ProtectedRouteConfig {
  path?: string;
  index?: boolean;
  element: React.ReactNode;
  roles?: UserRole[];
  moduleKey?: ModuleKey;
}

export const protectedRoutes: ProtectedRouteConfig[] = [
  { index: true, element: <RoleBasedRedirect /> },
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'profile', element: <ProfilePage />, roles: ['admin', 'staff', 'customer'] },

  // Customers
  { path: 'staff/customers', element: <CustomersPage />, roles: ['admin', 'staff'] },
  { path: 'staff/customers/create', element: <CreateCustomerPage />, roles: ['admin', 'staff'] },
  { path: 'staff/customers/:id', element: <CustomerDetailPage />, roles: ['admin', 'staff'] },
  { path: 'staff/customers/:id/edit', element: <EditCustomerPage />, roles: ['admin', 'staff'] },

  // Pets
  { path: 'staff/pets', element: <PetsPage />, roles: ['admin', 'staff', 'customer'] },
  { path: 'staff/pets/create', element: <CreatePetPage />, roles: ['admin', 'staff'] },
  { path: 'staff/pets/:id', element: <PetProfilePage />, roles: ['admin', 'staff', 'customer'] },
  { path: 'staff/pets/:id/edit', element: <EditPetPage />, roles: ['admin', 'staff'] },

  // Appointments
  { path: 'staff/appointments', element: <AppointmentsPage />, roles: ['admin', 'staff'] },
  { path: 'staff/appointments/create', element: <CreateAppointmentPage />, roles: ['admin', 'staff'] },
  { path: 'staff/appointments/calendar', element: <AppointmentCalendarPage />, roles: ['admin', 'staff'] },
  { path: 'staff/appointments/:id', element: <AppointmentDetailPage />, roles: ['admin', 'staff'] },

  // Inventory
  { path: 'staff/inventory', element: <InventoryPage />, roles: ['admin', 'staff'] },

  // POS
  { path: 'staff/pos', element: <PosPage />, roles: ['admin', 'staff'] },
  { path: 'staff/pos/transactions', element: <TransactionsPage />, roles: ['admin', 'staff'] },
  { path: 'staff/pos/transactions/:id', element: <InvoiceDetailPage />, roles: ['admin', 'staff'] },

  // Invoices
  { path: 'staff/invoices', element: <InvoicesPage />, roles: ['admin', 'staff'] },

  // Pet Shop
  { path: 'staff/petshop', element: <PetshopPage />, roles: ['admin', 'staff'] },
  { path: 'staff/petshop/create', element: <ProductFormPage />, roles: ['admin', 'staff'] },
  { path: 'staff/petshop/:id', element: <ProductDetailPage />, roles: ['admin', 'staff'] },
  { path: 'staff/petshop/:id/edit', element: <ProductFormPage />, roles: ['admin', 'staff'] },

  // Grooming
  { path: 'staff/grooming', element: <GroomingPage />, roles: ['admin', 'staff'] },

  // Inpatient
  { path: 'staff/inpatient', element: <InpatientPage />, roles: ['admin', 'staff'] },
  { path: 'staff/inpatient/:id', element: <InpatientDetailPage />, roles: ['admin', 'staff'] },

  // Accounting
  { path: 'staff/accounting', element: <AccountingPage />, roles: ['admin', 'staff'] },

  // Notifications
  { path: 'staff/notifications', element: <NotificationLogPage />, roles: ['admin', 'staff'] },
  { path: 'staff/notifications/templates', element: <TemplatesPage />, roles: ['admin', 'staff'] },
  { path: 'staff/notifications/broadcast', element: <BroadcastPage />, roles: ['admin', 'staff'] },

  // Medical Records (admin only)
  { path: 'doctor/medical-records', element: <MedicalRecordsPage />, roles: ['admin'] },
  { path: 'doctor/medical-records/create', element: <CreateMedicalRecordPage />, roles: ['admin'] },
  { path: 'doctor/medical-records/:id', element: <MedicalRecordDetailPage />, roles: ['admin'] },

  // Vaccinations
  { path: 'staff/vaccinations', element: <VaccinationsPage />, roles: ['admin', 'staff'] },
  { path: 'staff/vaccinations/create', element: <CreateVaccinationPage />, roles: ['admin', 'staff'] },
  { path: 'staff/vaccinations/:id', element: <VaccinationDetailPage />, roles: ['admin', 'staff'] },

  // Monitoring
  { path: 'staff/monitoring', element: <MonitoringPage />, roles: ['admin', 'staff'] },
  { path: 'staff/monitoring/create', element: <CreateMonitoringPage />, roles: ['admin', 'staff'] },
  { path: 'staff/monitoring/:id', element: <MonitoringDetailPage />, roles: ['admin', 'staff'] },

  // Error pages
  { path: '403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
];