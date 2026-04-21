'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { FileDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { BudgetPdfClinic, BudgetPdfPatient, BudgetPlan } from './budget-types';
import { BudgetPdfDocument } from './BudgetPdfDocument';

interface BudgetPdfButtonProps {
  plan: BudgetPlan;
  patient: BudgetPdfPatient;
  clinic: BudgetPdfClinic;
}

export function BudgetPdfButton({ plan, patient, clinic }: BudgetPdfButtonProps) {
  const filename = `orcamento-${(plan.title ?? 'orcamento').replace(/\s+/g, '-').toLowerCase()}-${format(new Date(plan.createdAt), 'dd-MM-yyyy')}.pdf`;

  return (
    <PDFDownloadLink
      document={<BudgetPdfDocument plan={plan} patient={patient} clinic={clinic} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button
          size="sm"
          variant="outline"
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
          disabled={loading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {loading ? 'Preparando...' : 'Gerar PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
