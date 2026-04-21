# Budget PDF Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Gerar PDF" button inside each budget accordion item that downloads a professional A4 PDF with clinic identity, patient data, and itemized budget.

**Architecture:** Client-side PDF generation using `@react-pdf/renderer`. A `BudgetPdfDocument` component defines the template; a `BudgetPdfButton` wraps `PDFDownloadLink`. `BudgetsTab` fetches full clinic data via `useClinicsControllerGetActive` and receives patient name/phone from the parent page.

**Tech Stack:** `@react-pdf/renderer`, React, TypeScript, TanStack Query (already in project)

---

## File Map

| Action | File |
|--------|------|
| Modify | `apps/odonto-front/package.json` |
| Modify | `apps/odonto-front/src/components/patients/budget-types.ts` |
| Create | `apps/odonto-front/src/components/patients/BudgetPdfDocument.tsx` |
| Create | `apps/odonto-front/src/components/patients/BudgetPdfButton.tsx` |
| Modify | `apps/odonto-front/src/components/patients/BudgetHistoryList.tsx` |
| Modify | `apps/odonto-front/src/components/patients/BudgetsTab.tsx` |
| Modify | `apps/odonto-front/src/app/(app)/patients/[id]/page.tsx` |

---

### Task 1: Install `@react-pdf/renderer`

**Files:**
- Modify: `apps/odonto-front/package.json`

- [ ] **Step 1: Install the dependency**

```bash
cd apps/odonto-front
npm install @react-pdf/renderer
```

- [ ] **Step 2: Verify TypeScript types are included**

`@react-pdf/renderer` ships its own types — no separate `@types` package needed. Confirm:

```bash
ls node_modules/@react-pdf/renderer/src/index.d.ts 2>/dev/null || echo "check dist/ folder"
```

- [ ] **Step 3: Commit**

```bash
cd ../..
git add apps/odonto-front/package.json apps/odonto-front/package-lock.json
git commit -m "chore(front): install @react-pdf/renderer"
```

---

### Task 2: Add PDF types to `budget-types.ts`

**Files:**
- Modify: `apps/odonto-front/src/components/patients/budget-types.ts`

- [ ] **Step 1: Add `BudgetPdfPatient` and `BudgetPdfClinic` interfaces**

Open `apps/odonto-front/src/components/patients/budget-types.ts` and append at the end:

```ts
export interface BudgetPdfPatient {
  name: string;
  phone?: string;
}

export interface BudgetPdfClinic {
  name: string;
  logoUrl?: string | null;
  cnpj?: string | null;
  phone?: string | null;
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd apps/odonto-front
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add apps/odonto-front/src/components/patients/budget-types.ts
git commit -m "feat(front): add BudgetPdfPatient and BudgetPdfClinic types"
```

---

### Task 3: Create `BudgetPdfDocument.tsx`

**Files:**
- Create: `apps/odonto-front/src/components/patients/BudgetPdfDocument.tsx`

- [ ] **Step 1: Create the PDF template component**

Create `apps/odonto-front/src/components/patients/BudgetPdfDocument.tsx` with the following content:

```tsx
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

import type { BudgetPdfClinic, BudgetPdfPatient, BudgetPlan } from './budget-types';

const PRIMARY = '#2563eb';
const MUTED = '#6b7280';
const LIGHT_BG = '#f8fafc';
const RED = '#dc2626';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: '#6b7280' },
  APPROVED: { label: 'Aprovado', color: '#2563eb' },
  COMPLETED: { label: 'Finalizado', color: '#16a34a' },
  CANCELLED: { label: 'Cancelado', color: '#dc2626' },
  REJECTED: { label: 'Rejeitado', color: '#ea580c' },
};

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937', padding: 40 },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logo: { width: 50, height: 50, marginRight: 12, objectFit: 'contain' },
  clinicInfo: { flex: 1 },
  clinicName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: PRIMARY, marginBottom: 2 },
  clinicMeta: { fontSize: 8, color: MUTED, marginBottom: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 12 },
  // Patient block
  patientRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  patientBlock: { flex: 1 },
  patientLabel: { fontSize: 8, color: MUTED, marginBottom: 2 },
  patientValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  dateBlock: { alignItems: 'flex-end' },
  // Title
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  planTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginRight: 8 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    padding: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  tableRow: { flexDirection: 'row', padding: 6, borderRadius: 2 },
  tableRowEven: { backgroundColor: LIGHT_BG },
  colDescription: { flex: 3 },
  colTooth: { flex: 1, textAlign: 'center' },
  colValue: { flex: 1, textAlign: 'right' },
  cellText: { fontSize: 9 },
  // Financial footer
  financialBlock: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  financialLabel: { fontSize: 9, color: MUTED },
  financialValue: { fontSize: 9, color: MUTED },
  discountLabel: { fontSize: 9, color: RED },
  discountValue: { fontSize: 9, color: RED },
  totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  totalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  // Page footer
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: MUTED },
});

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface BudgetPdfDocumentProps {
  plan: BudgetPlan;
  patient: BudgetPdfPatient;
  clinic: BudgetPdfClinic;
}

export function BudgetPdfDocument({ plan, patient, clinic }: BudgetPdfDocumentProps) {
  const items = plan.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.value), 0);
  const discount = Number(plan.discount ?? 0);
  const netTotal = subtotal - discount;
  const statusConfig = STATUS_LABELS[plan.status] ?? STATUS_LABELS.DRAFT;
  const emittedAt = format(new Date(plan.createdAt), 'dd/MM/yyyy');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {clinic.logoUrl && <Image src={clinic.logoUrl} style={styles.logo} />}
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{clinic.name}</Text>
            {clinic.cnpj && <Text style={styles.clinicMeta}>CNPJ: {clinic.cnpj}</Text>}
            {clinic.phone && <Text style={styles.clinicMeta}>Tel: {clinic.phone}</Text>}
          </View>
        </View>
        <View style={styles.divider} />

        {/* Patient block */}
        <View style={styles.patientRow}>
          <View style={styles.patientBlock}>
            <Text style={styles.patientLabel}>PACIENTE</Text>
            <Text style={styles.patientValue}>{patient.name}</Text>
            {patient.phone && (
              <>
                <Text style={[styles.patientLabel, { marginTop: 6 }]}>TELEFONE</Text>
                <Text style={styles.patientValue}>{patient.phone}</Text>
              </>
            )}
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.patientLabel}>EMITIDO EM</Text>
            <Text style={styles.patientValue}>{emittedAt}</Text>
          </View>
        </View>

        {/* Title + status */}
        <View style={styles.titleRow}>
          <Text style={styles.planTitle}>{plan.title ?? 'Orçamento'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>Procedimento</Text>
          <Text style={[styles.tableHeaderText, styles.colTooth]}>Dente</Text>
          <Text style={[styles.tableHeaderText, styles.colValue]}>Valor</Text>
        </View>
        {items.map((item, index) => (
          <View
            key={item.id ?? index}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
          >
            <Text style={[styles.cellText, styles.colDescription]}>{item.description}</Text>
            <Text style={[styles.cellText, styles.colTooth]}>
              {item.toothNumber ? String(item.toothNumber) : '—'}
            </Text>
            <Text style={[styles.cellText, styles.colValue]}>{formatBRL(Number(item.value))}</Text>
          </View>
        ))}

        {/* Financial footer */}
        <View style={styles.financialBlock}>
          {discount > 0 && (
            <>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Subtotal</Text>
                <Text style={styles.financialValue}>{formatBRL(subtotal)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.discountLabel}>Desconto</Text>
                <Text style={styles.discountValue}>- {formatBRL(discount)}</Text>
              </View>
            </>
          )}
          <View style={styles.financialRow}>
            <Text style={styles.totalLabel}>Total Final</Text>
            <Text style={styles.totalValue}>{formatBRL(netTotal)}</Text>
          </View>
        </View>

        {/* Page footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>Este orçamento tem validade de 30 dias.</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: Verify the file has no TypeScript errors**

```bash
cd apps/odonto-front
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `BudgetPdfDocument.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/odonto-front/src/components/patients/BudgetPdfDocument.tsx
git commit -m "feat(front): add BudgetPdfDocument template"
```

---

### Task 4: Create `BudgetPdfButton.tsx`

**Files:**
- Create: `apps/odonto-front/src/components/patients/BudgetPdfButton.tsx`

- [ ] **Step 1: Create the download button component**

Create `apps/odonto-front/src/components/patients/BudgetPdfButton.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/odonto-front
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `BudgetPdfButton.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/odonto-front/src/components/patients/BudgetPdfButton.tsx
git commit -m "feat(front): add BudgetPdfButton with PDFDownloadLink"
```

---

### Task 5: Update `BudgetHistoryList` to render the PDF button

**Files:**
- Modify: `apps/odonto-front/src/components/patients/BudgetHistoryList.tsx`

- [ ] **Step 1: Add `patient` and `clinic` props and render `BudgetPdfButton`**

Replace the full contents of `apps/odonto-front/src/components/patients/BudgetHistoryList.tsx`:

```tsx
'use client';

import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { BudgetsTabSkeleton } from '@/components/skeletons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';
import { formatBRL } from '@/utils/masks';

import type { BudgetPdfClinic, BudgetPdfPatient, BudgetPlan } from './budget-types';
import { BudgetPdfButton } from './BudgetPdfButton';

const STATUS_CONFIG = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  APPROVED: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle2 },
  COMPLETED: { label: 'Finalizado', color: 'bg-green-500', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  REJECTED: { label: 'Rejeitado', color: 'bg-orange-500', icon: XCircle },
};

interface BudgetHistoryListProps {
  plans: BudgetPlan[];
  isLoading: boolean;
  patient: BudgetPdfPatient;
  clinic: BudgetPdfClinic;
  onEdit: (plan: BudgetPlan) => void;
  onStatusChange: (id: number, status: UpdateTreatmentPlanDtoStatusEnumKey) => void;
  onDeleteRequest: (id: number) => void;
}

export function BudgetHistoryList({
  plans,
  isLoading,
  patient,
  clinic,
  onEdit,
  onStatusChange,
  onDeleteRequest,
}: BudgetHistoryListProps) {
  if (isLoading) return <BudgetsTabSkeleton />;

  if (plans.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">Nenhum orçamento encontrado.</div>
    );
  }

  return (
    <ScrollArea className="max-h-104 pr-4">
      <Accordion type="single" collapsible className="w-full">
        {plans.map((plan) => {
          const config =
            STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT;
          const StatusIcon = config.icon;
          const netTotal = Number(plan.totalAmount) - Number(plan.discount ?? 0);

          return (
            <AccordionItem key={plan.id} value={`plan-${plan.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full p-1 ${config.color} text-white`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <span className="text-left font-semibold">{plan.title ?? 'Orçamento'}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span>{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</span>
                    <span className="text-primary font-bold">{formatBRL(netTotal)}</span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="bg-muted/20 rounded-md border p-3">
                    <h5 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                      Itens do Orçamento
                    </h5>
                    <div className="space-y-2">
                      {(plan.items ?? []).map((item, index) => (
                        <div
                          key={item.id ?? `${plan.id}-${index}`}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.description}{' '}
                            {item.toothNumber && (
                              <span className="text-muted-foreground text-xs">
                                (Dente {item.toothNumber})
                              </span>
                            )}
                          </span>
                          <span className="font-medium">{formatBRL(Number(item.value))}</span>
                        </div>
                      ))}

                      {Number(plan.discount ?? 0) > 0 && (
                        <div className="mt-2 flex justify-between border-t pt-2 text-sm font-medium text-red-500">
                          <span>Desconto</span>
                          <span>- {formatBRL(Number(plan.discount))}</span>
                        </div>
                      )}

                      <div className="text-primary mt-2 flex justify-between border-t pt-2 text-base font-bold">
                        <span>Total Final</span>
                        <span>{formatBRL(netTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <BudgetPdfButton plan={plan} patient={patient} clinic={clinic} />

                    {plan.status === 'DRAFT' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEdit(plan)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => onStatusChange(plan.id, 'APPROVED')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                      </>
                    )}
                    {(plan.status === 'APPROVED' || plan.status === 'DRAFT') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => onStatusChange(plan.id, 'CANCELLED')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    )}
                    {plan.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteRequest(plan.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </ScrollArea>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/odonto-front
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only in `BudgetsTab.tsx` because it doesn't yet pass the new props — that is expected and will be fixed in Task 6.

- [ ] **Step 3: Commit**

```bash
git add apps/odonto-front/src/components/patients/BudgetHistoryList.tsx
git commit -m "feat(front): add PDF button to each budget in BudgetHistoryList"
```

---

### Task 6: Update `BudgetsTab` to fetch clinic data and pass PDF props

**Files:**
- Modify: `apps/odonto-front/src/components/patients/BudgetsTab.tsx`

`BudgetsTab` needs:
1. A new prop `patientName` and `patientPhone` (passed from the page which already has `patient` data)
2. Call `useClinicsControllerGetActive` to get clinic CNPJ, phone, and logoUrl
3. Pass `patient` and `clinic` objects to `BudgetHistoryList`

- [ ] **Step 1: Add `patientName` and `patientPhone` to the `BudgetsTabProps` interface and update imports**

In `apps/odonto-front/src/components/patients/BudgetsTab.tsx`, make the following changes:

**a) Add import for `useClinicsControllerGetActive`** — add this line to the existing imports block:

```ts
import { useClinicsControllerGetActive } from '@/generated/hooks/useClinicsControllerGetActive';
```

**b) Update `BudgetsTabProps`** — replace:

```ts
interface BudgetsTabProps {
  patientId: number;
}
```

with:

```ts
interface BudgetsTabProps {
  patientId: number;
  patientName: string;
  patientPhone?: string;
}
```

**c) Destructure the new props** — replace:

```ts
export function BudgetsTab({ patientId }: BudgetsTabProps) {
```

with:

```ts
export function BudgetsTab({ patientId, patientName, patientPhone }: BudgetsTabProps) {
```

**d) Fetch active clinic** — add this line just after the `const { user } = useAuth();` line:

```ts
const { data: activeClinicData } = useClinicsControllerGetActive();
```

**e) Build `pdfClinic` object** — add this just before the `return (` statement:

```ts
const pdfClinic = {
  name: (activeClinicData as any)?.name ?? '',
  logoUrl: (activeClinicData as any)?.logoUrl ?? null,
  cnpj: (activeClinicData as any)?.cnpj ?? null,
  phone: (activeClinicData as any)?.phone ?? null,
};

const pdfPatient = { name: patientName, phone: patientPhone };
```

**f) Pass `patient` and `clinic` to `BudgetHistoryList`** — find the `<BudgetHistoryList` usage and add the two new props:

```tsx
<BudgetHistoryList
  plans={patientPlans}
  isLoading={isLoadingPlans}
  patient={pdfPatient}
  clinic={pdfClinic}
  onEdit={handleEdit}
  onStatusChange={handleStatusChange}
  onDeleteRequest={setPlanToDelete}
/>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/odonto-front
npx tsc --noEmit 2>&1 | head -30
```

Expected: error only in `patients/[id]/page.tsx` because it doesn't pass `patientName` yet — fixed in Task 7.

- [ ] **Step 3: Commit**

```bash
git add apps/odonto-front/src/components/patients/BudgetsTab.tsx
git commit -m "feat(front): pass clinic and patient data to BudgetHistoryList for PDF"
```

---

### Task 7: Pass patient name/phone from patient page to `BudgetsTab`

**Files:**
- Modify: `apps/odonto-front/src/app/(app)/patients/[id]/page.tsx`

The page already fetches `patient` via `usePatientsControllerFindOne(Number(id))`. We just need to forward `name` and `phone` to `BudgetsTab`.

- [ ] **Step 1: Update `BudgetsTab` usage in the page**

In `apps/odonto-front/src/app/(app)/patients/[id]/page.tsx`, find the line:

```tsx
<BudgetsTab patientId={Number(id)} />
```

Replace it with:

```tsx
<BudgetsTab
  patientId={Number(id)}
  patientName={(patient as any)?.name ?? ''}
  patientPhone={(patient as any)?.phone ?? undefined}
/>
```

- [ ] **Step 2: Verify TypeScript — no errors**

```bash
cd apps/odonto-front
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 3: Build to confirm no runtime issues**

```bash
cd apps/odonto-front
npm run build 2>&1 | tail -20
```

Expected: build completes successfully.

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-front/src/app/(app)/patients/[id]/page.tsx
git commit -m "feat(front): wire patient name/phone into BudgetsTab for PDF generation"
```

---

## Done

After all tasks, open the app at `http://localhost:3001`, navigate to a patient → Orçamentos tab, expand any budget, and click "Gerar PDF". A properly formatted A4 PDF should download with clinic header, patient data, itemized table, and financial totals.
