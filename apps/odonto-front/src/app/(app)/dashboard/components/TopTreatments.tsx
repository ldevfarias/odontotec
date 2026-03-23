import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Activity,
    Star,
    Syringe,
    Heart,
    Sparkles,
    Droplet,
    Stethoscope,
    Smile,
    Shield,
    Pill,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { Skeleton } from '@/components/ui/skeleton';

export function TopTreatments() {
    const { data: procedures = [], isLoading } = useClinicProceduresControllerFindAll();
    const [isExpanded, setIsExpanded] = useState(false);

    // Map index to a specific icon and color scheme to maintain the UI design
    const getTreatmentStyle = (name: string, category: string, index: number) => {
        const text = `${name} ${category}`.toLowerCase();

        if (text.includes('limpeza') || text.includes('profilaxia') || text.includes('preven')) {
            return { color: 'bg-blue-100 text-blue-600', icon: Shield };
        }
        if (text.includes('clareamento') || text.includes('estética') || text.includes('lente')) {
            return { color: 'bg-emerald-100 text-emerald-600', icon: Sparkles };
        }
        if (text.includes('extrac') || text.includes('extraç') || text.includes('cirurgia') || text.includes('siso')) {
            return { color: 'bg-orange-100 text-orange-600', icon: Syringe };
        }
        if (text.includes('implante') || text.includes('prótese')) {
            return { color: 'bg-rose-100 text-rose-600', icon: Heart };
        }
        if (text.includes('canal') || text.includes('endo')) {
            return { color: 'bg-violet-100 text-violet-600', icon: Activity };
        }
        if (text.includes('restaura')) {
            return { color: 'bg-teal-100 text-teal-600', icon: Star };
        }
        if (text.includes('orto') || text.includes('aparelho')) {
            return { color: 'bg-cyan-100 text-cyan-600', icon: Smile };
        }

        const fallbackStyles = [
            { color: 'bg-blue-100 text-blue-600', icon: Stethoscope },
            { color: 'bg-emerald-100 text-emerald-600', icon: Pill },
            { color: 'bg-orange-100 text-orange-600', icon: Activity },
            { color: 'bg-rose-100 text-rose-600', icon: Droplet },
            { color: 'bg-teal-100 text-teal-600', icon: Star },
        ];
        return fallbackStyles[index % fallbackStyles.length];
    };

    const displayedTreatments = isExpanded ? procedures : procedures.slice(0, 4);

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col w-full h-full">
            <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-6">Procedimentos</h3>

            <div className="flex flex-col gap-4 flex-1">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))
                ) : displayedTreatments.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500 italic">
                        Nenhum procedimento cadastrado.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out">
                        {displayedTreatments.map((treatment: any, i: number) => {
                            const style = getTreatmentStyle(treatment.name || '', treatment.category || '', i);
                            const Icon = style.icon;
                            const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(treatment.baseValue || 0);

                            return (
                                <div
                                    key={treatment.id || i}
                                    className="flex items-center gap-4 group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                                >
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", style.color)}>
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <div className="flex-1 flex flex-col min-w-0">
                                        <span className="text-[14px] font-bold text-gray-900 truncate leading-tight group-hover:text-primary transition-colors">
                                            {treatment.name}
                                        </span>
                                        <span className="text-[12px] font-medium text-gray-500 truncate">
                                            {treatment.category || 'Geral'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0 justify-center">
                                        <span className="text-[14px] font-bold text-gray-900">{formattedPrice}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {procedures.length > 4 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-6 py-2.5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                    {isExpanded ? (
                        <>
                            Recolher lista
                            <ChevronUp className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Ver mais {procedures.length - 4} procedimentos
                            <ChevronDown className="w-4 h-4" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
