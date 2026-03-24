'use client';

import { useState } from 'react';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePatientDialog } from '@/components/patients/CreatePatientDialog';
import { PatientsKPIs } from '@/components/patients/PatientsKPIs';
import { PatientsTable } from '@/components/patients/PatientsTable';
import { PatientsBulkActions } from '@/components/patients/PatientsBulkActions';
import { PatientsFilter, PatientFilterOption } from '@/components/patients/PatientsFilter';
import { notificationService } from '@/services/notification.service';

export default function PatientsPage() {
    const { user } = useAuth();
    const canCreate = user?.role === 'ADMIN' || user?.role === 'DENTIST';

    const { data: patients = [] } = usePatientsControllerFindAll();
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [filter, setFilter] = useState<PatientFilterOption>('month');

    const handleClearSelection = () => {
        setRowSelection({});
    };

    const handleSendMessage = () => {
        notificationService.info('Funcionalidade de envio de mensagem em desenvolvimento.');
        handleClearSelection();
    };

    // Calculate basic KPIs based on mocked data or simple metrics
    const totalPatients = patients.length;
    // Mock for now:
    const newPatientsMonth = Math.floor(totalPatients * 0.1);
    const patientsToRemind = Math.floor(totalPatients * 0.15);

    const selectedCount = Object.keys(rowSelection).filter(key => rowSelection[key]).length;

    return (
        <div className={`w-full flex flex-col transition-all duration-300 ${selectedCount > 0 ? 'pb-20 sm:pb-28' : 'pb-8'}`}>
            <div className="card-surface p-3 sm:p-5 rounded-none sm:rounded-2xl w-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <div>
                        <p className="hidden sm:block body-regular text-muted-foreground mt-1">
                            Gerencie todos os pacientes da clínica
                        </p>
                    </div>
                    {canCreate && (
                        <div className="flex items-center gap-3">
                            <CreatePatientDialog />
                        </div>
                    )}
                </div>

                <PatientsFilter value={filter} onChange={setFilter} />

                <PatientsKPIs
                    totalPatients={totalPatients}
                    newPatientsMonth={newPatientsMonth}
                    patientsToRemind={patientsToRemind}
                />

                <PatientsTable
                    data={patients as any[]}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            </div>

            <PatientsBulkActions
                selectedCount={selectedCount}
                onClearSelection={handleClearSelection}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}
