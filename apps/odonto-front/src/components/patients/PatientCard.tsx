import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';

interface PatientAlert {
  label: string;
}

interface PatientCardData {
  name: string;
  phone?: string;
  document?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  alerts?: PatientAlert[];
}

function getInitials(name: string) {
  if (!name) return 'PT';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

interface PatientCardProps {
  patient: PatientCardData;
}

export function PatientCard({ patient }: PatientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-3 w-full sm:mb-6">
      <div
        className={`bg-card text-card-foreground border-border/40 rounded-lg border shadow-sm transition-all duration-300 ${isExpanded ? 'pb-4' : ''}`}
      >
        {/* Header / Always Visible Area */}
        <div
          className="hover:bg-muted/30 flex cursor-pointer items-center justify-between rounded-t-lg p-4 transition-colors md:p-5"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            {/* Circular Avatar */}
            <div className="bg-primary/10 text-primary border-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tracking-tight sm:h-14 sm:w-14 sm:text-base">
              {getInitials(patient.name)}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-foreground line-clamp-1 text-xl font-semibold tracking-tight">
                  {patient.name}
                </h1>
                <Badge
                  variant="outline"
                  className="h-5 shrink-0 rounded-sm border-emerald-200 bg-emerald-50 px-2 py-0 text-[0.65rem] tracking-wider text-emerald-600 uppercase"
                >
                  Ativo
                </Badge>
              </div>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[0.85rem]">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.phone}</span>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground/60 hover:text-foreground/80 p-2 transition-colors">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>

        {/* Collapsible Details Area */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 pt-2 pb-2 md:px-5">
            <div className="text-muted-foreground/80 grid grid-cols-1 gap-x-6 gap-y-3 text-[0.85rem] sm:grid-cols-2 lg:grid-cols-3">
              {patient.document && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground/60 pl-1 text-[0.7rem] font-semibold tracking-widest uppercase">
                    CPF
                  </span>
                  <div className="group hover:bg-muted/30 flex items-center gap-2 rounded-md p-2 transition-colors">
                    <User className="text-primary/60 h-4 w-4 shrink-0" />
                    <span className="text-foreground/90 font-mono tracking-wide">
                      {patient.document}
                    </span>
                  </div>
                </div>
              )}

              <div className={`flex flex-col gap-1 ${!patient.email ? 'opacity-50' : ''}`}>
                <span className="text-muted-foreground/60 pl-1 text-[0.7rem] font-semibold tracking-widest uppercase">
                  E-mail
                </span>
                <div className="group hover:bg-muted/30 flex items-center gap-2 rounded-md p-2 transition-colors">
                  <Mail className="text-primary/60 h-4 w-4 shrink-0" />
                  <span
                    className="text-foreground/90 truncate"
                    title={patient.email || 'Sem e-mail'}
                  >
                    {patient.email || 'Sem e-mail'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground/60 pl-1 text-[0.7rem] font-semibold tracking-widest uppercase">
                  Nascimento
                </span>
                <div className="group hover:bg-muted/30 flex items-center gap-2 rounded-md p-2 transition-colors">
                  <Calendar className="text-primary/60 h-4 w-4 shrink-0" />
                  <span className="text-foreground/90 tracking-wide">
                    {patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy') : 'N/A'}
                  </span>
                </div>
              </div>

              {patient.address && (
                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
                  <span className="text-muted-foreground/60 pl-1 text-[0.7rem] font-semibold tracking-widest uppercase">
                    Endereço
                  </span>
                  <div className="group hover:bg-muted/30 flex items-center gap-2 rounded-md p-2 transition-colors">
                    <MapPin className="text-primary/60 h-4 w-4 shrink-0" />
                    <span className="text-foreground/90 line-clamp-2" title={patient.address}>
                      {patient.address}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Alerts */}
            {patient.alerts && patient.alerts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {patient.alerts.map((alert, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="gap-1.5 rounded-sm border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
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
