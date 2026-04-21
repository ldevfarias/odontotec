import type { TreatmentPlanItemDto } from '@/generated/ts/TreatmentPlanItemDto';
import type { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';

export interface CartItem {
  id: string;
  description: string;
  value: number;
  toothNumber?: number;
}

export interface ProcedureCatalogItem {
  id: number;
  name: string;
  baseValue: number;
}

export interface BudgetPlanItem extends Omit<TreatmentPlanItemDto, 'surface'> {
  id?: number;
}

export interface BudgetPlan {
  id: number;
  patientId: number;
  createdAt: string;
  totalAmount: number;
  discount?: number;
  title?: string;
  status: UpdateTreatmentPlanDtoStatusEnumKey;
  items?: BudgetPlanItem[];
}

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
