'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import type { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBRL, formatCurrencyInput, parseCurrencyInput } from '@/utils/masks';

import type { CartItem } from './budget-types';
import type { BudgetFormValues } from './BudgetsTab';

interface BudgetCartSidebarProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
  editingId: number | null;
  isSaving: boolean;
  control: Control<BudgetFormValues>;
  onRemoveItem: (id: string) => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

export function BudgetCartSidebar({
  cart,
  subtotal,
  total,
  editingId,
  isSaving,
  control,
  onRemoveItem,
  onCancelEdit,
  onSave,
}: BudgetCartSidebarProps) {
  return (
    <Card className="border-border/40 sticky top-6 self-start shadow-sm">
      <CardHeader className="border-border/40 mb-0 border-b pb-3">
        <CardTitle className="text-foreground/80 flex items-center gap-2 text-base font-semibold tracking-tight">
          <ShoppingCart className="text-muted-foreground h-4.5 w-4.5 stroke-[1.5]" />
          Resumo do Orçamento
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pt-3">
        {cart.length === 0 ? (
          <div className="text-muted-foreground/50 flex h-52 flex-col items-center justify-center space-y-4">
            <ShoppingCart className="h-12 w-12 stroke-1" />
            <p className="text-muted-foreground p-4 text-center">Nenhum procedimento no momento</p>
          </div>
        ) : (
          <div className="space-y-0">
            <ScrollArea className="-mx-4 mt-0 max-h-80 px-4">
              <div className="flex flex-col gap-2.5 pb-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="group from-card to-muted/30 border-border/40 hover:border-primary/20 relative rounded-lg border bg-linear-to-r p-3 shadow-xs transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground/95 truncate text-sm leading-none font-semibold">
                          {item.description}
                        </p>
                        {item.toothNumber && (
                          <div className="bg-primary/10 text-primary mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                            Dente <span className="text-foreground">{item.toothNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-primary text-sm font-bold whitespace-nowrap">
                          {formatBRL(item.value)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground h-7 w-7 rounded-full opacity-0 transition-all group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-border/40 mt-2 space-y-4 border-t pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-light">Subtotal</span>
                  <span className="text-foreground/80 font-medium">{formatBRL(subtotal)}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-16 text-sm font-light">Desconto</span>
                  <FormField
                    control={control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem className="mb-0 flex-1">
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute top-2.5 left-3 text-xs font-medium">
                              R$
                            </span>
                            <Input
                              type="text"
                              className="text-destructive/90 bg-muted/40 hover:bg-muted/60 focus-visible:border-border/50 h-9 rounded-md border-transparent pl-8 text-right text-sm font-medium shadow-none transition-all focus-visible:bg-transparent"
                              placeholder="0,00"
                              value={formatCurrencyInput(field.value)}
                              onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-border/40 mt-5 flex items-baseline justify-between border-t pt-5">
                  <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                    Total
                  </span>
                  <p className="text-primary/90 text-[28px] font-bold tracking-tight">
                    {formatBRL(total)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {editingId && (
                  <Button variant="outline" onClick={onCancelEdit} className="flex-1">
                    Cancelar Edição
                  </Button>
                )}
                <Button
                  className={`h-10 shadow-md ${editingId ? 'flex-1' : 'w-full'}`}
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingId
                      ? 'Atualizar Orçamento'
                      : 'Finalizar Orçamento'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
