import { useMemo, useState } from 'react';
import { inpatientService } from '../inpatient.service';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Textarea } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { CartItem } from '@/features/pos/pos.types';
import type { InpatientRecord } from '../inpatient.types';

interface DischargeModalProps {
  inpatientRecord: InpatientRecord;
  pendingBill: { items: CartItem[]; total: number };
  onSuccess: () => void;
  onClose: () => void;
}

export function DischargeModal({ inpatientRecord, pendingBill, onSuccess, onClose }: DischargeModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'e-wallet'>('cash');
  const [paidAmount, setPaidAmount] = useState(pendingBill.total);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const changeAmount = useMemo(() => paidAmount - pendingBill.total, [paidAmount, pendingBill.total]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    if (!paymentMethod) {
      setError('Payment method is required.');
      return;
    }

    if (paidAmount < pendingBill.total) {
      setError('Paid amount must cover the total bill.');
      return;
    }

    setIsSaving(true);
    try {
      await inpatientService.dischargePet(inpatientRecord.id, {
        paymentMethod,
        paidAmount,
        notes
      });
      toast.success('Pet discharged');
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Unable to discharge pet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Discharge {inpatientRecord.id}</DialogTitle>
          <DialogDescription>Finalize payment and release the cage for the next inpatient.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="font-semibold text-slate-900">Billing summary</div>
              <div className="text-sm text-slate-600">Total: {formatCurrency(pendingBill.total)}</div>
            </div>
            <div className="mt-4 space-y-3">
              {pendingBill.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-4 text-sm text-slate-700">
                  <div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)}</div>
                  </div>
                  <div className="text-right text-slate-900">{formatCurrency(item.total)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 text-right text-sm font-semibold text-slate-900">
              Current total: {formatCurrency(pendingBill.total)}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as any)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="e-wallet">E-Wallet</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Paid amount</label>
              <Input
                type="number"
                min={0}
                value={String(paidAmount)}
                onChange={(event) => setPaidAmount(Number(event.target.value))}
              />
            </div>
          </div>

          {paymentMethod === 'cash' ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Change: {formatCurrency(changeAmount)}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </div>

          {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
            <Button onClick={handleSubmit} type="button" disabled={isSaving}>{isSaving ? 'Processing…' : 'Discharge & Pay'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
