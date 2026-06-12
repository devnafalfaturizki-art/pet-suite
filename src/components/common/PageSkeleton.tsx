import React from 'react';
import { Skeleton } from '@/components/ui';

export default function PageSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-48 rounded" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Skeleton className="h-24 rounded" />
        <Skeleton className="h-24 rounded" />
        <Skeleton className="h-24 rounded" />
      </div>

      <div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
