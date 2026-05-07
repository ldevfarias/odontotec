/* eslint-disable prettier/prettier */
import React from 'react';

import { Tooth } from './Tooth';
import { ToothPopover } from './ToothPopover';

interface ToothObservation {
  toothNumber?: string | number;
  toothFaces?: string;
}

interface OdontogramProps {
  observations?: ToothObservation[];
  isPediatric?: boolean;
  patientId: number;
  highlightedTooth?: string | null;
}

export const Odontogram: React.FC<OdontogramProps> = ({
  observations = [],
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
    <div className="flex justify-center gap-0.5 sm:gap-1">
      {teeth.map((num) => {
        const toothObservations = observations.filter((observation) => {
          return String(observation.toothNumber) === num;
        });
        const isHighlighted = highlightedTooth === num;

        return (
          <ToothPopover
            key={num}
            toothNumber={num}
            patientId={patientId}
            toothObservations={toothObservations}
          >
            <Tooth
              number={num}
              observations={toothObservations}
              isSelected={isHighlighted}
              className={
                isHighlighted ? 'ring-primary bg-primary/10 rounded-md p-1 shadow-sm ring-2' : 'p-1'
              }
              onToothClick={() => { }}
            />
          </ToothPopover>
        );
      })}
    </div>
  );

  return (
    <div className="bg-background border-muted-foreground/20 flex flex-col gap-2 rounded-xl border-2 border-dashed p-3 select-none sm:gap-3 sm:p-6">
      {/* Upper Arch */}
      <div className="flex justify-center gap-2 sm:gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground hidden text-center text-[10px] font-bold tracking-[0.2em] uppercase sm:block">
            Superior Direito
          </span>
          {renderToothGrid(q1)}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground hidden text-center text-[10px] font-bold tracking-[0.2em] uppercase sm:block">
            Superior Esquerdo
          </span>
          {renderToothGrid(q2)}
        </div>
      </div>

      <div className="flex items-center gap-2 py-1">
        <div className="bg-muted-foreground/20 h-px flex-1" />
        <div className="bg-muted-foreground/20 h-2 w-2 rounded-full" />
        <div className="bg-muted-foreground/20 h-px flex-1" />
      </div>

      {/* Lower Arch */}
      <div className="flex justify-center gap-2 sm:gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground hidden text-center text-[10px] font-bold tracking-[0.2em] uppercase sm:block">
            Inferior Direito
          </span>
          {renderToothGrid(q4)}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground hidden text-center text-[10px] font-bold tracking-[0.2em] uppercase sm:block">
            Inferior Esquerdo
          </span>
          {renderToothGrid(q3)}
        </div>
      </div>
    </div>
  );
};
