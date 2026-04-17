'use client';

import {
  Building2, CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

import { UpgradePlanCard } from './UpgradePlanCard';

const menuGroups = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', exact: true },
      { icon: CalendarDays, label: 'Agendamentos', href: '/agendamentos', dataTour: 'nav-appointments' },
      { icon: Users, label: 'Pacientes', href: '/patients', dataTour: 'nav-patients' },
    ],
  },
  {
    label: 'Clínica',
    adminOnly: true,
    items: [{ icon: Settings, label: 'Configurações', href: '/settings' }],
  },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar({ className, isMobile }: { className?: string; isMobile?: boolean } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, activeClinic, setActiveClinic, clinics, user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [clinicOpen, setClinicOpen] = useState(false);

  const handleClinicSwitch = (clinic: typeof activeClinic) => {
    if (clinic && clinic.id !== activeClinic?.id) {
      setActiveClinic(clinic);
      setClinicOpen(false);
      // Refresh data by navigating to dashboard
      router.push('/dashboard');
      router.refresh();
    } else {
      setClinicOpen(false);
    }
  };

  // Persist collapsed state after hydration
  useEffect(() => {
    if (isMobile) return;
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const handler = () => setCollapsed(false);
    window.addEventListener('tour:expand-sidebar', handler);
    return () => window.removeEventListener('tour:expand-sidebar', handler);
  }, [isMobile]);

  const initials = user?.name
    ? user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('')
    : '?';

  const filteredGroups = menuGroups.filter((group) => {
    if (group.adminOnly) {
      const isAdmin =
        user?.role === 'ADMIN' || activeClinic?.role === 'ADMIN' || activeClinic?.role === 'OWNER';
      if (!isAdmin) return false;
    }
    return true;
  });

  const isCollapsed = !isMobile && collapsed;

  return (
    <div
      className={cn(
        'card-surface relative flex h-full shrink-0 flex-col transition-all duration-300',
        isMobile ? 'w-full border-none' : 'hidden md:flex',
        !isMobile && (collapsed ? 'w-16' : 'w-64'),
        className,
      )}
    >
      {/* Collapse toggle */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className="absolute top-6 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all duration-200 hover:text-gray-700 hover:shadow-md"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Brand header */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-gray-100 transition-all duration-300',
          isCollapsed ? 'justify-center px-3' : 'gap-3 px-5',
        )}
      >
        {clinics.length > 0 ? (
          <Popover open={clinicOpen} onOpenChange={setClinicOpen}>
            <PopoverTrigger asChild>
              <button
                data-tour="clinic-header"
                className={cn(
                  'group flex w-full shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-transparent text-left transition-colors outline-none hover:border-gray-200 hover:bg-gray-50',
                  isCollapsed ? 'justify-center p-1.5' : '-ml-2.5 px-2.5 py-1.5',
                )}
              >
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100',
                    isCollapsed ? 'h-10 w-10' : 'h-9 w-9',
                  )}
                >
                  <Building2 className={cn('text-teal-600', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                </div>
                {!isCollapsed && (
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="text-foreground truncate text-sm leading-tight font-semibold">
                        {activeClinic?.name || 'OdontoTec'}
                      </span>
                      {clinics.length > 1 && (
                        <ChevronDown className="h-3 w-3 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
                      )}
                    </div>
                  </div>
                )}
              </button>
            </PopoverTrigger>
            {clinics.length > 1 && (
              <PopoverContent className="w-64 p-1.5" align="start" sideOffset={8}>
                <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Minhas Clínicas
                </p>
                {clinics.map((clinic) => (
                  <button
                    key={clinic.id}
                    onClick={() => handleClinicSwitch(clinic)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-50">
                      <Building2 className="h-3 w-3 text-teal-600" />
                    </div>
                    <span className="flex-1 truncate text-left font-medium">{clinic.name}</span>
                    {clinic.id === activeClinic?.id && (
                      <Check className="h-4 w-4 shrink-0 text-teal-600" />
                    )}
                  </button>
                ))}
              </PopoverContent>
            )}
          </Popover>
        ) : (
          <>
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600',
                isCollapsed ? 'h-10 w-10' : 'h-9 w-9',
              )}
            >
              <Building2 className={cn('text-teal-600', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-foreground truncate text-sm leading-tight font-semibold">
                  {activeClinic?.name || 'OdontoTec'}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'flex flex-1 flex-col overflow-y-auto py-4 transition-all duration-300',
          isCollapsed ? 'px-2' : 'px-3',
        )}
      >
        <div className="space-y-0.5">
          {filteredGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {!isCollapsed && (
                <p className="text-muted-foreground px-3 pb-1.5 text-[10px] font-semibold tracking-widest uppercase">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = isActive(
                  pathname,
                  item.href,
                  'exact' in item ? item.exact : undefined,
                );
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    title={isCollapsed ? item.label : undefined}
                    data-tour={'dataTour' in item ? item.dataTour : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5',
                      'text-sm font-medium',
                      'group transition-all duration-150',
                      isCollapsed && 'justify-center px-0',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-100',
                      isMobile && 'active:scale-[0.98]',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110',
                        active
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-primary',
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Upgrade card stacking right below the menu */}
        {!isCollapsed && (
          <div className="mt-8 mb-2">
            <UpgradePlanCard />
          </div>
        )}
      </nav>

      {/* User section */}
      <div
        className={cn(
          'shrink-0 border-t border-gray-100 transition-all duration-300',
          isCollapsed ? 'p-2' : 'p-3',
        )}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {initials}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground truncate text-sm leading-tight font-semibold">
                  {user?.name || '—'}
                </span>
                <span className="text-muted-foreground truncate text-xs">{user?.email || '—'}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent py-1.5 text-xs font-semibold text-red-500 transition-all duration-150 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
