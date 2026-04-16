import { Skeleton } from '@/components/ui/skeleton';

export function AppLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full gap-3 overflow-hidden bg-[#f3f4f6] p-2">
      {/* Sidebar Skeleton */}
      <div className="border-border/40 flex h-full w-64 flex-col rounded-xl border bg-white p-4">
        <Skeleton className="mb-8 h-8 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
        {/* Header Skeleton */}
        <div className="border-border/40 flex h-16 shrink-0 items-center justify-between rounded-xl border bg-white px-6">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="relative z-0 flex flex-1 flex-col overflow-hidden">
          <div className="mb-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex-1 pt-4">
            <DashboardPageSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header/Greeting Area */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Cards Area */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border-border/40 flex flex-col gap-4 rounded-xl border bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Cards/Charts Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-border/40 col-span-2 h-96 rounded-xl border bg-white p-6">
          <Skeleton className="mb-6 h-6 w-48" />
          <Skeleton className="h-full w-full rounded-md" />
        </div>
        <div className="border-border/40 col-span-1 h-96 rounded-xl border bg-white p-6">
          <Skeleton className="mb-6 h-6 w-48" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
