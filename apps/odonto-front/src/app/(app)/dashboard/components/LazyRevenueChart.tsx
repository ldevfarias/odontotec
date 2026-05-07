import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

export const LazyRevenueChart = dynamic(
  () => import('./RevenueChart').then((m) => ({ default: m.RevenueChart })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col rounded-3xl border border-gray-100 bg-white px-7 py-6 shadow-sm">
        <div className="mb-4 flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-37 rounded-full" />
        </div>
        <div className="flex flex-1 items-end gap-3 pb-6">
          {[55, 70, 45, 80, 60, 75, 50].map((height, i) => (
            <Skeleton key={i} className="h-full w-full" style={{ maxHeight: `${height}%` }} />
          ))}
        </div>
      </div>
    ),
  },
);
