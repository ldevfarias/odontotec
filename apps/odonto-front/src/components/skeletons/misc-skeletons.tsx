import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function CalendarSkeleton() {
    return (
        <div className="h-full flex flex-col space-y-4 bg-white rounded-xl border border-border/40 p-4 animate-in fade-in duration-500">
            {/* Toolbar Skeleton */}
            <div className="flex justify-between items-center pb-4 border-b border-border/40">
                <div className="flex gap-2 items-center">
                    <Skeleton className="w-32 h-8 rounded-md" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-24 h-8 rounded-md" />
                    <Skeleton className="w-24 h-8 rounded-md" />
                    <Skeleton className="w-24 h-8 rounded-md" />
                </div>
            </div>

            {/* Main Calendar View Skeleton (Weekly view roughly) */}
            <div className="flex-1 grid grid-cols-8 gap-2">
                {/* Time column */}
                <div className="col-span-1 space-y-8 pt-10">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="w-12 h-4 mx-auto" />
                    ))}
                </div>
                {/* Day columns */}
                {[...Array(7)].map((_, dayIndex) => (
                    <div key={dayIndex} className="col-span-1 border-l border-border/40 px-2 flex flex-col gap-4">
                        <div className="text-center pb-2 border-b border-border/40">
                            <Skeleton className="w-16 h-4 mx-auto mb-2" />
                            <Skeleton className="w-10 h-10 rounded-full mx-auto" />
                        </div>
                        {/* Random event blocks */}
                        <div className="flex-1 relative">
                            {dayIndex % 2 === 0 && <Skeleton className="absolute top-[20%] w-full h-24 rounded-md" />}
                            {dayIndex % 3 === 0 && <Skeleton className="absolute top-[50%] w-full h-16 rounded-md opacity-70" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function BillingCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
            {/* Plan Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-4 h-4 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-32 h-8 font-bold mb-2" />
                    <Skeleton className="w-48 h-3 text-xs" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="w-full h-10 rounded-md" />
                </CardFooter>
            </Card>

            {/* Status Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-4 h-4 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-24 h-8 font-bold mb-2" />
                    <Skeleton className="w-40 h-3 text-xs" />
                </CardContent>
            </Card>

            {/* Invoices Skeleton area */}
            <Card className="md:col-span-2 lg:col-span-3 mt-4">
                <CardHeader>
                    <Skeleton className="w-48 h-6 mb-2" />
                    <Skeleton className="w-64 h-4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                            <div className="space-y-2">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="w-24 h-3" />
                            </div>
                            <Skeleton className="w-16 h-6 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export function ResetPasswordCardSkeleton() {
    return (
        <Card className="w-full max-w-md shadow-lg animate-in fade-in duration-500">
            <CardHeader className="space-y-1">
                <Skeleton className="h-8 w-48 mb-2" />
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
                <Skeleton className="h-10 w-full mt-2" />
            </CardContent>
        </Card>
    );
}
