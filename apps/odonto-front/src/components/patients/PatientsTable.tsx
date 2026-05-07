import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { CreatePatientDialog } from '@/components/patients/CreatePatientDialog';
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

import {
  FilterTab,
  getAvatarColor,
  getInitials,
  hasAppointmentToday,
  isPatientActive,
  MOBILE_PAGE_SIZE,
} from './patient-table-helpers';
import { PatientsMobileList } from './PatientsMobileList';

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
  status?: 'ACTIVE' | 'INACTIVE' | string;
}

interface PatientsTableProps {
  data: Patient[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'inactive', label: 'Inativos' },
  { key: 'today', label: 'Hoje' },
];

function PatientAvatar({ name }: { name: string }) {
  const color = getAvatarColor(name);
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
}

export function PatientsTable({ data, rowSelection, setRowSelection }: PatientsTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const canCreate = user?.role === 'ADMIN' || user?.role === 'DENTIST';

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [mobilePage, setMobilePage] = useState(0);

  const counts = useMemo(
    () => ({
      all: data.length,
      active: data.filter((p) => isPatientActive(p)).length,
      inactive: data.filter((p) => !isPatientActive(p)).length,
      today: data.filter((p) => hasAppointmentToday(p)).length,
    }),
    [data],
  );

  const filteredData = useMemo(() => {
    let result = data;
    if (activeTab === 'active') result = result.filter((p) => isPatientActive(p));
    else if (activeTab === 'inactive') result = result.filter((p) => !isPatientActive(p));
    else if (activeTab === 'today') result = result.filter((p) => hasAppointmentToday(p));

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.phone || '').includes(q),
      );
    }
    return result;
  }, [data, activeTab, search]);

  const mobileTotalPages = Math.max(1, Math.ceil(filteredData.length / MOBILE_PAGE_SIZE));

  const toggleMobileSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRowSelection((prev) => ({ ...prev, [String(id)]: !prev[String(id)] }));
  };

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
            className="translate-y-0.5"
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-0.5"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: 'Paciente',
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <div className="flex items-center gap-3">
              <PatientAvatar name={patient.name} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-gray-900">{patient.name}</span>
                {hasAppointmentToday(patient) && (
                  <span className="w-fit rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                    Consulta hoje
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Telefone',
        cell: ({ row }) => (
          <span className="text-[13px] text-gray-500">{row.getValue('phone') || '—'}</span>
        ),
      },
      {
        accessorKey: 'lastProcedureDate',
        header: 'Último Proc.',
        cell: ({ row }) => {
          const d = row.getValue<string>('lastProcedureDate');
          return (
            <span className="text-[13px] text-gray-500">
              {d ? format(new Date(d), 'dd/MM/yyyy') : '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'nextAppointmentDate',
        header: 'Próxima Consulta',
        cell: ({ row }) => {
          const d = row.getValue<string>('nextAppointmentDate');
          if (!d) return <span className="text-[13px] text-gray-400">—</span>;
          return (
            <span className="rounded-md bg-teal-50 px-2.5 py-1 text-[12px] font-semibold text-teal-700">
              {format(new Date(d), 'dd/MM/yyyy HH:mm')}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const active = isPatientActive(row.original);
          return (
            <span
              className={cn(
                'rounded-md px-2.5 py-1 text-[12px] font-semibold',
                active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500',
              )}
            >
              {active ? 'Ativo' : 'Inativo'}
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
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-teal-50 px-3 text-[13px] font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                onClick={() => router.push(`/patients/${patient.id}`)}
              >
                <Eye className="h-3.5 w-3.5" />
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
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full cursor-text sm:max-w-96 sm:flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou telefone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMobilePage(0);
            }}
            className="h-10 cursor-text rounded-full border-gray-200 pl-9 text-[13px] shadow-none focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setMobilePage(0);
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-bold',
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center">{canCreate && <CreatePatientDialog />}</div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={filteredData}
          filterColumnName="name"
          filterPlaceholder="Buscar paciente..."
          showSearch={false}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <PatientsMobileList
          data={filteredData}
          page={mobilePage}
          totalPages={mobileTotalPages}
          rowSelection={rowSelection}
          isAdmin={isAdmin}
          onPageChange={setMobilePage}
          onToggleSelect={toggleMobileSelect}
        />
      </div>
    </>
  );
}
