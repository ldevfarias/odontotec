import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProgressStepsProps {
  currentStep: 1 | 2 | 3 | 4;
  className?: string;
}

export function ProgressSteps({ currentStep, className }: ProgressStepsProps) {
  const steps = [
    { id: 1, title: 'Cadastro' },
    { id: 2, title: 'Verificação' },
    { id: 3, title: 'Termos' },
    { id: 4, title: 'Sua Clínica' },
  ];

  return (
    <div className={cn('mx-auto mb-8 w-full max-w-sm', className)}>
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200"></div>

        {/* Active progress bar */}
        <div
          className="bg-primary absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{
            width:
              currentStep === 1
                ? '0%'
                : currentStep === 2
                  ? '33.33%'
                  : currentStep === 3
                    ? '66.66%'
                    : '100%',
          }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300',
                  isCompleted ? 'bg-primary text-white' : '',
                  isActive ? 'bg-primary ring-primary/20 text-white ring-4' : '',
                  !isActive && !isCompleted
                    ? 'border-2 border-gray-200 bg-white text-gray-400'
                    : '',
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span
                className={cn(
                  'absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors duration-300',
                  isActive ? 'text-primary font-bold' : 'text-gray-500',
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
