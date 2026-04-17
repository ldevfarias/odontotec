import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

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
    <div className="animate-in fade-in space-y-4 duration-500">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="border-border/40 flex items-center space-x-4 rounded-xl border bg-white p-4"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
