'use client';

import { CalendarCheck, CheckCircle2, Clock } from 'lucide-react';

interface DentistKPIStripProps {
    appointments: any[];
}

export function DentistKPIStrip({ appointments }: DentistKPIStripProps) {
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
    const pending = appointments.filter(a => a.status === 'SCHEDULED').length;
    const total = appointments.length;

    const kpis = [
        {
            label: 'Pacientes Hoje',
            value: total,
            icon: CalendarCheck,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            border: 'border-slate-200',
        },
        {
            label: 'Confirmados',
            value: confirmed,
            icon: CheckCircle2,
            color: 'text-teal-700',
            bg: 'bg-teal-50',
            border: 'border-teal-200',
        },
        {
            label: 'Pendentes',
            value: pending,
            icon: Clock,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {kpis.map(({ label, value, icon: Icon, color, bg, border }) => (
                <div
                    key={label}
                    className={`flex items-center gap-4 p-4 rounded-sm border ${border} ${bg} transition-all hover:shadow-sm`}
                >
                    <div className={`p-2.5 rounded-sm border ${border} bg-white/70`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                        <p className={`text-3xl font-black leading-none mt-0.5 ${color}`}>{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
