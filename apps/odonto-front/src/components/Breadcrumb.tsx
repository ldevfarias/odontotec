'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const segmentLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    patients: 'Pacientes',
    agenda: 'Agenda',
    financial: 'Financeiro',
    settings: 'Configurações',
    treatments: 'Tratamentos',
    professionals: 'Profissionais',
    billing: 'Assinatura & Cobrança',
    clinic: 'Dados da Clínica',
    procedures: 'Procedimentos',
    team: 'Equipe',
    reminders: 'Lembretes'
};

export function Breadcrumb() {
    const pathname = usePathname();

    // Ignore root or purely '/'
    if (!pathname || pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);

    // Only show breadcrumb if it contains 'settings'
    if (!segments.includes('settings')) return null;

    return (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground overflow-hidden whitespace-nowrap mb-6">
            <Link
                href="/dashboard"
                className="flex items-center hover:text-primary transition-colors duration-150 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-sm"
            >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
            </Link>

            {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;

                // Reconstruct path up to this segment
                const href = '/' + segments.slice(0, index + 1).join('/');

                // Try to get a friendly label, fallback to capitalized segment 
                // or if it looks like an ID, use "Detalhes"
                let label = segmentLabels[segment];
                if (!label) {
                    if (segment.length > 20 || /^[0-9a-fA-F-]+$/.test(segment) || segment.startsWith('cm')) {
                        label = 'Detalhes';
                    } else {
                        // Capitalize first letter
                        label = segment.charAt(0).toUpperCase() + segment.slice(1);
                    }
                }

                return (
                    <div key={href} className="flex items-center space-x-1.5 shrink-0">
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        {isLast ? (
                            <span className="font-semibold text-gray-800 truncate block max-w-[200px]" aria-current="page">
                                {label}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-primary transition-colors duration-150 truncate block max-w-[150px] outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-sm"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
