import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Badge } from '@/components/ui';
import { DataTable } from '@/components/common/DataTable';
import { useInventoryStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';

export default function InventoryReportsPage() {
  useDocumentTitle('Inventory Reports');
  const q = useInventoryStats();
  const data = q.data;

  const lowStockRows = data?.lowStockItems ?? [];
  const expiryRows = data?.expiringBatches ?? [];
  const stockValueChart = data?.stockValueByCategory ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Reports" description="Stock levels, expirations, and value." />

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-slate-500">Low stock</p>
          <p className="text-2xl font-semibold text-red-700">{data?.lowStockCount ?? '-'}</p>
        </Card>
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-slate-500">Expiring &lt;30d</p>
          <p className="text-2xl font-semibold text-red-700">{data?.expiring30 ?? '-'}</p>
        </Card>
        <Card className="p-4 border border-amber-200 bg-amber-50">
          <p className="text-sm text-slate-500">Expiring &lt;90d</p>
          <p className="text-2xl font-semibold text-amber-700">{data?.expiring90 ?? '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total inventory value</p>
          <p className="text-2xl font-semibold">{data?.totalValue !== undefined ? formatCurrency(data.totalValue) : '-'}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Low Stock Items</h3>
        <DataTable
          columns={[
            { key: 'name', header: 'Item' },
            { key: 'currentStock', header: 'Current' },
            { key: 'minStock', header: 'Min Stock' },
            { key: 'shortage', header: 'Shortage', render: (row: any) => `Short by ${Math.max(0, row.minStock - row.currentStock)} units` }
          ]}
          data={lowStockRows}
          isLoading={q.isLoading}
          emptyTitle="No low stock items"
          emptyDescription="All inventory items are above minimum stock levels."
        />
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Expiring Batches</h3>
        <DataTable
          columns={[
            { key: 'name', header: 'Item' },
            { key: 'batch', header: 'Batch' },
            { key: 'quantity', header: 'Qty' },
            { key: 'expiryDate', header: 'Expiry Date', render: (row: any) => new Date(row.expiryDate).toLocaleDateString() },
            { key: 'daysRemaining', header: 'Days Remaining', render: (row: any) => {
                const days = row.daysRemaining;
                const color = days < 30 ? 'text-red-600' : days < 60 ? 'text-amber-600' : 'text-yellow-700';
                return <span className={color}>{days} days</span>;
              }
            }
          ]}
          data={expiryRows}
          isLoading={q.isLoading}
          emptyTitle="No expiring batches"
          emptyDescription="No inventory batches are expiring soon."
        />
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Stock Value by Category</h3>
        {stockValueChart?.length ? (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockValueChart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={Loader2} title="No stock value data" description="No category value data is available." />
        )}
      </Card>
    </div>
  );
}
