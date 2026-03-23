'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, User } from 'lucide-react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { Button } from '@/components/ui/button';

interface PatientSearchCMDKProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PatientSearchCMDK({ open, onOpenChange }: PatientSearchCMDKProps) {
    const router = useRouter();
    const { data: patients = [], isLoading } = usePatientsControllerFindAll();

    const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);

    const handlePatientNavigation = (patientId: number) => {
        onOpenChange(false);
        router.push(`/patients/${patientId}`);
    };

    const handleQuickSchedule = (e: React.MouseEvent, patientId: number) => {
        e.stopPropagation(); // Prevents CMDK item from triggering navigation onSelect
        setSelectedPatientId(patientId);
        setAppointmentModalOpen(true);
    };

    // React to CMD+K or CTRL+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    return (
        <>
            <CommandDialog open={open} onOpenChange={onOpenChange} title="Pesquisar Paciente" description="Busque um paciente pelo nome ou abra a agenda">
                <CommandInput placeholder="Digite o nome do paciente..." />
                <CommandList>
                    <CommandEmpty>{isLoading ? 'Carregando pacientes...' : 'Nenhum paciente encontrado.'}</CommandEmpty>
                    <CommandGroup heading="Pacientes">
                        {Array.isArray(patients) && patients.map((patient: any) => (
                            <CommandItem
                                key={patient.id}
                                value={patient.name}
                                onSelect={() => handlePatientNavigation(patient.id)}
                                className="flex items-center justify-between py-3 !cursor-pointer border-2 border-transparent rounded-xl data-[selected=true]:border-teal-500 data-[selected=true]:bg-teal-50/50 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all mb-2 px-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                        {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{patient.name}</span>
                                        {patient.cpf && <span className="text-xs text-muted-foreground">CPF: {patient.cpf}</span>}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-8 rounded-lg"
                                        onClick={(e) => handleQuickSchedule(e, patient.id)}
                                    >
                                        <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                                        Agendar
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 rounded-lg text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePatientNavigation(patient.id);
                                        }}
                                    >
                                        <User className="mr-1.5 h-3.5 w-3.5" />
                                        Ficha
                                    </Button>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

            {/* Appointment Modal for quick scheduling */}
            {selectedPatientId && (
                <AppointmentModal
                    open={appointmentModalOpen}
                    onOpenChange={(isOpen) => {
                        setAppointmentModalOpen(isOpen);
                        if (!isOpen) { 
                            // After closing, clear the selected patient ID
                            setTimeout(() => setSelectedPatientId(undefined), 300);
                        }
                    }}
                    initialPatientId={selectedPatientId}
                />
            )}
        </>
    );
}
