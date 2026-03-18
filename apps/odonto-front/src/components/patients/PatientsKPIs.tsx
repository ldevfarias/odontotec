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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-6">
            <Card className="card-surface p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="body-small text-muted-foreground font-medium uppercase tracking-wider mb-1">Total de Pacientes</span>
                        <div className="flex items-baseline gap-2">
                            <span className="heading-1">{totalPatients}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="card-surface p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <UserPlus className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="body-small text-muted-foreground font-medium uppercase tracking-wider mb-1">Novos Pacientes</span>
                        <div className="flex items-baseline gap-2">
                            <span className="heading-1">{newPatientsMonth}</span>
                            <span className="badge-success ml-auto">Este Mês</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="card-surface p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                        <Bell className="h-6 w-6 text-warning" />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="body-small text-muted-foreground font-medium uppercase tracking-wider mb-1">Para Lembrar</span>
                        <div className="flex items-baseline gap-2">
                            <span className="heading-1">{patientsToRemind}</span>
                            <span className="badge-warning ml-auto">Retornos</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
