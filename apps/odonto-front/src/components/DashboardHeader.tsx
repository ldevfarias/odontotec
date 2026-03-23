'use client';

import { useState } from 'react';

import { NotificationBell } from './notifications/NotificationBell';
import { Search, Settings, LogOut, ChevronDown, Target, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientSearchCMDK } from '@/components/patients/PatientSearchCMDK';
import { Sidebar } from '@/components/Sidebar';

export function DashboardHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
        : '?';

    return (
        <header className="card-surface min-h-[4rem] flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 rounded-2xl border border-gray-100 shadow-sm bg-white">
            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center flex-1 overflow-hidden pr-4 gap-3">
                <div className="md:hidden flex items-center">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors active:scale-95">
                                <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 flex flex-col border-r-0">
                            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                            <Sidebar isMobile />
                        </SheetContent>
                    </Sheet>
                </div>
                <div
                    className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => router.push('/dashboard')}
                >
                    <span className="font-bold text-[1.1rem] sm:text-xl tracking-tight text-gray-800">
                        Odonto<span className="text-teal-600 font-extrabold">Eh</span>Tec
                    </span>
                </div>
            </div>

            {/* Search Trigger */}
            <div className="relative w-full max-w-sm hidden md:block group mr-4">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="relative w-full flex items-center justify-between pl-4 pr-3 py-2 text-sm text-muted-foreground rounded-full bg-gray-50 border border-gray-100 shadow-sm hover:border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all h-10 group-hover:bg-gray-100/50 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                        <span>Pesquisar paciente</span>
                    </div>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Notification Bell - rendered directly, no wrapper div */}
                <NotificationBell />

                <div className="w-[1px] h-8 bg-gray-200 hidden sm:block" />

                {/* User Profile Popover */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer group outline-none">
                            <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-sm font-bold text-primary shadow-sm border border-primary/20 shrink-0">
                                {initials}
                            </div>
                            <div className="flex flex-col items-start hidden sm:flex">
                                {user?.name ? (
                                    <>
                                        <span className="text-sm font-semibold text-gray-800 leading-tight">{user.name || 'Usuário'}</span>
                                        <span className="text-xs text-muted-foreground font-medium leading-tight">{user.email || ''}</span>
                                    </>
                                ) : (
                                    <div className="space-y-1.5 flex flex-col">
                                        <Skeleton className="h-3.5 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                )}
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block group-hover:text-gray-700 transition-colors" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1.5" align="end">
                        <button
                            onClick={() => { setOpen(false); router.push('/settings'); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            Configurações
                        </button>
                        <Separator className="my-1" />
                        <button
                            onClick={() => { setOpen(false); logout(); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair da aplicação
                        </button>
                    </PopoverContent>
                </Popover>
            </div>

            {/* CMDK Search Palette */}
            <PatientSearchCMDK open={searchOpen} onOpenChange={setSearchOpen} />
        </header>
    );
}
