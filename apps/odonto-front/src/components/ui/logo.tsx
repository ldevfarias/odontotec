import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    ehColor?: string;
}

export function Logo({
    className,
    ehColor = "text-[#41b883]"
}: LogoProps) {
    return (
        <span className={cn(
            "font-sans font-bold tracking-tighter",
            className
        )}>
            Odonto<span className={ehColor}>Eh</span>Tec
        </span>
    );
}
