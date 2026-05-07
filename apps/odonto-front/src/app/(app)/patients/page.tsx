'use client';

import { useState } from 'react';

import { PatientsBulkActions } from '@/components/patients/PatientsBulkActions';
import { Patient, PatientsTable } from '@/components/patients/PatientsTable';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { notificationService } from '@/services/notification.service';

export default function PatientsPage() {
  const { data: patientsResponse } = usePatientsControllerFindAll();
  const patients = patientsResponse?.data ?? [];
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const handleClearSelection = () => {
    setRowSelection({});
  };

  const handleSendMessage = () => {
    notificationService.info('Funcionalidade de envio de mensagem em desenvolvimento.');
    handleClearSelection();
  };

  const selectedCount = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

  return (
    <div
      className={`flex w-full flex-col transition-all duration-300 ${selectedCount > 0 ? 'pb-20 sm:pb-28' : 'pb-8'}`}
    >
      <div className="card-surface flex w-full flex-col rounded-none p-3 sm:rounded-2xl sm:p-5">
        <PatientsTable
          data={patients as unknown as Patient[]}
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
