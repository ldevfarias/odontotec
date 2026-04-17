export enum QuestionType {
  BOOLEAN = 'boolean',
  TEXT = 'text',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
}

export enum AnamnesisCategory {
  GENERAL_HEALTH = 'Saúde Geral',
  DENTAL_HISTORY = 'Histórico Odontológico',
  HABITS = 'Hábitos',
  SPECIAL_CONDITIONS = 'Condições Especiais',
}

export interface AnamnesisQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  category: AnamnesisCategory;
  alertIfValue?: unknown;
  alertLabel?: string;
}

export const ANAMNESIS_TEMPLATE: AnamnesisQuestion[] = [
  // Saúde Geral
  {
    id: 'hypertension',
    label: 'Possui hipertensão?',
    type: QuestionType.BOOLEAN,
    category: AnamnesisCategory.GENERAL_HEALTH,
    alertIfValue: true,
    alertLabel: 'Hipertensão',
  },
  {
    id: 'diabetes',
    label: 'Possui diabetes?',
    type: QuestionType.BOOLEAN,
    category: AnamnesisCategory.GENERAL_HEALTH,
    alertIfValue: true,
    alertLabel: 'Diabetes',
  },
  {
    id: 'heart_problems',
    label: 'Problemas cardíacos?',
    type: QuestionType.BOOLEAN,
    category: AnamnesisCategory.GENERAL_HEALTH,
    alertIfValue: true,
    alertLabel: 'Cardiopatia',
  },
  {
    id: 'allergies',
    label: 'Possui alergias (medicamentos, alimentos, látex)?',
    type: QuestionType.MULTISELECT,
    options: ['Penicilina', 'Iodo', 'Aspirina', 'Látex', 'Anestésico'],
    category: AnamnesisCategory.GENERAL_HEALTH,
    alertIfValue: (val: string[]) => val.length > 0,
  },

  // Condições Especiais
  {
    id: 'pregnant',
    label: 'Está grávida?',
    type: QuestionType.BOOLEAN,
    category: AnamnesisCategory.SPECIAL_CONDITIONS,
    alertIfValue: true,
    alertLabel: 'Grávida',
  },
  {
    id: 'anticoagulant',
    label: 'Usa anticoagulantes?',
    type: QuestionType.BOOLEAN,
    category: AnamnesisCategory.SPECIAL_CONDITIONS,
    alertIfValue: true,
    alertLabel: 'Uso de Anticoagulante',
  },

  // Hábitos
  {
    id: 'smoking',
    label: 'Fumante?',
    type: QuestionType.SELECT,
    options: ['Não', 'Sim', 'Ex-fumante'],
    category: AnamnesisCategory.HABITS,
    alertIfValue: (val: string) => val !== 'Não',
    alertLabel: 'Fumante',
  },

  // Histórico Odontológico
  {
    id: 'dental_anxiety',
    label: 'Ansiedade em dentista?',
    type: QuestionType.SELECT,
    options: ['Nenhuma', 'Baixa', 'Moderada', 'Alta'],
    category: AnamnesisCategory.DENTAL_HISTORY,
  },
  {
    id: 'previous_complications',
    label: 'Complicações em tratamentos anteriores?',
    type: QuestionType.TEXT,
    category: AnamnesisCategory.DENTAL_HISTORY,
  },
];
