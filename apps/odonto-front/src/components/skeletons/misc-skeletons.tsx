import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CalendarSkeleton() {
  return (
    <div className="border-border/40 animate-in fade-in flex h-full flex-col space-y-4 rounded-xl border bg-white p-4 duration-500">
      {/* Toolbar Skeleton */}
      <div className="border-border/40 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Main Calendar View Skeleton (Weekly view roughly) */}
      <div className="grid flex-1 grid-cols-8 gap-2">
        {/* Time column */}
        <div className="col-span-1 space-y-8 pt-10">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="mx-auto h-4 w-12" />
          ))}
        </div>
        {/* Day columns */}
        {[...Array(7)].map((_, dayIndex) => (
          <div
            key={dayIndex}
            className="border-border/40 col-span-1 flex flex-col gap-4 border-l px-2"
          >
            <div className="border-border/40 border-b pb-2 text-center">
              <Skeleton className="mx-auto mb-2 h-4 w-16" />
              <Skeleton className="mx-auto h-10 w-10 rounded-full" />
            </div>
            {/* Random event blocks */}
            <div className="relative flex-1">
              {dayIndex % 2 === 0 && (
                <Skeleton className="absolute top-[20%] h-24 w-full rounded-md" />
              )}
              {dayIndex % 3 === 0 && (
                <Skeleton className="absolute top-[50%] h-16 w-full rounded-md opacity-70" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingCardsSkeleton() {
  return (
    <div className="animate-in fade-in grid gap-4 duration-500 md:grid-cols-2 lg:grid-cols-3">
      {/* Plan Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-8 w-32 font-bold" />
          <Skeleton className="h-3 w-48 text-xs" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardFooter>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-8 w-24 font-bold" />
          <Skeleton className="h-3 w-40 text-xs" />
        </CardContent>
      </Card>

      {/* Invoices Skeleton area */}
      <Card className="mt-4 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border-border/20 flex items-center justify-between border-b py-2 last:border-0"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ResetPasswordCardSkeleton() {
  return (
    <Card className="animate-in fade-in w-full max-w-md shadow-lg duration-500">
      <CardHeader className="space-y-1">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-2 h-10 w-full" />
      </CardContent>
    </Card>
  );
}
