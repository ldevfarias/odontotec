/* eslint-disable prettier/prettier */
'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  ANAMNESIS_TEMPLATE,
  AnamnesisCategory,
  QuestionType,
} from '@/constants/anamnesis-template';
import { cn } from '@/lib/utils';

interface Answer {
  questionId: string;
  value: unknown;
  details?: string;
}

interface AnamnesisFormProps {
  initialAnswers?: Answer[];
  initialComplaint?: string;
  onSubmit: (complaint: string, answers: Answer[]) => void;
  isSubmitting?: boolean;
}

export function AnamnesisForm({
  initialAnswers = [],
  initialComplaint = '',
  onSubmit,
  isSubmitting,
}: AnamnesisFormProps) {
  const [complaint, setComplaint] = useState(initialComplaint);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    // Initialize answers based on template and initial data
    const merged = ANAMNESIS_TEMPLATE.map((q) => {
      const existing = initialAnswers.find((a) => a.questionId === q.id);
      return {
        questionId: q.id,
        value: existing
          ? existing.value
          : q.type === QuestionType.MULTISELECT
            ? []
            : q.type === QuestionType.BOOLEAN
              ? false
              : '',
        details: existing?.details || '',
      };
    });
    // We intentionally reset local form state when initialAnswers changes (edit/create switch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers(merged);
  }, [initialAnswers]);

  const updateAnswer = (questionId: string, value: unknown, details?: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId
          ? {
            ...a,
            value: value !== undefined ? value : a.value,
            details: details !== undefined ? details : a.details,
          }
          : a,
      ),
    );
  };

  const toggleMultiselect = (questionId: string, option: string) => {
    const current = answers.find((a) => a.questionId === questionId);
    if (!current) return;

    const newValue = Array.isArray(current.value)
      ? current.value.includes(option)
        ? current.value.filter((v) => v !== option)
        : [...current.value, option]
      : [option];

    updateAnswer(questionId, newValue);
  };

  const categories = Object.values(AnamnesisCategory);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label className="text-lg font-bold">Queixa Principal *</Label>
        <Textarea
          placeholder="Qual o motivo da consulta hoje?"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          className="min-h-25 text-base"
        />
      </div>

      {categories.map((category) => (
        <Card key={category} className="border-muted shadow-sm">
          <CardHeader className="bg-muted/30 py-4">
            <CardTitle className="text-md text-primary font-bold">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {ANAMNESIS_TEMPLATE.filter((q) => q.category === category).map((question) => {
              const answer = answers.find((a) => a.questionId === question.id);
              if (!answer) return null;
              const isChecked = answer.value === true;
              const selectValue = typeof answer.value === 'string' ? answer.value : '';

              return (
                <div key={question.id} className="space-y-3 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <Label className="flex-1 text-base font-medium">{question.label}</Label>

                    <div className="shrink-0">
                      {question.type === QuestionType.BOOLEAN && (
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'text-xs font-medium',
                              !isChecked ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            Não
                          </span>
                          <Switch
                            checked={isChecked}
                            onCheckedChange={(val) => updateAnswer(question.id, val)}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              isChecked ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            Sim
                          </span>
                        </div>
                      )}

                      {question.type === QuestionType.SELECT && (
                        <Select
                          value={selectValue}
                          onValueChange={(val) => updateAnswer(question.id, val)}
                        >
                          <SelectTrigger className="w-45">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {question.type === QuestionType.MULTISELECT && (
                    <div className="flex flex-wrap gap-2">
                      {question.options?.map((opt) => {
                        const isSelected =
                          Array.isArray(answer.value) && answer.value.includes(opt);
                        return (
                          <Badge
                            key={opt}
                            variant={isSelected ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer px-3 py-1 text-sm transition-all',
                              isSelected ? 'bg-primary text-white' : 'hover:bg-muted',
                            )}
                            onClick={() => toggleMultiselect(question.id, opt)}
                          >
                            {opt} {isSelected && <CheckCircle2 className="ml-1 h-3 w-3" />}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {(question.type === QuestionType.TEXT ||
                    answer.value === true ||
                    (Array.isArray(answer.value) && answer.value.length > 0) ||
                    (typeof answer.value === 'string' &&
                      answer.value !== 'Não' &&
                      answer.value !== '')) && (
                      <Textarea
                        placeholder="Detalhes adicionais (opcional)..."
                        value={answer.details}
                        onChange={(e) => updateAnswer(question.id, undefined, e.target.value)}
                        className="mt-2 h-20 text-sm"
                      />
                    )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={() => onSubmit(complaint, answers)}
          disabled={isSubmitting || !complaint}
          className="px-12"
        >
          {isSubmitting ? 'Salvando...' : 'Finalizar Anamnese'}
        </Button>
      </div>
    </div>
  );
}
