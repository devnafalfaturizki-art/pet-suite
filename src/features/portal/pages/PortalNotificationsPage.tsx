import { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Badge } from '@/components/ui';
import { usePortalNotifications, useMarkAllNotificationsRead } from '../portal.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Mail } from 'lucide-react';

export default function PortalNotificationsPage() {
  const notificationsQuery = usePortalNotifications();
  const markAll = useMarkAllNotificationsRead();

  useDocumentTitle('Notifications');

  const hasUnread = useMemo(() => (notificationsQuery.data || []).some((n: any) => !n.read_at), [notificationsQuery.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Messages sent to your account." />

      <div className="flex items-center justify-end">
        <Button onClick={() => markAll.mutate()} disabled={!hasUnread || markAll.isLoading}>Mark all read</Button>
      </div>

      <div className="space-y-3">
        {(notificationsQuery.data || []).map((n: any) => (
          <Card key={n.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {n.channel === 'whatsapp' ? <MessageCircle className="h-6 w-6 text-green-600" /> : <Mail className="h-6 w-6 text-blue-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{(n.template_key || '').replace(/_/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase())}</div>
                    <div className="mt-1 text-slate-900">{(n.payload?.message || '').slice(0, 150)}</div>
                  </div>
                  <div className="text-sm text-slate-500">{formatDistanceToNow(new Date(n.sent_at), { addSuffix: true })}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={n.status === 'sent' ? 'default' : 'outline'}>{n.status}</Badge>
                  {!n.read_at && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
