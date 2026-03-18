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
}

export const ANAMNESIS_TEMPLATE: AnamnesisQuestion[] = [
    // Saúde Geral
    {
        id: 'hypertension',
        label: 'Possui hipertensão?',
        type: QuestionType.BOOLEAN,
        category: AnamnesisCategory.GENERAL_HEALTH,
    },
    {
        id: 'diabetes',
        label: 'Possui diabetes?',
        type: QuestionType.BOOLEAN,
        category: AnamnesisCategory.GENERAL_HEALTH,
    },
    {
        id: 'heart_problems',
        label: 'Problemas cardíacos?',
        type: QuestionType.BOOLEAN,
        category: AnamnesisCategory.GENERAL_HEALTH,
    },
    {
        id: 'allergies',
        label: 'Possui alergias (medicamentos, alimentos, látex)?',
        type: QuestionType.MULTISELECT,
        options: ['Penicilina', 'Iodo', 'Aspirina', 'Látex', 'Anestésico'],
        category: AnamnesisCategory.GENERAL_HEALTH,
    },

    // Condições Especiais
    {
        id: 'pregnant',
        label: 'Está grávida?',
        type: QuestionType.BOOLEAN,
        category: AnamnesisCategory.SPECIAL_CONDITIONS,
    },
    {
        id: 'anticoagulant',
        label: 'Usa anticoagulantes?',
        type: QuestionType.BOOLEAN,
        category: AnamnesisCategory.SPECIAL_CONDITIONS,
    },

    // Hábitos
    {
        id: 'smoking',
        label: 'Fumante?',
        type: QuestionType.SELECT,
        options: ['Não', 'Sim', 'Ex-fumante'],
        category: AnamnesisCategory.HABITS,
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
    }
];
