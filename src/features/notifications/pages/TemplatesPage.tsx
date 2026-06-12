import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useTemplates, useUpdateTemplate } from '../notifications.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const labelize = (key: string) => key.replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
const highlightVariables = (text: string) => {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, index) =>
    part.startsWith('{{') && part.endsWith('}}') ? (
      <code key={index} className="rounded bg-slate-100 px-1 text-sm text-slate-900">{part}</code>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const variableGuide: Record<string, string[]> = {
  welcome: ['{{customer_name}}', '{{pet_name}}'],
  reminder: ['{{customer_name}}', '{{service_name}}', '{{appointment_date}}'],
  promotion: ['{{customer_name}}', '{{offer_code}}']
};

export default function TemplatesPage() {
  useDocumentTitle('Notification Templates');
  const { data, isLoading } = useTemplates();
  const update = useUpdateTemplate();
  const items = data || [];
  const [editing, setEditing] = useState<any | null>(null);

  async function save() {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, updates: { body: editing.body, title: editing.title } });
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Templates" description="Manage templates with placeholders like {{pet_name}}" />
      <div>
        <DataTable
          columns={[
            { key: 'key', header: 'Template' },
            { key: 'title', header: 'Title' },
            {
              key: 'body',
              header: 'Body',
              render: (r: any) => <div className="max-w-md whitespace-pre-wrap break-words text-sm text-slate-700">{highlightVariables(r.body)}</div>
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (r: any) => <Button size="sm" onClick={() => setEditing(r)}>Edit</Button>
            }
          ]}
          data={items as any}
          isLoading={isLoading}
          emptyTitle="No templates"
          emptyDescription="Create templates in DB to use with broadcasts"
        />

        {editing && (
          <Card className="mt-4 p-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Template</div>
                <div className="text-lg font-semibold">{labelize(editing.key)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Body</label>
                <textarea
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                  rows={8}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Available variables</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(variableGuide[editing.key] || ['{{customer_name}}', '{{pet_name}}']).map((variable) => (
                    <span key={variable} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{variable}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save} disabled={update.isLoading}>{update.isLoading ? 'Saving...' : 'Save'}</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
