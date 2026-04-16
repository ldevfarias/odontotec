import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { ListSkeleton } from './table-skeletons';

export function PatientPageSkeleton() {
  return (
    <div className="animate-in fade-in space-y-4 duration-500">
      {/* Patient Card Header Skeleton */}
      <Card className="border-border/40 overflow-hidden bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-300">
        <div className="from-primary/5 via-primary/10 bg-gradient-to-r to-transparent p-6 sm:p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative">
              <Skeleton className="h-24 w-24 rounded-2xl border-4 border-white shadow-md sm:h-28 sm:w-28" />
            </div>
            {/* Info */}
            <div className="w-full flex-1 space-y-3">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-24 rounded-full" />
                </div>
              </div>
              {/* Medallions */}
              <div className="border-primary/10 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs List Skeleton */}
      <div className="w-full">
        <div className="mb-6 flex justify-start">
          <div className="bg-muted/50 border-border/40 flex gap-1 rounded-xl border p-1">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Tab Content Placeholder */}
        <div className="border-border/40 flex h-64 w-full items-center justify-center rounded-xl border bg-white/40">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AnamnesisTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="border-border/40 flex items-center justify-between rounded-xl border bg-white p-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="border-primary/20 relative ml-6 space-y-8 border-l-2 pb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative pl-8">
            {/* Timeline dot */}
            <div className="absolute top-2 -left-[9px]">
              <Skeleton className="h-4 w-4 rounded-full border-2 border-white" />
            </div>
            {/* Card */}
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[75%]" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetsTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}

export function DocumentsTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-[80%]" />
                <Skeleton className="h-4 w-[40%]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ExamsTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="group border-border/40 flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-zinc-50/50 p-4"
          >
            <Skeleton className="mb-4 h-12 w-12 rounded-lg" />
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OdontogramTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {/* The teeth container representation */}
      <div className="border-border/40 flex w-full justify-center rounded-xl border bg-white p-8 py-10 shadow-sm">
        <div className="grid w-full max-w-4xl grid-rows-2 gap-12">
          {/* Top Arch */}
          <div className="flex justify-center gap-1 sm:gap-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-12 w-8 rounded-t-xl rounded-b-sm sm:h-16 sm:w-10" />
              </div>
            ))}
          </div>
          {/* Bottom Arch */}
          <div className="flex justify-center gap-1 sm:gap-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-8 rounded-t-sm rounded-b-xl sm:h-16 sm:w-10" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentsTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* KPI Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <ListSkeleton count={5} />
    </div>
  );
}

export function TreatmentPlansTabSkeleton() {
  return (
    <div className="animate-in fade-in space-y-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>

      {[...Array(2)].map((_, i) => (
        <Card key={i} className="border-border/40 mb-4 overflow-hidden shadow-sm">
          <div className="bg-muted/30 border-border/40 flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="text-primary h-10 w-10" />
              <div>
                <Skeleton className="mb-1 h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
