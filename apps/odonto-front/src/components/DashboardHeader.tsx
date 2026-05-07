'use client';

import { Camera, ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PatientSearchCMDK } from '@/components/patients/PatientSearchCMDK';
import { AvatarUploadModal } from '@/components/profile/AvatarUploadModal';
import { Sidebar } from '@/components/Sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

import { NotificationBell } from './notifications/NotificationBell';

export function DashboardHeader() {
  const { user, logout, activeClinic } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : '?';

  return (
    <header className="card-surface flex min-h-[4rem] shrink-0 items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:px-6">
      {/* Left: Mobile Menu & Logo */}
      <div className="flex flex-1 items-center gap-3 overflow-hidden pr-4">
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-50 active:scale-95">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col border-r-0 p-0">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>
        </div>
        <div
          className="flex shrink-0 cursor-pointer items-center gap-2 transition-opacity hover:opacity-90"
          onClick={() => router.push('/dashboard')}
        >
          <span className="text-[1.1rem] font-bold tracking-tight text-gray-800 sm:text-xl">
            Odonto<span className="font-extrabold text-teal-600">Eh</span>Tec
          </span>
        </div>
      </div>

      {/* Search Trigger */}
      <div className="group relative mr-4 hidden w-full max-w-sm md:block">
        <button
          onClick={() => setSearchOpen(true)}
          className="text-muted-foreground focus-visible:ring-primary/20 relative flex h-10 w-full cursor-pointer items-center justify-between rounded-full border border-gray-100 bg-gray-50 py-2 pr-3 pl-4 text-sm shadow-sm transition-all group-hover:bg-gray-100/50 hover:border-gray-200 focus-visible:ring-1 focus-visible:outline-none"
        >
          <div className="flex items-center gap-2">
            <Search className="group-hover:text-primary h-4 w-4 transition-colors duration-200" />
            <span>Pesquisar paciente</span>
          </div>
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-3">
        <NotificationBell />
        <div className="hidden h-8 w-[1px] bg-gray-200 sm:block" />

        {/* User Profile Popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors outline-none hover:bg-gray-50">
              <div className="bg-primary/10 text-primary border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-bold shadow-sm">
                {activeClinic?.avatarUrl ? (
                  <Image
                    src={activeClinic.avatarUrl}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex hidden flex-col items-start sm:flex">
                {user?.name ? (
                  <>
                    <span className="text-sm leading-tight font-semibold text-gray-800">
                      {user.name || 'Usuário'}
                    </span>
                    <span className="text-muted-foreground text-xs leading-tight font-medium">
                      {user.email || ''}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                )}
              </div>
              <ChevronDown className="text-muted-foreground hidden h-3.5 w-3.5 transition-colors group-hover:text-gray-700 sm:block" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5" align="end">
            <button
              onClick={() => {
                setOpen(false);
                setAvatarModalOpen(true);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Camera className="text-muted-foreground h-4 w-4" />
              Alterar foto
            </button>
            <Separator className="my-1" />
            {activeClinic?.role !== 'DENTIST' && (
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/settings');
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Settings className="text-muted-foreground h-4 w-4" />
                Configurações
              </button>
            )}
            <Separator className="my-1" />
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Sair da aplicação
            </button>
          </PopoverContent>
        </Popover>

        {/* Avatar upload modal — rendered outside Popover to avoid nesting issues */}
        <AvatarUploadModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />
      </div>

      {/* CMDK Search Palette */}
      <PatientSearchCMDK open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
