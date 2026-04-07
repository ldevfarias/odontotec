'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ToothFace = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

interface ToothProps {
    number: string;
    observations?: any[];
    className?: string;
    isSelected?: boolean;
    onToothClick: (number: string) => void;
}

export const Tooth: React.FC<ToothProps> = ({
    number,
    observations = [],
    className,
    isSelected = false,
    onToothClick,
}) => {
    const getFaceColor = (face: ToothFace) => {
        if (isSelected) return 'fill-primary/20 stroke-primary/60';

        const hasFaceObservation = observations.some((o: any) =>
            o.toothFaces?.split(',').includes(face.charAt(0).toUpperCase())
        );
        if (hasFaceObservation) return 'fill-destructive/40 stroke-destructive/60';

        return cn(
            'fill-background stroke-muted-foreground/60 transition-colors',
            'hover:fill-primary/15 hover:stroke-primary/40',
        );
    };

    return (
        <div className={cn('flex flex-col items-center gap-1 group/tooth', className)}>
            <span
                className={cn(
                    'text-[10px] font-bold transition-colors',
                    isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover/tooth:text-primary',
                )}
            >
                {number}
            </span>

            <div className="relative">
                <svg
                    viewBox="0 0 100 100"
                    className="w-8 h-8 sm:w-12 sm:h-12 cursor-pointer transition-transform duration-200 hover:scale-110"
                    onClick={() => onToothClick(number)}
                >
                    {/* Buccal (Top) */}
                    <path d="M 10 10 L 90 10 L 70 30 L 30 30 Z" className={getFaceColor('buccal')} />
                    {/* Distal (Right) */}
                    <path d="M 90 10 L 90 90 L 70 70 L 70 30 Z" className={getFaceColor('distal')} />
                    {/* Lingual (Bottom) */}
                    <path d="M 10 90 L 90 90 L 70 70 L 30 70 Z" className={getFaceColor('lingual')} />
                    {/* Mesial (Left) */}
                    <path d="M 10 10 L 10 90 L 30 70 L 30 30 Z" className={getFaceColor('mesial')} />
                    {/* Occlusal (Center) */}
                    <rect x="30" y="30" width="40" height="40" className={getFaceColor('occlusal')} />
                </svg>
            </div>
        </div>
    );
};
