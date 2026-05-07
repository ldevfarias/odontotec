# Budget PDF Export — Design Spec

**Date:** 2026-04-21
**Status:** Approved

## Overview

Allow users to generate a formal PDF budget document for patients directly from the `BudgetsTab`. The PDF is generated client-side using `@react-pdf/renderer`, requiring no server changes.

## User Story

From the budget history accordion, the user clicks "Gerar PDF" on any budget and the browser downloads a PDF with the clinic's identity, patient data, and itemized budget.

## Architecture

### New Files

- `apps/odonto-front/src/components/patients/BudgetPdfDocument.tsx`
  — React PDF template using `@react-pdf/renderer` primitives (`Document`, `Page`, `View`, `Text`, `Image`).
- `apps/odonto-front/src/components/patients/BudgetPdfButton.tsx`
  — Thin wrapper around `PDFDownloadLink` that renders a styled button triggering the download.

### Modified Files

- `BudgetHistoryList.tsx` — receives two new props (`patient`, `clinic`) and renders `BudgetPdfButton` inside each `AccordionContent`.
- `BudgetsTab.tsx` — passes `patient` (from `usePatientsControllerFindOne`) and `activeClinic` (from `useAuth`) down to `BudgetHistoryList`.

### New Types (inside `budget-types.ts`)

```ts
export interface BudgetPdfPatient {
  name: string;
  phone?: string;
}

export interface BudgetPdfClinic {
  name: string;
  avatarUrl?: string | null;
  cnpj?: string;
  phone?: string;
}
```

## PDF Template Layout (A4)

### Header
- Logo (`avatarUrl`) on the left if present, max height 50px
- Clinic name in bold, large font — primary blue `#2563eb`
- CNPJ and phone in smaller muted text below
- Horizontal rule divider

### Patient Block
- Left: "Paciente: [name]" + "Telefone: [phone]"
- Right: "Emitido em: [DD/MM/YYYY]"

### Budget Title
- Plan title in bold
- Status badge with background color matching status:
  - DRAFT → gray `#6b7280`
  - APPROVED → blue `#2563eb`
  - COMPLETED → green `#16a34a`
  - CANCELLED / REJECTED → red `#dc2626` / orange `#ea580c`

### Items Table
- Header row: Procedimento | Dente | Valor — white text on `#2563eb` background
- Rows: alternating white / `#f8fafc` background
- Columns: description (flex 3), tooth number centered (flex 1), value right-aligned (flex 1)

### Financial Footer
- Subtotal row (if discount > 0)
- Discount row in red (if discount > 0)
- "Total Final" row — bold, primary blue, larger font
- Border-top separator above total

### Page Footer
- "Este orçamento tem validade de 30 dias." in muted small text
- Page number right-aligned

## Data Flow

```
PatientDetailPage
  └── BudgetsTab (receives patient from usePatientsControllerFindOne, activeClinic from useAuth)
        └── BudgetHistoryList (receives plans, patient, clinic)
              └── BudgetPdfButton (per plan — receives plan, patient, clinic)
                    └── PDFDownloadLink → BudgetPdfDocument
```

## Dependencies

- Install: `@react-pdf/renderer` + `@types/react-pdf` (if needed)
- No backend changes required

## Filename Convention

Downloaded file: `orcamento-[plan.title]-[DD-MM-YYYY].pdf`

## Out of Scope

- Digital signature
- Email delivery
- Print preview modal
- Payment terms / installment breakdown
