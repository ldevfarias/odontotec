'use client';

import { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Zap, CalendarCheck, User, ChevronDown } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { useAuth } from '@/contexts/AuthContext';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { useAppointmentsControllerCreate } from '@/generated/hooks/useAppointmentsControllerCreate';
import { useQueryClient } from '@tanstack/react-query';

// Available time slots for today (08:00 – 18:00 in 30min increments)
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

interface DentistCardProps {
    dentist: any;
    patients: any[];
}

function DentistCard({ dentist, patients }: DentistCardProps) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [selectedDuration, setSelectedDuration] = useState<string>('30');

    // Custom dropdown states
    const [timeOpen, setTimeOpen] = useState(false);
    const [patientOpen, setPatientOpen] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');
    const { mutate: createAppointment, isPending } = useAppointmentsControllerCreate();

    const initials = dentist.name
        ? dentist.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
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
            { data: { date: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"), duration: Number(selectedDuration), dentistId: dentist.id, patientId: Number(selectedPatient) } },
            {
                onSuccess: () => {
                    notificationService.success(`Consulta agendada às ${selectedTime} com ${dentist.name.split(' ')[0]}!`);
                    queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
                    setOpen(false);
                    setSelectedTime('');
                    setSelectedPatient('');
                    setPatientSearch('');
                    setSelectedDuration('30');
                },
                onError: () => notificationService.error('Horário indisponível. Tente outro.'),
            }
        );
    };

    const filteredPatients = patients.filter(p => p.name?.toLowerCase().includes(patientSearch.toLowerCase()));
    const selectedPatientName = patients.find(p => String(p.id) === selectedPatient)?.name || 'Selecionar paciente...';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <button className="flex flex-col items-center gap-2 min-w-[64px] group cursor-pointer outline-none">
                            <div className="relative">
                                <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-offset-background transition-all duration-200 group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2">
                                    <AvatarImage src={dentist.avatarUrl} alt={dentist.name} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{initials}</AvatarFallback>
                                </Avatar>
                                {/* Online indicator */}
                                <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
                            </div>
                            <span className="text-[12px] font-semibold text-gray-700 group-hover:text-primary transition-colors line-clamp-1 max-w-[64px]">
                                {dentist.name?.split(' ')[0]}
                            </span>
                        </button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10} className="bg-slate-900 border-slate-800 text-white font-medium">
                    {dentist.name}
                </TooltipContent>
            </Tooltip>

            <PopoverContent className="w-72 p-0 shadow-xl rounded-2xl border-gray-100" align="start" sideOffset={10}>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-2xl">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                        <AvatarImage src={dentist.avatarUrl} alt={dentist.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{dentist.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <p className="text-[11px] text-emerald-600 font-medium">Disponível hoje</p>
                        </div>
                    </div>
                    <Badge className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 rounded-full px-2 h-5 shrink-0 uppercase">
                        {dentist.role === 'OWNER' || dentist.role === 'ADMIN' ? 'Administrador' : (dentist.role === 'DENTIST' ? 'Dentista' : dentist.role)}
                    </Badge>
                </div>

                <div className="p-4 space-y-3">
                    {/* Time Slot Custom Select */}
                    <div className={`space-y-1.5 relative ${timeOpen ? 'z-30' : 'z-20'}`}>
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
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
                                className={`w-full h-9 py-0 pl-3 pr-8 text-[13px] bg-transparent border rounded-xl flex items-center justify-between transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${timeOpen ? 'border-primary/40 text-gray-900 bg-primary/5' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <span className={selectedTime ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                                    {selectedTime || 'Selecionar horário...'}
                                </span>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform ${timeOpen ? 'rotate-180 text-primary' : ''}`} />
                            </button>

                            {timeOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 max-h-[160px] overflow-y-auto bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-1 custom-scrollbar">
                                    {TIME_SLOTS.map(slot => (
                                        <button
                                            key={slot.label}
                                            onClick={() => { setSelectedTime(slot.label); setTimeOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${selectedTime === slot.label ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Duração
                        </label>
                        <div className="flex gap-1.5">
                            {DURATIONS.map(d => (
                                <button
                                    key={d.value}
                                    onClick={() => setSelectedDuration(String(d.value))}
                                    className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg border transition-all cursor-pointer ${selectedDuration === String(d.value)
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-primary/5'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Patient Custom Searchable Select */}
                    <div className={`space-y-1.5 relative ${patientOpen ? 'z-30' : 'z-10'}`}>
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <User className="h-3 w-3" /> Paciente
                        </label>
                        <div
                            className="relative"
                            tabIndex={0}
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setPatientOpen(false);
                                    // Let search linger while closing for smoother UX
                                }
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setPatientOpen(!patientOpen);
                                    if (!patientOpen) setPatientSearch('');
                                }}
                                className={`w-full h-9 py-0 pl-3 pr-8 text-[13px] bg-transparent border rounded-xl flex items-center justify-between transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${patientOpen ? 'border-primary/40 text-gray-900 bg-primary/5' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <span className={`truncate mr-2 ${selectedPatient ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {selectedPatientName}
                                </span>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform ${patientOpen ? 'rotate-180 text-primary' : ''}`} />
                            </button>

                            {patientOpen && (
                                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 shadow-xl rounded-xl z-50 flex flex-col overflow-hidden">
                                    <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Pesquisar paciente"
                                            value={patientSearch}
                                            onChange={(e) => setPatientSearch(e.target.value)}
                                            className="w-full text-[13px] px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div className="max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
                                        {filteredPatients.length === 0 ? (
                                            <div className="px-3 py-4 text-center text-[12px] text-gray-400 font-medium">
                                                Nenhum paciente encontrado
                                            </div>
                                        ) : (
                                            filteredPatients.map((p: any) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => { setSelectedPatient(String(p.id)); setPatientOpen(false); setPatientSearch(''); }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors truncate ${selectedPatient === String(p.id) ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
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
                        className="w-full h-9 text-[13px] font-semibold rounded-xl gap-2"
                    >
                        <CalendarCheck className="h-4 w-4" />
                        {isPending ? 'Agendando...' : 'Confirmar Agendamento'}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function DentistQuickBook() {
    const { user: currentUser } = useAuth();
    const { data: users = [] } = useUsersControllerFindAll();
    const { data: allPatients = [] } = usePatientsControllerFindAll();
    
    const allowedRoles = ['DENTIST', 'ADMIN', 'OWNER'];
    let professionals = (users as any[])
        .filter(u => u.role && allowedRoles.includes(u.role.toUpperCase()))
        .sort((a, b) => {
            const roleA = a.role.toUpperCase();
            const roleB = b.role.toUpperCase();
            
            // Prioritize OWNER and ADMIN
            const priority = (role: string) => (role === 'OWNER' ? 0 : role === 'ADMIN' ? 1 : 2);
            return priority(roleA) - priority(roleB);
        });

    // If the user is a dentist, only show themselves
    if (currentUser?.role?.toUpperCase() === 'DENTIST') {
        professionals = professionals.filter(u => u.id === currentUser.id);
    }

    const todayFormatted = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

    return (
        <div className="bg-white rounded-[20px] px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-3 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                        <CalendarCheck className="h-4 w-4 text-primary" />
                        Agendamento Rápido
                    </h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        Clique em um profissional para agendar uma consulta para hoje &middot; <span className="capitalize">{todayFormatted}</span>
                    </p>
                </div>
                <Badge variant="outline" className="text-[11px] font-semibold text-emerald-600 border-emerald-200 bg-emerald-50 rounded-full px-2.5 h-5 shrink-0">
                    {professionals.length} disponíveis
                </Badge>
            </div>

            {/* Dentist List */}
            {professionals.length === 0 ? (
                <div className="flex items-center gap-2 py-2 text-[13px] text-gray-400">
                    <User className="h-4 w-4" />
                    Nenhum profissional encontrado na clínica.
                </div>
            ) : (
                <TooltipProvider delayDuration={300}>
                    <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide pb-3 pt-1 -mx-1 px-1">
                        {professionals.map((dentist: any) => (
                            <DentistCard key={dentist.id} dentist={dentist} patients={allPatients as any[]} />
                        ))}
                    </div>
                </TooltipProvider>
            )}
        </div>
    );
}
