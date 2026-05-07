import { useEffect, useState } from 'react';

import { ANAMNESIS_TEMPLATE, QuestionType } from '@/constants/anamnesis-template';

import { type AnamnesisAnswer, unwrapAnswerValue } from './anamnesis-helpers';

export type AnswerValue = string | boolean | string[];

export interface FormAnswer {
  questionId: string;
  value: AnswerValue;
  details: string;
}

function getDefaultValue(type: QuestionType): AnswerValue {
  if (type === QuestionType.MULTISELECT) return [];
  if (type === QuestionType.BOOLEAN) return false;
  return '';
}

function buildInitialAnswers(initialAnswers: AnamnesisAnswer[]): FormAnswer[] {
  return ANAMNESIS_TEMPLATE.map((q) => {
    const existing = initialAnswers.find((a) => a.questionId === q.id);
    const value = existing
      ? (unwrapAnswerValue(existing.value) as AnswerValue)
      : getDefaultValue(q.type);

    return {
      questionId: q.id,
      value,
      details: existing?.details ?? '',
    };
  });
}

export function useAnamnesisForm(initialAnswers: AnamnesisAnswer[], initialComplaint: string) {
  const [complaint, setComplaint] = useState(initialComplaint);
  const [answers, setAnswers] = useState<FormAnswer[]>(() => buildInitialAnswers(initialAnswers));

  useEffect(() => {
    setComplaint(initialComplaint);
    setAnswers(buildInitialAnswers(initialAnswers));
  }, [initialAnswers, initialComplaint]);

  const updateAnswerValue = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, value } : a)));
  };

  const updateAnswerDetails = (questionId: string, details: string) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, details } : a)));
  };

  const toggleMultiselect = (questionId: string, option: string) => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.questionId !== questionId) return a;
        const currentValues = Array.isArray(a.value) ? a.value : [];
        const newValue = currentValues.includes(option)
          ? currentValues.filter((v) => v !== option)
          : [...currentValues, option];
        return { ...a, value: newValue };
      }),
    );
  };

  return {
    complaint,
    setComplaint,
    answers,
    updateAnswerValue,
    updateAnswerDetails,
    toggleMultiselect,
  };
}
