'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarCheck, ChevronDown, Clock, User, Zap } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppointmentsControllerCreate } from '@/generated/hooks/useAppointmentsControllerCreate';
import { notificationService } from '@/services/notification.service';

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const min = i % 2 === 0 ? 0 : 30;
  return { label: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`, hour, min };
});

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1h30', value: 90 },
];

interface Dentist {
  id: number;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface Patient {
  id: number;
  name?: string;
}

interface DentistCardProps {
  dentist: Dentist;
  patients: Patient[];
}

export function DentistCard({ dentist, patients }: DentistCardProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('30');

  const [timeOpen, setTimeOpen] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const { mutate: createAppointment, isPending } = useAppointmentsControllerCreate();

  const initials = dentist.name
    ? dentist.name
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const handleBook = () => {
    if (!selectedTime || !selectedPatient) {
      notificationService.error('Selecione um horário e um paciente.');
      return;
    }
    const [h, m] = selectedTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    createAppointment(
      {
        data: {
          date: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          duration: Number(selectedDuration),
          dentistId: dentist.id,
          patientId: Number(selectedPatient),
        },
      },
      {
        onSuccess: () => {
          notificationService.success(
            `Consulta agendada às ${selectedTime} com ${dentist.name.split(' ')[0]}!`,
          );
          queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          setOpen(false);
          setSelectedTime('');
          setSelectedPatient('');
          setPatientSearch('');
          setSelectedDuration('30');
        },
        onError: () => notificationService.error('Horário indisponível. Tente outro.'),
      },
    );
  };

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()),
  );
  const selectedPatientName =
    patients.find((p) => String(p.id) === selectedPatient)?.name || 'Selecionar paciente...';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="group flex min-w-[64px] cursor-pointer flex-col items-center gap-2 outline-none">
              <div className="relative">
                <Avatar className="ring-offset-background group-hover:ring-primary h-14 w-14 border-2 border-white shadow-md transition-all duration-200 group-hover:ring-2 group-hover:ring-offset-2">
                  <AvatarImage
                    src={dentist.avatarUrl}
                    alt={dentist.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <span className="group-hover:text-primary line-clamp-1 max-w-[64px] text-[12px] font-semibold text-gray-700 transition-colors">
                {dentist.name?.split(' ')[0]}
              </span>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={10}
          className="border-slate-800 bg-slate-900 font-medium text-white"
        >
          {dentist.name}
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-72 rounded-2xl border-gray-100 p-0 shadow-xl"
        align="start"
        sideOffset={10}
      >
        <div className="from-primary/5 to-primary/10 flex items-center gap-3 rounded-t-2xl bg-gradient-to-br p-4">
          <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
            <AvatarImage src={dentist.avatarUrl} alt={dentist.name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{dentist.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-[11px] font-medium text-emerald-600">Disponível hoje</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 h-5 shrink-0 rounded-full px-2 text-[10px] font-semibold uppercase">
            {dentist.role === 'OWNER' || dentist.role === 'ADMIN'
              ? 'Administrador'
              : dentist.role === 'DENTIST'
                ? 'Dentista'
                : dentist.role}
          </Badge>
        </div>

        <div className="space-y-3 p-4">
          <div className={`relative space-y-1.5 ${timeOpen ? 'z-30' : 'z-20'}`}>
            <label className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              <Clock className="h-3 w-3" /> Horário
            </label>
            <div
              className="relative"
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setTimeOpen(false);
              }}
            >
              <button
                type="button"
                onClick={() => setTimeOpen(!timeOpen)}
                className={`focus:ring-primary/20 flex h-9 w-full items-center justify-between rounded-xl border bg-transparent py-0 pr-8 pl-3 text-[13px] transition-colors outline-none focus:ring-2 ${timeOpen ? 'border-primary/40 bg-primary/5 text-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <span className={selectedTime ? 'font-medium text-gray-900' : 'text-gray-500'}>
                  {selectedTime || 'Selecionar horário...'}
                </span>
                <ChevronDown
                  className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${timeOpen ? 'text-primary rotate-180' : ''}`}
                />
              </button>

              {timeOpen && (
                <div className="custom-scrollbar absolute top-full right-0 left-0 z-50 mt-1 max-h-[160px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-xl">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.label}
                      onClick={() => {
                        setSelectedTime(slot.label);
                        setTimeOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${selectedTime === slot.label ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              <Zap className="h-3 w-3" /> Duração
            </label>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(String(d.value))}
                  className={`flex-1 cursor-pointer rounded-lg border py-1.5 text-[11px] font-semibold transition-all ${
                    selectedDuration === String(d.value)
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'hover:border-primary/40 hover:bg-primary/5 border-gray-200 text-gray-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`relative space-y-1.5 ${patientOpen ? 'z-30' : 'z-10'}`}>
            <label className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              <User className="h-3 w-3" /> Paciente
            </label>
            <div
              className="relative"
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setPatientOpen(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPatientOpen(!patientOpen);
                  if (!patientOpen) setPatientSearch('');
                }}
                className={`focus:ring-primary/20 flex h-9 w-full items-center justify-between rounded-xl border bg-transparent py-0 pr-8 pl-3 text-[13px] transition-colors outline-none focus:ring-2 ${patientOpen ? 'border-primary/40 bg-primary/5 text-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <span
                  className={`mr-2 truncate ${selectedPatient ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                >
                  {selectedPatientName}
                </span>
                <ChevronDown
                  className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${patientOpen ? 'text-primary rotate-180' : ''}`}
                />
              </button>

              {patientOpen && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                  <div className="border-b border-gray-100 bg-gray-50/50 p-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Pesquisar paciente"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="focus:border-primary/50 focus:ring-primary/20 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 transition-all placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                    />
                  </div>
                  <div className="custom-scrollbar max-h-[160px] overflow-y-auto p-1">
                    {filteredPatients.length === 0 ? (
                      <div className="px-3 py-4 text-center text-[12px] font-medium text-gray-400">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      filteredPatients.map((p: unknown) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(String(p.id));
                            setPatientOpen(false);
                            setPatientSearch('');
                          }}
                          className={`w-full truncate rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${selectedPatient === String(p.id) ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {p.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <Button
            onClick={handleBook}
            disabled={!selectedTime || !selectedPatient || isPending}
            className="h-9 w-full gap-2 rounded-xl text-[13px] font-semibold"
          >
            <CalendarCheck className="h-4 w-4" />
            {isPending ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
