import { Calendar } from '@/components/ui/calendar';
import { CalendarState, CalendarEvent, EventCategory, Professional } from './types';
import { ProfessionalCard } from './ProfessionalCard';
import { CategoryChip } from './CategoryChip';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Users, Tag } from 'lucide-react';

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
            <div className="p-3 shrink-0">
                <div className="rounded-xl bg-white border border-border/60 p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]">
                    <Calendar
                        mode="single"
                        selected={state.currentDate}
                        onSelect={(date) => date && onStateChange({ currentDate: date })}
                        className="rounded-lg border-transparent w-full flex justify-center bg-transparent shadow-none [--cell-size:--spacing(8)]"
                    />
                </div>
            </div>

            {/* Scrollable filters area */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                {/* Professionals */}
                <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 mb-2.5 px-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
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

                {/* Categories */}
                <div className="px-3 pb-4">
                    <div className="flex items-center gap-2 mb-2.5 px-1">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Categorias
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((category) => (
                            <CategoryChip
                                key={category.id}
                                category={category}
                                isActive={state.selectedCategories.includes(category.id)}
                                onToggle={() => toggleCategory(category.id)}
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
            <div className="hidden sm:flex w-[272px] shrink-0 flex-col border-r border-border bg-card/50">
                {sidebarContent}
            </div>

            {/* Mobile sidebar as bottom Sheet */}
            <Sheet open={mobileOpen} onOpenChange={(o) => !o && onMobileClose?.()}>
                <SheetContent
                    side="bottom"
                    className="sm:hidden max-h-[85vh] rounded-t-2xl p-0 flex flex-col"
                >
                    <SheetTitle className="sr-only">Filtros</SheetTitle>
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                    </div>
                    {sidebarContent}
                </SheetContent>
            </Sheet>
        </>
    );
}
