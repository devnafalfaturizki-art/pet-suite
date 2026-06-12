import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import { Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
import { posService } from '../pos.service';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '../pos.types';

interface LoadInpatientBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (items: CartItem[], inpatientRecordId: string) => void;
}

interface InpatientRecordSummary {
  id: string;
  petName: string | null;
  customerName: string | null;
  admitDate: string;
  daysAdmitted: number;
  estimatedBill: number;
}

export function LoadInpatientBillModal({ open, onOpenChange, onLoad }: LoadInpatientBillModalProps) {
  const [records, setRecords] = useState<InpatientRecordSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId]
  );

  useEffect(() => {
    let active = true;

    async function fetchRecords() {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from('inpatient_records')
          .select('id,admit_date,pets(name,customers(full_name)),inpatient_medications(id,unit_price,quantity),inpatient_services(id,price)')
          .eq('status', 'admitted')
          .order('admit_date', { ascending: true })
          .limit(20);

        if (error) throw error;
        if (!active) return;

        const normalized = (data || []).map((row: any) => {
          const admitDate = row.admit_date;
          const daysAdmitted = Math.max(1, Math.ceil((new Date().getTime() - new Date(admitDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
          const medicationTotal = (row.inpatient_medications || []).reduce((sum: number, med: any) => sum + Number(med.unit_price || 0) * Number(med.quantity || 0), 0);
          const serviceTotal = (row.inpatient_services || []).reduce((sum: number, svc: any) => sum + Number(svc.price || 0), 0);
          return {
            id: row.id,
            petName: row.pets?.name ?? null,
            customerName: row.pets?.customers?.full_name ?? 'Unknown',
            admitDate,
            daysAdmitted,
            estimatedBill: medicationTotal + serviceTotal
          };
        });

        setRecords(normalized);
      } catch (error) {
        if (active) {
          toast.error('Failed to load inpatient bills.');
          if ((error as any)?.message) {
            handleSupabaseError(error as any);
          }
        }
      } finally {
        if (active) setFetching(false);
      }
    }

    if (open) {
      fetchRecords();
    }

    return () => {
      active = false;
    };
  }, [open]);

  const confirmLoad = async () => {
    if (!selectedId) return;
    setLoading(true);

    try {
      const items = await posService.getInpatientPendingBill(selectedId);
      onLoad(items, selectedId);
      onOpenChange(false);
      setSelectedId(null);
      toast.success('Pending bill loaded into cart.');
    } catch (error) {
      toast.error('Unable to load inpatient bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Load Pending Inpatient Bill</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {fetching ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Loading active inpatient bills...
            </div>
          ) : records.length ? (
            <div className="grid gap-3">
              {records.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  className={`rounded-3xl border p-4 text-left ${selectedId === record.id ? 'border-slate-900 bg-slate-100 dark:border-slate-100 dark:bg-slate-900' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}
                  onClick={() => setSelectedId(record.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{record.petName ?? 'Unknown pet'}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Customer: {record.customerName ?? 'Unknown'}</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Days admitted</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{record.daysAdmitted}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-700 dark:text-slate-200">
                    <div>Admit date: {new Date(record.admitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div>Estimated bill: {formatCurrency(record.estimatedBill)}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-sm text-slate-500 dark:text-slate-400">No active inpatient bills are available right now.</Card>
          )}
        </div>

        <DialogFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
            <Button onClick={confirmLoad} disabled={!selectedId || loading}>
              {loading ? 'Loading…' : 'Load bill'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LoadInpatientBillModal;
