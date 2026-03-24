'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Square,
    X,
    Zap,
    Sparkles,
    Droplets,
    Crown,
    Stethoscope,
    type LucideIcon,
} from 'lucide-react';

export type ToothFace = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

interface ProcedureIconConfig {
    icon: LucideIcon;
    colorClass: string;
}

const PROCEDURE_ICON_MAP: Record<string, ProcedureIconConfig> = {
    'Restauração':            { icon: Square,      colorClass: 'text-blue-500' },
    'Extração':               { icon: X,           colorClass: 'text-red-600' },
    'Dente Ausente':          { icon: X,           colorClass: 'text-red-600' },
    'Tratamento de Canal':    { icon: Zap,          colorClass: 'text-orange-500' },
    'Limpeza / Profilaxia':   { icon: Sparkles,    colorClass: 'text-green-500' },
    'Aplicação de Flúor':     { icon: Droplets,    colorClass: 'text-cyan-500' },
    'Prótese':                { icon: Crown,       colorClass: 'text-yellow-500' },
};

const FALLBACK_ICON: ProcedureIconConfig = {
    icon: Stethoscope,
    colorClass: 'text-muted-foreground',
};

interface ToothProps {
    number: string;
    procedures?: any[];
    className?: string;
    isSelected?: boolean;
    onToothClick: (number: string) => void;
}

export const Tooth: React.FC<ToothProps> = ({
    number,
    procedures = [],
    className,
    isSelected = false,
    onToothClick,
}) => {
    const isAbsent = procedures.some(
        (p: any) => p.type === 'Dente Ausente' || p.type === 'Extração'
    );

    const hasProcedures = procedures.length > 0;

    // Determine icon to display — from the most recent procedure (first in array, pre-sorted by date)
    const latestProcedure = procedures[0];
    const iconConfig = latestProcedure
        ? (PROCEDURE_ICON_MAP[latestProcedure.type] ?? FALLBACK_ICON)
        : null;

    const IconComponent = iconConfig?.icon;
    const iconColorClass = iconConfig?.colorClass;

    // Face fill colors: red tint if tooth has any procedure recorded, default otherwise
    const getFaceColor = (face: ToothFace) => {
        if (isAbsent) return 'fill-muted/20 stroke-muted-foreground/30';
        if (isSelected) return 'fill-primary/20 stroke-primary/60';

        const hasFaceProcedure = procedures.some((p: any) =>
            p.toothFaces?.split(',').includes(face.charAt(0).toUpperCase())
        );
        if (hasFaceProcedure) return 'fill-destructive/40 stroke-destructive/60';

        return cn('fill-background stroke-muted-foreground/60 transition-colors', 'hover:fill-primary/15 hover:stroke-primary/40');
    };

    return (
        <div className={cn('flex flex-col items-center gap-1 group/tooth', className)}>
            <span
                className={cn(
                    'text-[10px] font-bold transition-colors',
                    isAbsent
                        ? 'text-muted-foreground/50 line-through'
                        : isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover/tooth:text-primary'
                )}
            >
                {number}
            </span>

            <div className="relative">
                {/* Icon badge overlay — top-right corner */}
                {hasProcedures && !isAbsent && IconComponent && (
                    <div className="absolute -top-1 -right-1 z-10 pointer-events-none">
                        <div className="w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                            <IconComponent className={cn('w-2.5 h-2.5', iconColorClass)} />
                        </div>
                    </div>
                )}

                <svg
                    viewBox="0 0 100 100"
                    className={cn(
                        'w-8 h-8 sm:w-12 sm:h-12 cursor-pointer transition-transform duration-200',
                        !isAbsent && 'hover:scale-110'
                    )}
                    onClick={() => onToothClick(number)}
                >
                    {/* Buccal (Top) */}
                    <path
                        d="M 10 10 L 90 10 L 70 30 L 30 30 Z"
                        className={getFaceColor('buccal')}
                    />
                    {/* Distal (Right) */}
                    <path
                        d="M 90 10 L 90 90 L 70 70 L 70 30 Z"
                        className={getFaceColor('distal')}
                    />
                    {/* Lingual (Bottom) */}
                    <path
                        d="M 10 90 L 90 90 L 70 70 L 30 70 Z"
                        className={getFaceColor('lingual')}
                    />
                    {/* Mesial (Left) */}
                    <path
                        d="M 10 10 L 10 90 L 30 70 L 30 30 Z"
                        className={getFaceColor('mesial')}
                    />
                    {/* Occlusal (Center) */}
                    <rect
                        x="30"
                        y="30"
                        width="40"
                        height="40"
                        className={getFaceColor('occlusal')}
                    />

                    {/* Absent indicator (X overlay) */}
                    {isAbsent && (
                        <g className="pointer-events-none">
                            <line
                                x1="10" y1="10" x2="90" y2="90"
                                stroke="currentColor"
                                strokeWidth="6"
                                className="text-destructive/80"
                            />
                            <line
                                x1="90" y1="10" x2="10" y2="90"
                                stroke="currentColor"
                                strokeWidth="6"
                                className="text-destructive/80"
                            />
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
};
