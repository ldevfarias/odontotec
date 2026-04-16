import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
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
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
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
    .map((n) => n[0])
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
    return data.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.phone || '').toLowerCase().includes(q),
    );
  }, [data, mobileSearch]);

  const mobileTotalPages = Math.max(1, Math.ceil(mobileFiltered.length / MOBILE_PAGE_SIZE));
  const mobilePageData = mobileFiltered.slice(
    mobilePage * MOBILE_PAGE_SIZE,
    (mobilePage + 1) * MOBILE_PAGE_SIZE,
  );

  const toggleMobileSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = String(id);
    setRowSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Desktop columns ───────────────────────────────────────────
  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
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
        cell: ({ row }) => (
          <div className="body-regular text-foreground font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Telefone',
        cell: ({ row }) => (
          <span className="body-regular text-muted-foreground">{row.getValue('phone') || '-'}</span>
        ),
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
            <div
              className="flex items-center justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="bg-primary/5 text-primary hover:bg-primary/10 flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors"
                onClick={() => router.push(`/patients/${patient.id}`)}
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </button>
              {isAdmin && <DeletePatientDialog patientId={patient.id} patientName={patient.name} />}
            </div>
          );
        },
      },
    ],
    [isAdmin, router],
  );

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
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={mobileSearch}
            onChange={(e) => {
              setMobileSearch(e.target.value);
              setMobilePage(0);
            }}
            className="h-10 pl-9"
          />
        </div>

        {/* Cards */}
        {mobilePageData.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center text-sm">
            Nenhum paciente encontrado.
          </div>
        ) : (
          <div className="divide-border border-border bg-card flex flex-col divide-y overflow-hidden rounded-xl border">
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
                    'active:bg-muted/50 flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
                    isSelected && 'bg-primary/5',
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(patient.name)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-semibold capitalize">
                      {patient.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {patient.phone || 'Sem telefone'}
                    </p>
                    {nextDate && (
                      <p className="text-primary truncate text-xs font-medium">
                        Próximo: {nextDate}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex shrink-0 items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="bg-primary/5 text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <DeletePatientDialog patientId={patient.id} patientName={patient.name} />
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
            <span className="text-muted-foreground text-xs">
              {mobilePage * MOBILE_PAGE_SIZE + 1}–
              {Math.min((mobilePage + 1) * MOBILE_PAGE_SIZE, mobileFiltered.length)} de{' '}
              {mobileFiltered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={mobilePage === 0}
                onClick={() => setMobilePage((p) => p - 1)}
                className="border-border flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={mobilePage >= mobileTotalPages - 1}
                onClick={() => setMobilePage((p) => p + 1)}
                className="border-border flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40"
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
