'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  reminders: 'Lembretes',
};

export function Breadcrumb() {
  const pathname = usePathname();

  // Ignore root or purely '/'
  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  // Only show breadcrumb if it contains 'settings'
  if (!segments.includes('settings')) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground mb-6 flex items-center space-x-2 overflow-hidden text-sm whitespace-nowrap"
    >
      <Link
        href="/dashboard"
        className="hover:text-primary focus-visible:ring-primary/20 flex shrink-0 items-center rounded-sm transition-colors duration-150 outline-none focus-visible:ring-2"
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
          <div key={href} className="flex shrink-0 items-center space-x-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            {isLast ? (
              <span
                className="block max-w-[200px] truncate font-semibold text-gray-800"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-primary focus-visible:ring-primary/20 block max-w-[150px] truncate rounded-sm transition-colors duration-150 outline-none focus-visible:ring-2"
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
