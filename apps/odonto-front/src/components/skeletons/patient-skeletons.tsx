import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "./table-skeletons";

export function PatientPageSkeleton() {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Patient Card Header Skeleton */}
            <Card className="overflow-hidden bg-white/60 backdrop-blur-xl border-border/40 shadow-sm transition-all duration-300">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl shadow-md border-4 border-white" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 space-y-3 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-primary/10">
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
                <div className="flex justify-start mb-6">
                    <div className="bg-muted/50 p-1 rounded-xl flex gap-1 border border-border/40">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                        ))}
                    </div>
                </div>
                {/* Tab Content Placeholder */}
                <div className="w-full h-64 bg-white/40 rounded-xl border border-border/40 flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function AnamnesisTabSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border/40">
                <div className="space-y-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            <div className="relative border-l-2 border-primary/20 ml-6 space-y-8 pb-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative pl-8">
                        {/* Timeline dot */}
                        <div className="absolute -left-[9px] top-2">
                            <Skeleton className="h-4 w-4 rounded-full border-2 border-white" />
                        </div>
                        {/* Card */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
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
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-40 rounded-full" />
            </div>
            <ListSkeleton count={4} />
        </div>
    );
}

export function DocumentsTabSkeleton() {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-40 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
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
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-full" />
                    <Skeleton className="h-10 w-40 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-border/40 bg-zinc-50/50 h-48">
                        <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function OdontogramTabSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            {/* The teeth container representation */}
            <div className="w-full flex justify-center py-10 bg-white rounded-xl border border-border/40 p-8 shadow-sm">
                <div className="grid grid-rows-2 gap-12 w-full max-w-4xl">
                    {/* Top Arch */}
                    <div className="flex justify-center gap-1 sm:gap-2">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <Skeleton className="h-4 w-6" />
                                <Skeleton className="h-12 w-8 sm:h-16 sm:w-10 rounded-t-xl rounded-b-sm" />
                            </div>
                        ))}
                    </div>
                    {/* Bottom Arch */}
                    <div className="flex justify-center gap-1 sm:gap-2">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <Skeleton className="h-12 w-8 sm:h-16 sm:w-10 rounded-b-xl rounded-t-sm" />
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
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
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-40 rounded-full" />
            </div>

            {[...Array(2)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-border/40 shadow-sm mb-4">
                    <div className="bg-muted/30 p-4 border-b border-border/40 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 text-primary" />
                            <div>
                                <Skeleton className="h-5 w-48 mb-1" />
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
