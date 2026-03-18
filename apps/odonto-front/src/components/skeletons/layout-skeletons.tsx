import { Skeleton } from "@/components/ui/skeleton";

export function AppLayoutSkeleton() {
    return (
        <div className="flex h-screen w-full bg-[#f3f4f6] p-2 gap-3 overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-64 h-full bg-white rounded-xl flex flex-col p-4 border border-border/40">
                <Skeleton className="w-32 h-8 mb-8" />
                <div className="space-y-3">
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                </div>
            </div>

            {/* Main Content Area Skeleton */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden min-w-0">
                {/* Header Skeleton */}
                <div className="h-16 bg-white rounded-xl flex items-center justify-between px-6 border border-border/40 shrink-0">
                    <Skeleton className="w-48 h-6" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <main className="flex-1 overflow-hidden relative z-0 flex flex-col">
                    <div className="mb-2">
                        <Skeleton className="w-32 h-4" />
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header/Greeting Area */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="w-64 h-8" />
                    <Skeleton className="w-96 h-4" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-24 h-10" />
                    <Skeleton className="w-32 h-10" />
                </div>
            </div>

            {/* Stats Cards Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 bg-white rounded-xl border border-border/40 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-8 h-8 rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="w-32 h-8" />
                            <Skeleton className="w-48 h-3" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Cards/Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 p-6 bg-white rounded-xl border border-border/40 h-96">
                    <Skeleton className="w-48 h-6 mb-6" />
                    <Skeleton className="w-full h-full rounded-md" />
                </div>
                <div className="col-span-1 p-6 bg-white rounded-xl border border-border/40 h-96">
                    <Skeleton className="w-48 h-6 mb-6" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="w-full h-4" />
                                    <Skeleton className="w-2/3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
