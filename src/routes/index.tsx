import { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { CustomerRoute } from '@/features/auth/RoleRoutes';
import { ModuleGuard } from '@/features/auth/ModuleGuard';
import { RoleGuard } from '@/features/auth/RoleGuard';
import PublicLayout from '@/features/website/PublicLayout';
import PortalLayout from '@/features/portal/PortalLayout';
import { PageTransition } from '@/components/common/PageTransition';
import { PageLoader } from '@/components/common/PageLoader';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SuspenseWithTimeout from '@/components/common/SuspenseWithTimeout';
import PageSkeleton from '@/components/common/PageSkeleton';
import { authRoutes } from './auth';
import { publicRoutes } from './public';
import { portalRoutes } from './portal';
import { protectedRoutes } from './protected';
import { adminRoutes } from './admin';
import type { ModuleKey, UserRole } from '@/types';

// Wrapper components for guards
function GuardedRoute({ element, roles, moduleKey }: { element: React.ReactNode; roles?: UserRole[]; moduleKey?: ModuleKey }) {
  const wrapped = (
    <ErrorBoundary>
      <SuspenseWithTimeout fallback={<PageSkeleton />} timeout={15000}>
        <PageTransition>
          {element}
        </PageTransition>
      </SuspenseWithTimeout>
    </ErrorBoundary>
  );

  const withModule = moduleKey ? <ModuleGuard moduleKey={moduleKey}>{wrapped}</ModuleGuard> : wrapped;
  return roles ? <RoleGuard allowedRoles={roles}>{withModule}</RoleGuard> : withModule;
}

function renderRoutes(routes: Array<{ path?: string; index?: boolean; element: React.ReactNode; roles?: UserRole[]; moduleKey?: ModuleKey }>) {
  return routes.map((route) => {
    const guardedElement = <GuardedRoute element={route.element} roles={route.roles} moduleKey={route.moduleKey} />;
    if (route.index) {
      return <Route key="index" index element={guardedElement} />;
    }
    return <Route key={route.path} path={route.path} element={guardedElement} />;
  });
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      {authRoutes.map((route) => (
        <Route
          key={route.path ?? 'auth-login'}
          path={route.path ?? '/login'}
          element={
            <ErrorBoundary>
              <SuspenseWithTimeout fallback={<PageLoader />} timeout={15000}>
                <PageTransition>
                  {route.element}
                </PageTransition>
              </SuspenseWithTimeout>
            </ErrorBoundary>
          }
        />
      ))}

      {/* Public website routes */}
      <Route element={<PublicLayout />}>
        {publicRoutes.map((route) => (
          route.index ? (
            <Route
              key="public-index"
              index
              element={
                <ErrorBoundary>
                  <SuspenseWithTimeout fallback={<PageLoader />} timeout={15000}>
                    <PageTransition>
                      {route.element}
                    </PageTransition>
                  </SuspenseWithTimeout>
                </ErrorBoundary>
              }
            />
          ) : (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ErrorBoundary>
                  <SuspenseWithTimeout fallback={<PageLoader />} timeout={15000}>
                    <PageTransition>
                      {route.element}
                    </PageTransition>
                  </SuspenseWithTimeout>
                </ErrorBoundary>
              }
            />
          )
        ))}
      </Route>

      {/* Customer portal routes */}
      <Route element={<AuthGuard><PortalLayout /></AuthGuard>}>
        <Route path="/portal" element={<CustomerRoute><Outlet /></CustomerRoute>}>
          {portalRoutes.map((route) => (
            route.index ? (
              <Route
                key="portal-index"
                index
                element={
                  <ErrorBoundary>
                    <SuspenseWithTimeout fallback={<PageLoader />} timeout={15000}>
                      <PageTransition>
                        {route.element}
                      </PageTransition>
                    </SuspenseWithTimeout>
                  </ErrorBoundary>
                }
              />
            ) : (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ErrorBoundary>
                    <SuspenseWithTimeout fallback={<PageLoader />} timeout={15000}>
                      <PageTransition>
                        {route.element}
                      </PageTransition>
                    </SuspenseWithTimeout>
                  </ErrorBoundary>
                }
              />
            )
          ))}
        </Route>
      </Route>

      {/* Protected staff routes */}
      <Route element={<AuthGuard><AppShell /></AuthGuard>}>
        {renderRoutes(protectedRoutes)}
        {/* Admin routes (settings + reports) with role guards */}
        {renderRoutes(adminRoutes)}
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}