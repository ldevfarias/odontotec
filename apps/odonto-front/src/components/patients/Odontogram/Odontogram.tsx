import React, { useState } from 'react';
import { Tooth } from './Tooth';
import { ToothPopover } from './ToothPopover';

interface OdontogramProps {
    procedures?: any[];
    isPediatric?: boolean;
    patientId: number;
    highlightedTooth?: string | null;
}

export const Odontogram: React.FC<OdontogramProps> = ({
    procedures = [],
    isPediatric = false,
    patientId,
    highlightedTooth,
}) => {
    // Adult Quadrants
    const adultQ1 = ['18', '17', '16', '15', '14', '13', '12', '11'];
    const adultQ2 = ['21', '22', '23', '24', '25', '26', '27', '28'];
    const adultQ4 = ['48', '47', '46', '45', '44', '43', '42', '41'];
    const adultQ3 = ['31', '32', '33', '34', '35', '36', '37', '38'];

    // Pediatric Quadrants
    const pediatricQ1 = ['55', '54', '53', '52', '51'];
    const pediatricQ2 = ['61', '62', '63', '64', '65'];
    const pediatricQ4 = ['85', '84', '83', '82', '81'];
    const pediatricQ3 = ['71', '72', '73', '74', '75'];

    const q1 = isPediatric ? pediatricQ1 : adultQ1;
    const q2 = isPediatric ? pediatricQ2 : adultQ2;
    const q4 = isPediatric ? pediatricQ4 : adultQ4;
    const q3 = isPediatric ? pediatricQ3 : adultQ3;

    const renderToothGrid = (teeth: string[]) => (
        <div className="flex gap-1 justify-center">
            {teeth.map((num) => {
                const toothProcs = (procedures as any[]).filter(
                    (p: any) => String(p.toothNumber) === num
                );
                const isHighlighted = highlightedTooth === num;

                return (
                    <ToothPopover
                        key={num}
                        toothNumber={num}
                        patientId={patientId}
                        toothProcedures={toothProcs}
                    >
                        <Tooth
                            number={num}
                            procedures={toothProcs}
                            isSelected={isHighlighted}
                            className={
                                isHighlighted
                                    ? 'ring-2 ring-primary rounded-md p-1 bg-primary/10 shadow-sm'
                                    : 'p-1'
                            }
                            onToothClick={() => {/* popover opens via PopoverTrigger */}}
                        />
                    </ToothPopover>
                );
            })}
        </div>
    );

    return (
        <div className="min-w-[800px] flex flex-col gap-3 select-none bg-background p-6 rounded-xl border-2 border-dashed border-muted-foreground/20">
            {/* Upper Arch */}
            <div className="flex justify-center gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        Superior Direito
                    </span>
                    {renderToothGrid(q1)}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        Superior Esquerdo
                    </span>
                    {renderToothGrid(q2)}
                </div>
            </div>

            <div className="flex items-center gap-2 py-1">
                <div className="h-px bg-muted-foreground/20 flex-1" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                <div className="h-px bg-muted-foreground/20 flex-1" />
            </div>

            {/* Lower Arch */}
            <div className="flex justify-center gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        Inferior Direito
                    </span>
                    {renderToothGrid(q4)}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        Inferior Esquerdo
                    </span>
                    {renderToothGrid(q3)}
                </div>
            </div>
        </div>
    );
};
