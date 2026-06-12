import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge, Button, Input } from '@/components/ui';
import { useNotificationLogs, useRetryNotification, useMarkAsRead, useMarkAllRead } from '../notifications.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { MessageSquare, Mail } from 'lucide-react';

export default function NotificationLogPage() {
  useDocumentTitle('Notification Log');
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const params = { page, pageSize: 50, status: status || undefined, channel: channel || undefined, from: from || undefined, to: to || undefined };
  const { data, isLoading } = useNotificationLogs(params);
  const retry = useRetryNotification();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllRead();

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Log" description="History of sent notifications" />

      <div className="grid gap-4 md:grid-cols-4">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
        <div>
          <label className="sr-only">Channel</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm">
            <option value="">All channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label className="sr-only">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setPage(1)}>Refresh</Button>
        <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isLoading}>Mark all read</Button>
      </div>

      <div>
        <DataTable
          columns={[
            {
              key: 'sentAt',
              header: 'Sent At',
              render: (r: any) => r.sent_at ? new Date(r.sent_at).toLocaleString() : '-'
            },
            {
              key: 'channel',
              header: 'Channel',
              render: (r: any) => {
                const color = r.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800';
                const Icon = r.channel === 'whatsapp' ? MessageSquare : Mail;
                return (
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
                    <Icon className="w-3.5 h-3.5" /> {r.channel.toUpperCase()}
                  </span>
                );
              }
            },
            { key: 'recipient', header: 'Recipient' },
            { key: 'template', header: 'Template', render: (r: any) => r.template_key || '-' },
            {
              key: 'status',
              header: 'Status',
              render: (r: any) => r.status === 'success' ? <Badge className="bg-green-100 text-green-800">Success</Badge> : (r.status === 'failed' ? <Badge className="bg-red-100 text-red-800">Failed</Badge> : <Badge className="bg-amber-100 text-amber-800">Pending</Badge>)
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (r: any) => r.status === 'failed' ? (
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); retry.mutate(r.id); }}>Retry</Button>
              ) : null
            }
          ]}
          data={items as any}
          isLoading={isLoading}
          pagination={{ page, pageSize: 50, total: data?.total ?? 0 }}
          onPageChange={(nextPage) => setPage(nextPage)}
          emptyTitle="No notifications"
          emptyDescription="Try a different filter or date range."
        />
      </div>
    </div>
  );
}
