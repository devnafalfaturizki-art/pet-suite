import { Component, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import PublicLayout from '@/features/website/PublicLayout';
import { publicRoutes } from '@/router/route-config';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { CustomerRoute } from '@/features/auth/RoleRoutes';
import PortalLayout from '@/features/portal/PortalLayout';
import PortalOverviewPage from '@/features/portal/pages/PortalOverviewPage';
import PortalPetsPage from '@/features/portal/pages/PortalPetsPage';
import PortalAppointmentsPage from '@/features/portal/pages/PortalAppointmentsPage';
import PortalInvoicesPage from '@/features/portal/pages/PortalInvoicesPage';
import PortalPetProfilePage from '@/features/portal/pages/PortalPetProfilePage';
import PortalInpatientPage from '@/features/portal/pages/PortalInpatientPage';
import PortalGroomingPage from '@/features/portal/pages/PortalGroomingPage';
import PortalNotificationsPage from '@/features/portal/pages/PortalNotificationsPage';
import PortalProfilePage from '@/features/portal/pages/PortalProfilePage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { protectedRoutes, renderProtectedRoute } from '@/router/route-config';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * Top-level error boundary for the entire router.
 * Catches any unhandled errors during route rendering.
 */
class RouterErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Router] Fatal error:', error.message, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Application Error
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              A critical error occurred. Please try reloading the application.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-h-24 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <code>{this.state.error.message}</code>
              </pre>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppRoutes() {
  return (
    <RouterErrorBoundary>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Public website routes */}
        <Route element={<PublicLayout />}>
          {publicRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* Customer portal routes */}
        <Route element={<AuthGuard><PortalLayout /></AuthGuard>}>
          <Route path="/portal" element={<CustomerRoute><PortalOverviewPage /></CustomerRoute>} />
          <Route path="/portal/pets" element={<CustomerRoute><PortalPetsPage /></CustomerRoute>} />
          <Route path="/portal/pets/:id" element={<CustomerRoute><PortalPetProfilePage /></CustomerRoute>} />
          <Route path="/portal/appointments" element={<CustomerRoute><PortalAppointmentsPage /></CustomerRoute>} />
          <Route path="/portal/inpatient" element={<CustomerRoute><PortalInpatientPage /></CustomerRoute>} />
          <Route path="/portal/grooming" element={<CustomerRoute><PortalGroomingPage /></CustomerRoute>} />
          <Route path="/portal/notifications" element={<CustomerRoute><PortalNotificationsPage /></CustomerRoute>} />
          <Route path="/portal/profile" element={<CustomerRoute><PortalProfilePage /></CustomerRoute>} />
          <Route path="/portal/invoices" element={<CustomerRoute><PortalInvoicesPage /></CustomerRoute>} />
        </Route>

        {/* Protected staff routes */}
        <Route element={<AuthGuard><AppShell /></AuthGuard>}>
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={renderProtectedRoute(route)} />
          ))}
          <Route path="403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </RouterErrorBoundary>
  );
}