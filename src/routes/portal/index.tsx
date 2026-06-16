import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const PortalOverviewPage = lazy(() => import('@/features/portal/pages/PortalOverviewPage'));
const PortalPetsPage = lazy(() => import('@/features/portal/pages/PortalPetsPage'));
const PortalPetProfilePage = lazy(() => import('@/features/portal/pages/PortalPetProfilePage'));
const PortalAppointmentsPage = lazy(() => import('@/features/portal/pages/PortalAppointmentsPage'));
const PortalInpatientPage = lazy(() => import('@/features/portal/pages/PortalInpatientPage'));
const PortalGroomingPage = lazy(() => import('@/features/portal/pages/PortalGroomingPage'));
const PortalNotificationsPage = lazy(() => import('@/features/portal/pages/PortalNotificationsPage'));
const PortalProfilePage = lazy(() => import('@/features/portal/pages/PortalProfilePage'));
const PortalInvoicesPage = lazy(() => import('@/features/portal/pages/PortalInvoicesPage'));

export const portalRoutes: RouteObject[] = [
  { index: true, element: <PortalOverviewPage /> },
  { path: 'pets', element: <PortalPetsPage /> },
  { path: 'pets/:id', element: <PortalPetProfilePage /> },
  { path: 'appointments', element: <PortalAppointmentsPage /> },
  { path: 'inpatient', element: <PortalInpatientPage /> },
  { path: 'grooming', element: <PortalGroomingPage /> },
  { path: 'notifications', element: <PortalNotificationsPage /> },
  { path: 'profile', element: <PortalProfilePage /> },
  { path: 'invoices', element: <PortalInvoicesPage /> },
];