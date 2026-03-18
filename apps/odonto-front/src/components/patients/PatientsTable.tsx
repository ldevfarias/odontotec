import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye } from 'lucide-react';

import { format } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog';
import { useAuth } from '@/contexts/AuthContext';

export interface Patient {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    address?: string;
    document?: string;
    lastProcedureDate?: string;
    nextAppointmentDate?: string;
}

interface PatientsTableProps {
    data: Patient[];
    rowSelection: Record<string, boolean>;
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function PatientsTable({ data, rowSelection, setRowSelection }: PatientsTableProps) {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const columns = useMemo<ColumnDef<Patient>[]>(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: 'Nome',
            cell: ({ row }) => <div className="body-regular font-medium text-foreground">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'phone',
            header: 'Telefone',
            cell: ({ row }) => <span className="body-regular text-muted-foreground">{row.getValue('phone') || '-'}</span>,
        },
        {
            accessorKey: 'lastProcedureDate',
            header: 'Último Procedimento',
            cell: ({ row }) => {
                const dateString = row.getValue<string>('lastProcedureDate');
                return (
                    <span className="body-regular text-muted-foreground">
                        {dateString ? format(new Date(dateString), 'dd/MM/yyyy') : '-'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'nextAppointmentDate',
            header: 'Próxima Consulta',
            cell: ({ row }) => {
                const dateString = row.getValue<string>('nextAppointmentDate');
                return (
                    <span className="body-regular text-muted-foreground">
                        {dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : '-'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const patient = row.original;
                return (
                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors h-8 px-3 rounded-md flex items-center gap-2 text-sm font-medium cursor-pointer"
                            onClick={() => router.push(`/patients/${patient.id}`)}
                        >
                            <Eye className="h-4 w-4" />
                            Visualizar
                        </button>
                        {isAdmin && (
                            <DeletePatientDialog
                                patientId={patient.id}
                                patientName={patient.name}
                            />
                        )}
                    </div>
                );
            },
        },
    ], [isAdmin, router]);

    return (
        <DataTable
            columns={columns}
            data={data}
            filterColumnName="name"
            filterPlaceholder="Buscar paciente..."
            showSearch={false}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
        />
    );
}
