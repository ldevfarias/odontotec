import type { AnamnesisAnswerDto } from '@/generated/ts/AnamnesisAnswerDto';

export interface AnamnesisAnswer {
  questionId: string;
  value: unknown;
  details?: string;
}

export interface AnamnesisData {
  answers: AnamnesisAnswer[];
}

export interface AnamnesisAlert {
  questionId: string;
}

export interface AnamnesisRecord {
  id: number;
  complaint: string;
  createdAt?: string;
  data?: AnamnesisData;
  alerts?: AnamnesisAlert[];
}

export function unwrapAnswerValue(value: unknown): unknown {
  if (Array.isArray(value)) return value;

  if (value && typeof value === 'object' && 'value' in value) {
    return unwrapAnswerValue((value as { value: unknown }).value);
  }

  return value;
}

export function formatAnswerValue(value: unknown): string {
  const normalizedValue = unwrapAnswerValue(value);

  if (Array.isArray(normalizedValue)) {
    return normalizedValue.join(', ');
  }

  if (typeof normalizedValue === 'boolean') {
    return normalizedValue ? 'Sim' : 'Não';
  }

  if (typeof normalizedValue === 'string' || typeof normalizedValue === 'number') {
    return String(normalizedValue);
  }

  if (normalizedValue && typeof normalizedValue === 'object') {
    return JSON.stringify(normalizedValue);
  }

  return 'N/A';
}

export function buildAnamnesisAnswersPayload(answers: AnamnesisAnswer[]): AnamnesisAnswerDto[] {
  return answers.map((answer) => ({
    questionId: answer.questionId,
    details: answer.details,
    value:
      typeof answer.value === 'object' && answer.value !== null
        ? (answer.value as object)
        : { value: answer.value ?? '' },
  }));
}
