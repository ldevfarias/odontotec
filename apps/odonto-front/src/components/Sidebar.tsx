'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CalendarDays,
    Settings,
    LogOut,
    Activity,
    ChevronLeft,
    ChevronRight,
    Building2,
    ChevronDown,
    Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { UpgradePlanCard } from './UpgradePlanCard';

const menuGroups = [
    {
        label: 'Principal',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', exact: true },
            { icon: CalendarDays, label: 'Agendamentos', href: '/agendamentos' },
            { icon: Users, label: 'Pacientes', href: '/patients' },
        ],
    },
    {
        label: 'Clínica',
        adminOnly: true,
        items: [
            { icon: Settings, label: 'Configurações', href: '/settings' },
        ],
    },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
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
        const stored = localStorage.getItem('sidebar-collapsed');
        if (stored === 'true') setCollapsed(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(collapsed));
    }, [collapsed]);

    const initials = user?.name
        ? user.name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
        : '?';

    const filteredGroups = menuGroups.filter((group) => {
        if (group.adminOnly && user?.role !== 'ADMIN') return false;
        return true;
    });

    return (
        <div
            className={cn(
                'hidden md:flex flex-col h-full card-surface transition-all duration-300 relative shrink-0',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed((p) => !p)}
                aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:shadow-md transition-all duration-200"
            >
                {collapsed
                    ? <ChevronRight className="h-3.5 w-3.5" />
                    : <ChevronLeft className="h-3.5 w-3.5" />
                }
            </button>

            {/* Brand header */}
            <div className={cn(
                'flex h-16 items-center border-b border-gray-100 shrink-0 transition-all duration-300',
                collapsed ? 'justify-center px-3' : 'px-5 gap-3'
            )}>
                {clinics.length > 0 ? (
                    <Popover open={clinicOpen} onOpenChange={setClinicOpen}>
                        <PopoverTrigger asChild>
                            <button className={cn(
                                "flex items-center gap-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group outline-none border border-transparent hover:border-gray-200 shrink-0 w-full text-left",
                                collapsed ? "justify-center p-1.5" : "px-2.5 py-1.5 -ml-2.5"
                            )}>
                                <div className={cn(
                                    "shrink-0 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors",
                                    collapsed ? "h-10 w-10" : "h-9 w-9"
                                )}>
                                    <Building2 className={cn("text-teal-600", collapsed ? "h-5 w-5" : "h-4 w-4")} />
                                </div>
                                {!collapsed && (
                                    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 w-full">
                                            <span className="text-sm font-semibold text-foreground leading-tight truncate">
                                                {activeClinic?.name || 'OdontoTec'}
                                            </span>
                                            {clinics.length > 1 && (
                                                <ChevronDown className="h-3 w-3 shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </button>
                        </PopoverTrigger>
                        {clinics.length > 1 && (
                            <PopoverContent className="w-64 p-1.5" align="start" sideOffset={8}>
                                <p className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Minhas Clínicas</p>
                                {clinics.map((clinic) => (
                                    <button
                                        key={clinic.id}
                                        onClick={() => handleClinicSwitch(clinic)}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <div className="h-6 w-6 rounded-md bg-teal-50 flex items-center justify-center shrink-0">
                                            <Building2 className="w-3 h-3 text-teal-600" />
                                        </div>
                                        <span className="flex-1 text-left truncate font-medium">{clinic.name}</span>
                                        {clinic.id === activeClinic?.id && (
                                            <Check className="w-4 h-4 text-teal-600 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </PopoverContent>
                        )}
                    </Popover>
                ) : (
                    <>
                        <div className={cn(
                            "shrink-0 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600",
                            collapsed ? "h-10 w-10" : "h-9 w-9"
                        )}>
                            <Building2 className={cn("text-teal-600", collapsed ? "h-5 w-5" : "h-4 w-4")} />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold text-foreground leading-tight truncate">
                                    {activeClinic?.name || 'OdontoTec'}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Navigation */}
            <nav className={cn(
                'flex-1 py-4 space-y-0.5 overflow-y-auto transition-all duration-300',
                collapsed ? 'px-2' : 'px-3'
            )}>
                {filteredGroups.map((group, gi) => (
                    <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
                        {!collapsed && (
                            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {group.label}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const active = isActive(pathname, item.href, 'exact' in item ? item.exact : undefined);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    title={collapsed ? item.label : undefined}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-3 py-2.5',
                                        'text-sm font-medium',
                                        'transition-all duration-150 group',
                                        collapsed && 'justify-center px-0',
                                        active
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
                                    )}
                                >
                                    <item.icon className={cn(
                                        'h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110',
                                        active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                                    )} />
                                    {!collapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Upgrade card */}
            {!collapsed && <UpgradePlanCard />}

            {/* User section */}
            <div className={cn(
                'shrink-0 border-t border-gray-100 transition-all duration-300',
                collapsed ? 'p-2' : 'p-3'
            )}>
                {collapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {initials}
                        </div>
                        <button
                            onClick={logout}
                            title="Sair"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                                    {user?.name || '—'}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    {user?.email || '—'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 border border-transparent hover:border-red-100"
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
