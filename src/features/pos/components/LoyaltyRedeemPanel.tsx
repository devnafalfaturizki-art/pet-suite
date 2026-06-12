import { useMemo } from 'react';
import { LOYALTY_REDEEM_RATE } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Input, Card } from '@/components/ui';

interface LoyaltyRedeemPanelProps {
  availablePoints: number;
  currentTotal: number;
  pointsToRedeem: number;
  onRedeemChange: (points: number) => void;
}

export function LoyaltyRedeemPanel({ availablePoints, currentTotal, pointsToRedeem, onRedeemChange }: LoyaltyRedeemPanelProps) {
  const maxPoints = useMemo(() => Math.min(availablePoints, Math.floor(currentTotal / LOYALTY_REDEEM_RATE)), [availablePoints, currentTotal]);
  const discountAmount = pointsToRedeem * LOYALTY_REDEEM_RATE;

  if (availablePoints <= 0) {
    return null;
  }

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h3 className="text-base font-semibold">Loyalty redemption</h3>
        <p className="text-sm text-slate-500">Loyalty points can be used to reduce the invoice total.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Loyalty Points Available</label>
          <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {availablePoints} pts
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Redeem points</label>
          <Input
            type="number"
            value={pointsToRedeem}
            min={0}
            max={maxPoints}
            onChange={(event) => {
              const value = Number(event.target.value || 0);
              const validated = Math.max(0, Math.min(value, maxPoints));
              onRedeemChange(validated);
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
        Discount: <span className="font-semibold">{formatCurrency(discountAmount)}</span>
      </div>
    </Card>
  );
}
