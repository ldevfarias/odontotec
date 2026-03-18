import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface TableRowsSkeletonProps {
    rowCount?: number;
    colCount?: number;
}

export function TableRowsSkeleton({ rowCount = 5, colCount = 5 }: TableRowsSkeletonProps) {
    return (
        <>
            {[...Array(rowCount)].map((_, rowIndex) => (
                <TableRow key={rowIndex} className="animate-in fade-in duration-500">
                    {[...Array(colCount)].map((_, colIndex) => (
                        <TableCell key={colIndex}>
                            <Skeleton className="h-4 w-[80%]" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border border-border/40 bg-white">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            ))}
        </div>
    );
}
