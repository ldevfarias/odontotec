'use client';

import { DashboardHeader } from '@/components/DashboardHeader';
import { RouteGuard } from '@/components/RouteGuard';
import { Sidebar } from '@/components/Sidebar';
import { AppLayoutSkeleton } from '@/components/skeletons';
import { SubscriptionBlocker } from '@/components/SubscriptionBlocker';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';
import { TourProvider } from '@/contexts/TourContext';
import { cn } from '@/lib/utils';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLocked, isLoading } = useSubscription();

  return (
    <>
      <SubscriptionBlocker />
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-[#f3f4f6]">
          <AppLayoutSkeleton />
        </div>
      )}
      <div
        className={cn(
          'flex h-screen w-full gap-3 overflow-hidden bg-[#f3f4f6] p-2 transition-all duration-300',
          (isLocked || isLoading) && 'pointer-events-none blur-md grayscale select-none',
        )}
      >
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          <DashboardHeader />
          <main className="custom-scrollbar relative z-0 flex flex-1 flex-col overflow-y-auto px-2 pt-1 pb-4">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <SubscriptionProvider>
        <TourProvider>
          <DashboardContent>{children}</DashboardContent>
        </TourProvider>
      </SubscriptionProvider>
    </RouteGuard>
  );
}
