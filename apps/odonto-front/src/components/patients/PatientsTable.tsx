import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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

const MOBILE_PAGE_SIZE = 15;

const AVATAR_COLORS = [
    '#2563eb', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#0891b2', '#db2777', '#65a30d',
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function PatientsTable({ data, rowSelection, setRowSelection }: PatientsTableProps) {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    // ── Mobile state ──────────────────────────────────────────────
    const [mobileSearch, setMobileSearch] = useState('');
    const [mobilePage, setMobilePage] = useState(0);

    const mobileFiltered = useMemo(() => {
        const q = mobileSearch.toLowerCase().trim();
        if (!q) return data;
        return data.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.phone || '').toLowerCase().includes(q)
        );
    }, [data, mobileSearch]);

    const mobileTotalPages = Math.max(1, Math.ceil(mobileFiltered.length / MOBILE_PAGE_SIZE));
    const mobilePageData = mobileFiltered.slice(
        mobilePage * MOBILE_PAGE_SIZE,
        (mobilePage + 1) * MOBILE_PAGE_SIZE
    );

    const toggleMobileSelect = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const key = String(id);
        setRowSelection(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ── Desktop columns ───────────────────────────────────────────
    const columns = useMemo<ColumnDef<Patient>[]>(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
        <>
            {/* ── Desktop table ── */}
            <div className="hidden sm:block">
                <DataTable
                    columns={columns}
                    data={data}
                    filterColumnName="name"
                    filterPlaceholder="Buscar paciente..."
                    showSearch={false}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            </div>

            {/* ── Mobile card list ── */}
            <div className="sm:hidden flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        value={mobileSearch}
                        onChange={(e) => { setMobileSearch(e.target.value); setMobilePage(0); }}
                        className="pl-9 h-10"
                    />
                </div>

                {/* Cards */}
                {mobilePageData.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        Nenhum paciente encontrado.
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
                        {mobilePageData.map((patient) => {
                            const isSelected = !!rowSelection[String(patient.id)];
                            const color = getAvatarColor(patient.name);
                            const nextDate = patient.nextAppointmentDate
                                ? format(new Date(patient.nextAppointmentDate), "dd/MM 'às' HH:mm")
                                : null;

                            return (
                                <div
                                    key={patient.id}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors cursor-pointer',
                                        isSelected && 'bg-primary/5'
                                    )}
                                    onClick={() => router.push(`/patients/${patient.id}`)}
                                >
                                    {/* Checkbox */}
                                    <div onClick={(e) => toggleMobileSelect(patient.id, e)} className="shrink-0">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => {}}
                                            aria-label="Selecionar"
                                        />
                                    </div>

                                    {/* Avatar */}
                                    <div
                                        className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                        style={{ backgroundColor: color }}
                                    >
                                        {getInitials(patient.name)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate capitalize">
                                            {patient.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {patient.phone || 'Sem telefone'}
                                        </p>
                                        {nextDate && (
                                            <p className="text-xs text-primary font-medium truncate">
                                                Próximo: {nextDate}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div
                                        className="flex items-center gap-1 shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                                            onClick={() => router.push(`/patients/${patient.id}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {isAdmin && (
                                            <DeletePatientDialog
                                                patientId={patient.id}
                                                patientName={patient.name}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {mobileTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">
                            {mobilePage * MOBILE_PAGE_SIZE + 1}–{Math.min((mobilePage + 1) * MOBILE_PAGE_SIZE, mobileFiltered.length)} de {mobileFiltered.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={mobilePage === 0}
                                onClick={() => setMobilePage(p => p - 1)}
                                className="h-8 w-8 flex items-center justify-center rounded-md border border-border disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={mobilePage >= mobileTotalPages - 1}
                                onClick={() => setMobilePage(p => p + 1)}
                                className="h-8 w-8 flex items-center justify-center rounded-md border border-border disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
