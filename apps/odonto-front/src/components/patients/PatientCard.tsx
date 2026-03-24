import { useState } from 'react';
import { Phone, Mail, MapPin, Calendar, User, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PatientResponseDto } from '@/generated/ts/PatientResponseDto';

function getInitials(name: string) {
    if (!name) return 'PT';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

interface PatientCardProps {
    patient: PatientResponseDto;
    onBack?: () => void;
}

export function PatientCard({ patient }: PatientCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full mb-3 sm:mb-6">
            <div
                className={`bg-card text-card-foreground border border-border/40 shadow-sm rounded-lg transition-all duration-300 ${isExpanded ? 'pb-4' : ''}`}
            >
                {/* Header / Always Visible Area */}
                <div
                    className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-4">
                        {/* Circular Avatar */}
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm sm:text-base font-semibold tracking-tight border border-primary/20 shrink-0">
                            {getInitials(patient.name)}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground line-clamp-1">
                                    {patient.name}
                                </h1>
                                <Badge variant="outline" className="px-2 py-0 h-5 text-[0.65rem] uppercase tracking-wider text-emerald-600 border-emerald-200 bg-emerald-50 rounded-sm shrink-0">
                                    Ativo
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[0.85rem] text-muted-foreground mt-0.5">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{patient.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-muted-foreground/60 hover:text-foreground/80 transition-colors p-2">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>

                {/* Collapsible Details Area */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="px-4 md:px-5 pt-2 pb-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-[0.85rem] text-muted-foreground/80">
                            {patient.document && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-widest pl-1">CPF</span>
                                    <div className="flex items-center gap-2 group p-2 rounded-md hover:bg-muted/30 transition-colors">
                                        <User className="h-4 w-4 text-primary/60 shrink-0" />
                                        <span className="text-foreground/90 font-mono tracking-wide">{patient.document}</span>
                                    </div>
                                </div>
                            )}

                            <div className={`flex flex-col gap-1 ${!patient.email ? 'opacity-50' : ''}`}>
                                <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-widest pl-1">E-mail</span>
                                <div className="flex items-center gap-2 group p-2 rounded-md hover:bg-muted/30 transition-colors">
                                    <Mail className="h-4 w-4 text-primary/60 shrink-0" />
                                    <span className="text-foreground/90 truncate" title={patient.email || 'Sem e-mail'}>
                                        {patient.email || 'Sem e-mail'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-widest pl-1">Nascimento</span>
                                <div className="flex items-center gap-2 group p-2 rounded-md hover:bg-muted/30 transition-colors">
                                    <Calendar className="h-4 w-4 text-primary/60 shrink-0" />
                                    <span className="text-foreground/90 tracking-wide">{patient.birthDate ? format(new Date(patient.birthDate), "dd/MM/yyyy") : 'N/A'}</span>
                                </div>
                            </div>

                            {patient.address && (
                                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
                                    <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-widest pl-1">Endereço</span>
                                    <div className="flex items-center gap-2 group p-2 rounded-md hover:bg-muted/30 transition-colors">
                                        <MapPin className="h-4 w-4 text-primary/60 shrink-0" />
                                        <span className="text-foreground/90 line-clamp-2" title={patient.address}>{patient.address}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Alerts */}
                        {(patient as any).alerts && (patient as any).alerts.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4">
                                {(patient as any).alerts.map((alert: any, idx: number) => (
                                    <Badge key={idx} variant="outline" className="gap-1.5 text-xs text-red-600 border-red-200 bg-red-50 rounded-sm hover:bg-red-100 px-2 py-0.5 font-medium">
                                        <AlertCircle className="h-3 w-3" /> {alert.label}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
