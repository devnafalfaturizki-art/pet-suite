import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

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

export const protectedRoutes: RouteObject[] = [
  { index: true, element: <RoleBasedRedirect /> },
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'profile', element: <ProfilePage /> },

  // Customers
  { path: 'staff/customers', element: <CustomersPage /> },
  { path: 'staff/customers/create', element: <CreateCustomerPage /> },
  { path: 'staff/customers/:id', element: <CustomerDetailPage /> },
  { path: 'staff/customers/:id/edit', element: <EditCustomerPage /> },

  // Pets
  { path: 'staff/pets', element: <PetsPage /> },
  { path: 'staff/pets/create', element: <CreatePetPage /> },
  { path: 'staff/pets/:id', element: <PetProfilePage /> },
  { path: 'staff/pets/:id/edit', element: <EditPetPage /> },

  // Appointments
  { path: 'staff/appointments', element: <AppointmentsPage /> },
  { path: 'staff/appointments/create', element: <CreateAppointmentPage /> },
  { path: 'staff/appointments/calendar', element: <AppointmentCalendarPage /> },
  { path: 'staff/appointments/:id', element: <AppointmentDetailPage /> },

  // Inventory
  { path: 'staff/inventory', element: <InventoryPage /> },

  // POS
  { path: 'staff/pos', element: <PosPage /> },
  { path: 'staff/pos/transactions', element: <TransactionsPage /> },
  { path: 'staff/pos/transactions/:id', element: <InvoiceDetailPage /> },

  // Invoices
  { path: 'staff/invoices', element: <InvoicesPage /> },

  // Pet Shop
  { path: 'staff/petshop', element: <PetshopPage /> },
  { path: 'staff/petshop/create', element: <ProductFormPage /> },
  { path: 'staff/petshop/:id', element: <ProductDetailPage /> },
  { path: 'staff/petshop/:id/edit', element: <ProductFormPage /> },

  // Grooming
  { path: 'staff/grooming', element: <GroomingPage /> },

  // Inpatient
  { path: 'staff/inpatient', element: <InpatientPage /> },
  { path: 'staff/inpatient/:id', element: <InpatientDetailPage /> },

  // Accounting
  { path: 'staff/accounting', element: <AccountingPage /> },

  // Notifications
  { path: 'staff/notifications', element: <NotificationLogPage /> },
  { path: 'staff/notifications/templates', element: <TemplatesPage /> },
  { path: 'staff/notifications/broadcast', element: <BroadcastPage /> },

  // Medical Records (doctor)
  { path: 'doctor/medical-records', element: <MedicalRecordsPage /> },
  { path: 'doctor/medical-records/create', element: <CreateMedicalRecordPage /> },
  { path: 'doctor/medical-records/:id', element: <MedicalRecordDetailPage /> },

  // Vaccinations
  { path: 'staff/vaccinations', element: <VaccinationsPage /> },
  { path: 'staff/vaccinations/create', element: <CreateVaccinationPage /> },
  { path: 'staff/vaccinations/:id', element: <VaccinationDetailPage /> },

  // Monitoring
  { path: 'staff/monitoring', element: <MonitoringPage /> },
  { path: 'staff/monitoring/create', element: <CreateMonitoringPage /> },
  { path: 'staff/monitoring/:id', element: <MonitoringDetailPage /> },

  // Error pages
  { path: '403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
];