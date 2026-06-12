import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalCustomerId, usePortalGroomingRecords } from '../portal.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/lib/utils';

export default function PortalGroomingPage() {
  const user = useAuthStore((s) => s.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const recordsQuery = usePortalGroomingRecords(customerIdQuery.data ?? undefined);

  useDocumentTitle('My Grooming');

  return (
    <div className="space-y-6">
      <PageHeader title="My Grooming" description="View your pet grooming history and scheduled services." />

      {recordsQuery.isLoading ? (
        <Card className="p-6">Loading grooming records...</Card>
      ) : !recordsQuery.data?.length ? (
        <Card className="p-6">No grooming records found.</Card>
      ) : (
        <div className="space-y-4">
          {recordsQuery.data.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{r.petName}</div>
                  <h3 className="text-lg font-semibold">{r.serviceName}</h3>
                  <div className="text-sm text-slate-500">{formatDate(r.scheduledAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">{r.status}</div>
                  <div className="mt-2">
                    <Button variant="outline" asChild>
                      <a href={`/portal/grooming/${r.id}`}>Details</a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
