import { AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface PaymentSummaryCardsProps {
  totalDebt: number;
  totalPaid: number;
  totalBudgeted: number;
}

export function PaymentSummaryCards({
  totalDebt,
  totalPaid,
  totalBudgeted,
}: PaymentSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-4">
      <div className="card-surface flex items-start gap-2 p-3 sm:gap-4 sm:p-5">
        <div className="bg-destructive/10 shrink-0 rounded-xl p-2.5">
          <AlertCircle className="text-destructive h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="sm:body-small text-muted-foreground mb-1 truncate text-[10px] font-medium">
            Saldo em Aberto
          </p>
          <p className="sm:heading-3 text-destructive text-sm leading-none font-bold">
            {formatCurrency(totalDebt)}
          </p>
        </div>
      </div>
      <div className="card-surface flex items-start gap-2 p-3 sm:gap-4 sm:p-5">
        <div className="bg-success/10 shrink-0 rounded-xl p-2.5">
          <CheckCircle2 className="text-success h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="sm:body-small text-muted-foreground mb-1 truncate text-[10px] font-medium">
            Total Pago
          </p>
          <p className="sm:heading-3 text-success text-sm leading-none font-bold">
            {formatCurrency(totalPaid)}
          </p>
        </div>
      </div>
      <div className="card-surface flex items-start gap-2 p-3 sm:gap-4 sm:p-5">
        <div className="bg-primary/10 shrink-0 rounded-xl p-2.5">
          <ClipboardList className="text-primary h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="sm:body-small text-muted-foreground mb-1 truncate text-[10px] font-medium">
            Total Orçado
          </p>
          <p className="sm:heading-3 text-sm leading-none font-bold">
            {formatCurrency(totalBudgeted)}
          </p>
        </div>
      </div>
    </div>
  );
}
