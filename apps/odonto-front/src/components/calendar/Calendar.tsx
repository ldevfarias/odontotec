import { useState } from 'react';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarState, CalendarEvent, EventCategory, Professional } from './types';
import { WeekView } from './views/WeekView';
import { DayView } from './views/DayView';
import { MonthView } from './views/MonthView';

interface CalendarProps {
    events: CalendarEvent[];
    categories: EventCategory[];
    professionals: Professional[];
    onNewAppointment?: () => void;
    onEditAppointment?: (originalAppointment: any) => void;
    onUpdateAppointmentStatus?: (id: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT') => void;
}

export function Calendar({ events, categories, professionals, onNewAppointment, onEditAppointment, onUpdateAppointmentStatus }: CalendarProps) {
    const [state, setState] = useState<CalendarState>({
        currentDate: new Date(),
        view: 'week',
        selectedCategories: categories.map(c => c.id),
        selectedProfessionals: professionals.map(p => p.id),
    });

    const handleStateChange = (updates: Partial<CalendarState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const filteredEvents = events.filter(
        (event) =>
            state.selectedCategories.includes(event.categoryId) &&
            state.selectedProfessionals.includes(event.professionalId)
    );

    return (
        <div className="flex h-full w-full bg-background rounded-xl border border-border overflow-hidden shadow-sm">
            <CalendarSidebar
                state={state}
                onStateChange={handleStateChange}
                categories={categories}
                professionals={professionals}
                events={events}
            />
            <div className="flex-1 flex flex-col min-w-0 bg-card">
                <CalendarHeader
                    state={state}
                    onStateChange={handleStateChange}
                    onNewAppointment={onNewAppointment}
                />
                <div className="flex-1 overflow-hidden relative">
                    {state.view === 'week' && (
                        <WeekView
                            currentDate={state.currentDate}
                            events={filteredEvents}
                            categories={categories}
                            professionals={professionals}
                            onEditAppointment={onEditAppointment}
                            onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                        />
                    )}
                    {state.view === 'day' && (
                        <DayView
                            currentDate={state.currentDate}
                            events={filteredEvents}
                            categories={categories}
                            professionals={professionals.filter(p => state.selectedProfessionals.includes(p.id))}
                            onEditAppointment={onEditAppointment}
                            onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                        />
                    )}
                    {state.view === 'month' && (
                        <MonthView
                            currentDate={state.currentDate}
                            events={filteredEvents}
                            categories={categories}
                            professionals={professionals}
                            onEditAppointment={onEditAppointment}
                            onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
