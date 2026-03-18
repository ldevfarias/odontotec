'use client';

import { useState } from 'react';

import { NotificationBell } from './notifications/NotificationBell';
import { Search, Settings, LogOut, ChevronDown, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
        : '?';

    return (
        <header className="card-surface min-h-[4rem] flex items-center justify-between px-6 py-3 shrink-0 rounded-2xl border border-gray-100 shadow-sm bg-white">
            {/* Left: Logo */}
            <div className="flex items-center flex-1 overflow-hidden pr-4 gap-4">
                <div 
                    className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => router.push('/dashboard')}
                >
                    <span className="font-bold text-xl tracking-tight text-gray-800 hidden md:block">
                        Odonto<span className="text-teal-600 font-extrabold">Eh</span>Tec
                    </span>
                </div>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-sm hidden md:block group mr-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                <Input
                    placeholder="Pesquisar..."
                    className="pl-11 rounded-full bg-gray-50 border-gray-100 shadow-sm hover:border-gray-200 focus-visible:ring-1 focus-visible:ring-primary/20 h-10 w-full transition-all text-sm"
                />
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
        </header>
    );
}
