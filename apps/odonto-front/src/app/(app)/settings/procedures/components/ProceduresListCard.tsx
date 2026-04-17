'use client';

import { FileText, Pencil, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import type { Procedure } from '../types';

interface ProceduresListCardProps {
  filteredProcedures: Procedure[];
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onEdit: (procedure: Procedure) => void;
  onDelete: (id: number) => void;
}

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function ProceduresListCard({
  filteredProcedures,
  searchTerm,
  isLoading,
  onSearchChange,
  onEdit,
  onDelete,
}: ProceduresListCardProps) {
  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="relative w-full">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Buscar procedimento..."
            className="pl-8"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-2">
        {isLoading ? (
          <div className="space-y-2 px-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-muted/30 h-14 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredProcedures.length === 0 ? (
          <div className="text-muted-foreground mx-4 flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-sm">
              {searchTerm ? 'Nenhum resultado para a busca.' : 'Nenhum procedimento cadastrado.'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-muted/50 hidden grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 sm:grid">
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Nome
              </span>
              <span className="text-muted-foreground w-28 text-right text-xs font-semibold tracking-wide uppercase">
                Valor Base
              </span>
              <span className="text-muted-foreground w-20 text-center text-xs font-semibold tracking-wide uppercase">
                Ações
              </span>
            </div>

            <div className="divide-border divide-y">
              {filteredProcedures.map((procedure) => {
                return (
                  <div key={procedure.id} className="group">
                    <div className="hover:bg-accent/30 hidden grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors sm:grid">
                      <div>
                        <p className="text-foreground text-sm font-semibold">{procedure.name}</p>
                        {procedure.description && (
                          <p className="text-muted-foreground mt-0.5 max-w-xs truncate text-xs">
                            {procedure.description}
                          </p>
                        )}
                      </div>

                      <div className="w-28 text-right">
                        <span className="text-foreground font-mono text-sm font-semibold">
                          {brlFormatter.format(procedure.baseValue)}
                        </span>
                      </div>

                      <div className="flex w-20 justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(procedure)}
                          className="text-muted-foreground h-8 w-8 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(procedure.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 transition-all duration-200 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {procedure.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-foreground font-mono text-xs font-semibold">
                            {brlFormatter.format(procedure.baseValue)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(procedure)}
                          className="text-muted-foreground h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(procedure.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-muted-foreground pt-2 pr-4 pb-1 text-right text-xs">
              {filteredProcedures.length} procedimento{filteredProcedures.length !== 1 ? 's' : ''}
              {searchTerm ? ' encontrado' : ' cadastrado'}
              {filteredProcedures.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
