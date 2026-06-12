import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import {
  usePortalSummary,
  usePortalCustomer,
  usePortalCustomerId,
  usePortalInpatientRecords,
  usePortalGroomingRecords,
  usePortalNotifications,
} from '../portal.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/lib/utils';

export default function PortalOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const customerQuery = usePortalCustomer(user?.id);
  const summaryQuery = usePortalSummary(customerIdQuery.data ?? undefined);

  const inpatientQuery = usePortalInpatientRecords(customerIdQuery.data ?? undefined);
  const groomingQuery = usePortalGroomingRecords(customerIdQuery.data ?? undefined);
  const notificationsQuery = usePortalNotifications();

  useDocumentTitle('My Dashboard');

  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" description="Overview of your pets, appointments, and recent activity." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-slate-500">Pet count</div>
          <div className="mt-4 text-3xl font-semibold">{summaryQuery.data?.petCount ?? '-'}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-500">Upcoming appointments</div>
          <div className="mt-4 text-3xl font-semibold">{summaryQuery.data?.appointmentCount ?? '-'}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-500">Invoices</div>
          <div className="mt-4 text-3xl font-semibold">{summaryQuery.data?.invoiceCount ?? '-'}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Active Inpatient</div>
          <h3 className="text-lg font-semibold mt-2">{inpatientQuery.isLoading ? 'Loading…' : `${inpatientQuery.data?.length ?? 0} active record(s)`}</h3>

          <div className="mt-3 space-y-2">
            {inpatientQuery.data && inpatientQuery.data.length ? (
              inpatientQuery.data.slice(0, 3).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.pet_name || r.petName}</div>
                    <div className="text-xs text-slate-500">Admitted {formatDate(r.admitted_at || r.created_at)}</div>
                  </div>
                  <div>
                    <a className="text-sm text-blue-600" href="/portal/inpatient">Details</a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No active inpatient records.</div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Recent Notifications</div>
              <h3 className="text-lg font-semibold mt-2">{notificationsQuery.isLoading ? 'Loading…' : `${notificationsQuery.data?.length ?? 0} notifications`}</h3>
            </div>
            <div>
              <Button variant="ghost" asChild>
                <a href="/portal/notifications">View all</a>
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(notificationsQuery.data || []).slice(0, 4).map((n: any) => (
              <div key={n.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm">{(n.payload?.message || '').slice(0, 80)}</div>
                  <div className="text-xs text-slate-500">{formatDate(n.sent_at)}</div>
                </div>
                <div className="text-sm text-slate-500">{n.status}</div>
              </div>
            ))}
            {!notificationsQuery.data?.length && <div className="text-sm text-slate-500">No notifications yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
