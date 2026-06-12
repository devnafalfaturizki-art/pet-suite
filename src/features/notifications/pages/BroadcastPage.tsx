import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useTemplates, useBroadcast } from '../notifications.hooks';
import { notificationsService } from '../notifications.service';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const segments = [
  { value: 'all', label: 'All Customers' },
  { value: 'vip', label: 'VIP Customers' },
  { value: 'upcoming_vaccination', label: 'Vaccination Due (next 30 days)' }
];

export default function BroadcastPage() {
  useDocumentTitle('Broadcast Message');
  const { data: templates = [] } = useTemplates();
  const broadcast = useBroadcast();
  const [templateKey, setTemplateKey] = useState('');
  const [segment, setSegment] = useState('all');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  const selectedSegment = segments.find((item) => item.value === segment);

  async function handleEstimate() {
    setIsEstimating(true);
    try {
      const count = await notificationsService.getBroadcastCount(segment);
      setRecipientCount(count);
    } catch (error) {
      toast.error('Unable to estimate recipients');
    } finally {
      setIsEstimating(false);
    }
  }

  async function handleSend() {
    if (!templateKey || !recipientCount) return;
    try {
      toast.loading('Sending broadcast...', { id: 'broadcast' });
      const count = await broadcast.mutateAsync({ templateKey, segment, message });
      toast.dismiss('broadcast');
      toast.success(`Broadcast sent to ${count} recipients`);
      setMessage('');
    } catch (error) {
      toast.dismiss('broadcast');
      toast.error('Failed to send broadcast');
    } finally {
      setConfirmOpen(false);
    }
  }

  const canSend = !!templateKey && !!message && !!recipientCount;

  return (
    <div className="space-y-6">
      <PageHeader title="Broadcast Message" description="Send broadcast messages to customer segments" />
      <Card className="p-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Template</label>
            <select value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
              <option value="">Select template</option>
              {templates.map((t: any) => <option key={t.id} value={t.key}>{t.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Recipient group</label>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
              {segments.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Estimated recipients</label>
              <Button variant="outline" size="sm" onClick={handleEstimate} disabled={isEstimating}>Estimate</Button>
            </div>
            <p className="mt-2 text-sm text-slate-500">{isEstimating ? 'Estimating…' : recipientCount !== null ? `${recipientCount} recipients` : 'No estimate yet'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2" rows={6} />
          </div>

          <div className="flex justify-end">
            <Button disabled={!canSend} onClick={() => setConfirmOpen(true)}>Send Broadcast</Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send broadcast"
        description={`This will send to ${recipientCount ?? 0} recipients via ${selectedSegment?.label}. Continue?`}
        onConfirm={handleSend}
        isLoading={broadcast.isLoading}
        variant="warning"
      />
    </div>
  );
}
