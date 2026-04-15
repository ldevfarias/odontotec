'use client';

import { CreatePatientDialog } from '@/components/patients/CreatePatientDialog';
import { PatientsBulkActions } from '@/components/patients/PatientsBulkActions';
import { PatientFilterOption, PatientsFilter } from '@/components/patients/PatientsFilter';
import { PatientsTable } from '@/components/patients/PatientsTable';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { notificationService } from '@/services/notification.service';
import { useState } from 'react';

export default function PatientsPage() {
    const { user } = useAuth();
    const userRole = user?.role?.toUpperCase();
    const canCreate = userRole === 'ADMIN' || userRole === 'DENTIST';

    const { data: patientsResponse } = usePatientsControllerFindAll();
    const patients = patientsResponse?.data ?? [];
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [filter, setFilter] = useState<PatientFilterOption>('month');

    const handleClearSelection = () => {
        setRowSelection({});
    };

    const handleSendMessage = () => {
        notificationService.info('Funcionalidade de envio de mensagem em desenvolvimento.');
        handleClearSelection();
    };

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
