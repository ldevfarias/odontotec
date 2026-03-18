"use client"

import * as React from "react"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PaginationProps {
    pageIndex: number
    pageCount: number
    pageSize: number
    totalFilteredRows?: number
    totalRows?: number
    canPreviousPage: boolean
    canNextPage: boolean
    setPageIndex: (index: number) => void
    previousPage: () => void
    nextPage: () => void
    setPageSize: (size: number) => void
    pageSizeOptions?: number[]
}

export function Pagination({
    pageIndex,
    pageCount,
    pageSize,
    canPreviousPage,
    canNextPage,
    setPageIndex,
    previousPage,
    nextPage,
    setPageSize,
    pageSizeOptions = [10, 20, 30, 40, 50],
}: PaginationProps) {
    return (
        <div className="flex flex-col items-center justify-end gap-4 px-2 py-4 sm:flex-row mt-4">
            <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium hidden sm:block text-muted-foreground">
                        Linhas por página
                    </p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-9 w-[80px] bg-white shadow-sm border-border/50 rounded-lg font-medium">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
                    Página {pageIndex + 1} de {pageCount || 1}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        className="hidden h-9 w-9 p-0 lg:flex bg-white shadow-sm border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all rounded-lg"
                        onClick={() => setPageIndex(0)}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">Primeira página</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 bg-white shadow-sm border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all rounded-lg"
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 bg-white shadow-sm border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all rounded-lg"
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">Próxima</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-9 w-9 p-0 lg:flex bg-white shadow-sm border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all rounded-lg"
                        onClick={() => setPageIndex(pageCount - 1)}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">Última página</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
