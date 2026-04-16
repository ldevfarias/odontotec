import { Users } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

import { ProfessionalCard } from './ProfessionalCard';
import { CalendarEvent, CalendarState, EventCategory, Professional } from './types';

interface CalendarSidebarProps {
  state: CalendarState;
  onStateChange: (state: Partial<CalendarState>) => void;
  categories: EventCategory[];
  professionals: Professional[];
  events: CalendarEvent[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function CalendarSidebar({
  state,
  onStateChange,
  categories,
  professionals,
  events,
  mobileOpen,
  onMobileClose,
}: CalendarSidebarProps) {
  const toggleCategory = (categoryId: string) => {
    const isSelected = state.selectedCategories.includes(categoryId);
    const newCategories = isSelected
      ? state.selectedCategories.filter((id) => id !== categoryId)
      : [...state.selectedCategories, categoryId];
    onStateChange({ selectedCategories: newCategories });
  };

  const toggleProfessional = (proId: string) => {
    const isSelected = state.selectedProfessionals.includes(proId);
    const newProfessionals = isSelected
      ? state.selectedProfessionals.filter((id) => id !== proId)
      : [...state.selectedProfessionals, proId];
    onStateChange({ selectedProfessionals: newProfessionals });
  };

  const sidebarContent = (
    <>
      {/* Mini Calendar — Prominent Card */}
      <div className="shrink-0 p-3">
        <div className="border-border/60 rounded-xl border bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]">
          <Calendar
            mode="single"
            selected={state.currentDate}
            onSelect={(date) => date && onStateChange({ currentDate: date })}
            className="flex w-full justify-center rounded-lg border-transparent bg-transparent shadow-none [--cell-size:--spacing(8)]"
          />
        </div>
      </div>

      {/* Scrollable filters area */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {/* Professionals */}
        <div className="px-3 pb-3">
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <Users className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
              Profissionais
            </span>
          </div>
          <div className="space-y-1.5">
            {professionals.map((pro) => (
              <ProfessionalCard
                key={pro.id}
                professional={pro}
                isActive={state.selectedProfessionals.includes(pro.id)}
                onToggle={() => toggleProfessional(pro.id)}
                events={events}
                accentColor={pro.color}
                currentDate={state.currentDate}
                view={state.view}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="border-border bg-card/50 hidden w-[272px] shrink-0 flex-col border-r sm:flex">
        {sidebarContent}
      </div>

      {/* Mobile sidebar as bottom Sheet */}
      <Sheet open={mobileOpen} onOpenChange={(o) => !o && onMobileClose?.()}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85vh] flex-col rounded-t-2xl p-0 sm:hidden"
        >
          <SheetTitle className="sr-only">Filtros</SheetTitle>
          {/* Drag handle */}
          <div className="flex shrink-0 justify-center pt-3 pb-1">
            <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
          </div>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
