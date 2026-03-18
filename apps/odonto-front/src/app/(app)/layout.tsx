'use client';

import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RouteGuard } from "@/components/RouteGuard";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { SubscriptionBlocker } from "@/components/SubscriptionBlocker";
import { cn } from "@/lib/utils";
import { AppLayoutSkeleton } from "@/components/skeletons";

import { Breadcrumb } from "@/components/Breadcrumb";

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
            <div className={cn(
                "flex h-screen w-full bg-[#f3f4f6] p-2 gap-3 overflow-hidden transition-all duration-300",
                (isLocked || isLoading) && "blur-md pointer-events-none select-none grayscale"
            )}>
                <Sidebar />
                <div className="flex-1 flex flex-col gap-2 overflow-hidden min-w-0">
                    <DashboardHeader />
                    <main className="flex-1 overflow-y-auto px-2 pt-1 pb-4 custom-scrollbar relative z-0 flex flex-col">
                        <div className="mb-2">
                            <Breadcrumb />
                        </div>
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard>
            <SubscriptionProvider>
                <DashboardContent>{children}</DashboardContent>
            </SubscriptionProvider>
        </RouteGuard>
    );
}
