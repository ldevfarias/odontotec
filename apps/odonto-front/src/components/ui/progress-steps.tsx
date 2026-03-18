import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className={cn("w-full max-w-sm mx-auto mb-8", className)}>
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>

                {/* Active progress bar */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                    style={{
                        width: currentStep === 1 ? '0%' : currentStep === 2 ? '33.33%' : currentStep === 3 ? '66.66%' : '100%'
                    }}
                ></div>

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                                    isCompleted ? "bg-primary text-white" : "",
                                    isActive ? "bg-primary text-white ring-4 ring-primary/20" : "",
                                    !isActive && !isCompleted ? "bg-white text-gray-400 border-2 border-gray-200" : ""
                                )}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                            </div>
                            <span
                                className={cn(
                                    "absolute -bottom-6 whitespace-nowrap text-xs font-medium transition-colors duration-300",
                                    isActive ? "text-primary font-bold" : "text-gray-500"
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
