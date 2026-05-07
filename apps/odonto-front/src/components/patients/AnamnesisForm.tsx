'use client';

import { CheckCircle2 } from 'lucide-react';

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
  type AnamnesisQuestion,
  QuestionType,
} from '@/constants/anamnesis-template';
import { cn } from '@/lib/utils';

import type { AnamnesisAnswer } from './anamnesis-helpers';
import type { FormAnswer } from './use-anamnesis-form';
import { useAnamnesisForm } from './use-anamnesis-form';

// ---- Sub-components ----

function BooleanField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn('text-xs font-medium', !checked ? 'text-primary' : 'text-muted-foreground')}
      >
        Não
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
      <span
        className={cn('text-xs font-medium', checked ? 'text-primary' : 'text-muted-foreground')}
      >
        Sim
      </span>
    </div>
  );
}

function SelectField({
  value,
  options = [],
  onChange,
}: {
  value: string;
  options?: string[];
  onChange: (val: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiselectField({
  values,
  options = [],
  onToggle,
}: {
  values: string[];
  options?: string[];
  onToggle: (opt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = values.includes(opt);
        return (
          <Badge
            key={opt}
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer px-3 py-1 text-sm transition-all',
              isSelected ? 'bg-primary text-white' : 'hover:bg-muted',
            )}
            onClick={() => onToggle(opt)}
          >
            {opt} {isSelected && <CheckCircle2 className="ml-1 h-3 w-3" />}
          </Badge>
        );
      })}
    </div>
  );
}

function shouldShowDetails(question: AnamnesisQuestion, answer: FormAnswer): boolean {
  if (question.type === QuestionType.TEXT) return true;
  if (answer.value === true) return true;
  if (Array.isArray(answer.value) && answer.value.length > 0) return true;
  if (typeof answer.value === 'string' && answer.value !== '' && answer.value !== 'Não')
    return true;
  return false;
}

interface QuestionItemProps {
  question: AnamnesisQuestion;
  answer: FormAnswer;
  onValueChange: (questionId: string, value: FormAnswer['value']) => void;
  onDetailsChange: (questionId: string, details: string) => void;
  onToggle: (questionId: string, option: string) => void;
}

function QuestionItem({
  question,
  answer,
  onValueChange,
  onDetailsChange,
  onToggle,
}: QuestionItemProps) {
  const showDetails = shouldShowDetails(question, answer);

  return (
    <div className="space-y-3 border-b pb-4 last:border-0 last:pb-0">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <Label className="flex-1 text-base font-medium">{question.label}</Label>

        <div className="shrink-0">
          {question.type === QuestionType.BOOLEAN && (
            <BooleanField
              checked={answer.value === true}
              onChange={(val) => onValueChange(question.id, val)}
            />
          )}

          {question.type === QuestionType.SELECT && (
            <SelectField
              value={typeof answer.value === 'string' ? answer.value : ''}
              options={question.options}
              onChange={(val) => onValueChange(question.id, val)}
            />
          )}
        </div>
      </div>

      {question.type === QuestionType.MULTISELECT && (
        <MultiselectField
          values={Array.isArray(answer.value) ? answer.value : []}
          options={question.options}
          onToggle={(opt) => onToggle(question.id, opt)}
        />
      )}

      {showDetails && (
        <Textarea
          placeholder="Detalhes adicionais (opcional)..."
          value={answer.details}
          onChange={(e) => onDetailsChange(question.id, e.target.value)}
          className="mt-2 h-20 text-sm"
        />
      )}
    </div>
  );
}

// ---- Main component ----

interface AnamnesisFormProps {
  initialAnswers?: AnamnesisAnswer[];
  initialComplaint?: string;
  onSubmit: (complaint: string, answers: AnamnesisAnswer[]) => void;
  isSubmitting?: boolean;
}

export function AnamnesisForm({
  initialAnswers = [],
  initialComplaint = '',
  onSubmit,
  isSubmitting,
}: AnamnesisFormProps) {
  const {
    complaint,
    setComplaint,
    answers,
    updateAnswerValue,
    updateAnswerDetails,
    toggleMultiselect,
  } = useAnamnesisForm(initialAnswers, initialComplaint);

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

              return (
                <QuestionItem
                  key={question.id}
                  question={question}
                  answer={answer}
                  onValueChange={updateAnswerValue}
                  onDetailsChange={updateAnswerDetails}
                  onToggle={toggleMultiselect}
                />
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
