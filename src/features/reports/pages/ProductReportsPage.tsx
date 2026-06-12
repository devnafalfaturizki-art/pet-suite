import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Input, Button } from '@/components/ui';
import { DataTable } from '@/components/common/DataTable';
import { useProductStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const chartColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

export default function ProductReportsPage() {
  useDocumentTitle('Product Reports');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const q = useProductStats(from || undefined, to || undefined);

  const bestSellers = q.data || [];
  const topProducts = bestSellers.slice(0, 6).map((item: any, idx: number) => ({ ...item, color: chartColors[idx % chartColors.length] }));

  return (
    <div className="space-y-6">
      <PageHeader title="Product Reports" description="Best selling products and revenue." />
      <div className="grid gap-4 md:grid-cols-3 items-end">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={() => q.refetch()}>Run</Button>
      </div>

      <Card className="p-4">
        <DataTable
          columns={[
            { key: 'name', header: 'Product' },
            { key: 'qty', header: 'Quantity' },
            { key: 'revenue', header: 'Revenue', render: (r: any) => formatCurrency(r.revenue || 0) }
          ]}
          data={bestSellers}
          isLoading={q.isLoading}
          emptyTitle="No products sold"
          emptyDescription="Try a different date range or add sales data."
        />
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top product revenue</h3>
        {q.isLoading ? (
          <div className="h-72 rounded-3xl bg-slate-100" />
        ) : topProducts.length ? (
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topProducts} dataKey="revenue" nameKey="name" outerRadius={120} label>
                  {topProducts.map((entry: any, index: number) => (
                    <Cell key={entry.reference || index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-10 text-sm text-slate-500">No product revenue available for this period.</div>
        )}
      </Card>
    </div>
  );
}
