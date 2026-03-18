"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Pagination } from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumnName?: string
    filterPlaceholder?: string
    showSearch?: boolean
    rowSelection?: Record<string, boolean>
    setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filterColumnName = "name",
    filterPlaceholder = "Filtrar...",
    showSearch = true,
    rowSelection: controlledRowSelection,
    setRowSelection: setControlledRowSelection,
}: DataTableProps<TData, TValue>) {
    const [internalRowSelection, setInternalRowSelection] = React.useState({})
    const rowSelection = controlledRowSelection !== undefined ? controlledRowSelection : internalRowSelection
    const setRowSelection = setControlledRowSelection !== undefined ? setControlledRowSelection : setInternalRowSelection
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className="space-y-2">
            {showSearch && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={filterPlaceholder}
                                value={(table.getColumn(filterColumnName)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(filterColumnName)?.setFilterValue(event.target.value)
                                }
                                className="pl-8 h-9 w-full md:w-[300px]"
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="card-surface overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-10 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex w-full justify-end">
                <Pagination
                    pageIndex={table.getState().pagination.pageIndex}
                    pageCount={table.getPageCount()}
                    pageSize={table.getState().pagination.pageSize}
                    canPreviousPage={table.getCanPreviousPage()}
                    canNextPage={table.getCanNextPage()}
                    setPageIndex={table.setPageIndex}
                    previousPage={table.previousPage}
                    nextPage={table.nextPage}
                    setPageSize={table.setPageSize}
                />
            </div>
        </div>
    )
}
