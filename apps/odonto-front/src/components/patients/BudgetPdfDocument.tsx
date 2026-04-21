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
