import React from 'react';
import { Users, UserPlus, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PatientsKPIsProps {
    totalPatients: number;
    newPatientsMonth: number;
    patientsToRemind: number;
}

export function PatientsKPIs({
    totalPatients = 0,
    newPatientsMonth = 0,
    patientsToRemind = 0
}: PatientsKPIsProps) {
    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full mb-4 sm:mb-6">
            <Card className="card-surface p-3 sm:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-2 sm:gap-4">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] sm:body-small text-muted-foreground font-medium uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Total</span>
                        <span className="text-xl sm:heading-1 font-bold">{totalPatients}</span>
                    </div>
                </div>
            </Card>

            <Card className="card-surface p-3 sm:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-2 sm:gap-4">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <UserPlus className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] sm:body-small text-muted-foreground font-medium uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Novos</span>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="text-xl sm:heading-1 font-bold">{newPatientsMonth}</span>
                            <span className="badge-success hidden sm:inline ml-auto">Este Mês</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="card-surface p-3 sm:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-2 sm:gap-4">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                        <Bell className="h-4 w-4 sm:h-6 sm:w-6 text-warning" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] sm:body-small text-muted-foreground font-medium uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Lembrar</span>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="text-xl sm:heading-1 font-bold">{patientsToRemind}</span>
                            <span className="badge-warning hidden sm:inline ml-auto">Retornos</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
