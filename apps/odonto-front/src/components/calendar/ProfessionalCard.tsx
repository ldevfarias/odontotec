import { Professional, CalendarEvent, CalendarView } from './types';
import { isSameDay, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ProfessionalCardProps {
    professional: Professional;
    isActive: boolean;
    onToggle: () => void;
    events: CalendarEvent[];
    accentColor?: string;
    currentDate?: Date;
    view?: CalendarView;
}

const ACCENT_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export function ProfessionalCard({
    professional,
    isActive,
    onToggle,
    events,
    accentColor,
    currentDate,
    view,
}: ProfessionalCardProps) {
    const currentCount = useMemo(() => {
        const date = currentDate || new Date();
        const currentView = view || 'day';

        return events.filter(e => {
            if (e.professionalId !== professional.id) return false;

            if (currentView === 'day' || currentView === 'agenda') {
                return isSameDay(e.startTime, date);
            } else if (currentView === 'week') {
                const start = startOfWeek(date, { weekStartsOn: 1 });
                const end = endOfWeek(date, { weekStartsOn: 1 });
                return isWithinInterval(e.startTime, { start, end });
            } else if (currentView === 'month') {
                const start = startOfMonth(date);
                const end = endOfMonth(date);
                return isWithinInterval(e.startTime, { start, end });
            }
            return false;
        }).length;
    }, [events, professional.id, currentDate, view]);

    const color = accentColor || ACCENT_COLORS[0];

    // Helper to capitalize first letters
    const formatName = (name: string) => {
        return name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <button
            onClick={onToggle}
            className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 text-left group cursor-pointer',
                isActive
                    ? 'bg-card border-border shadow-md hover:shadow-lg'
                    : 'bg-card/80 border-transparent shadow-sm opacity-70 hover:opacity-100 hover:bg-card hover:shadow-md'
            )}
            style={{
                borderLeftWidth: '3px',
                borderLeftColor: isActive ? color : 'transparent',
                // Adding a subtle border color transition
                borderColor: isActive ? `${color}40` : undefined
            }}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {professional.avatarUrl ? (
                    <img
                        src={professional.avatarUrl}
                        alt={professional.name}
                        className={cn(
                            'w-9 h-9 rounded-full object-cover ring-2 transition-all',
                            isActive ? 'ring-primary/20' : 'ring-transparent grayscale'
                        )}
                    />
                ) : (
                    <div
                        className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                            isActive ? 'text-white' : 'bg-muted text-muted-foreground'
                        )}
                        style={isActive ? { backgroundColor: color } : undefined}
                    >
                        {professional.name
                            .split(' ')
                            .filter(Boolean)
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                    </div>
                )}
                {/* Online indicator */}
                {isActive && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    'text-xs font-semibold truncate transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                    {formatName(professional.name)}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{professional.role}</p>
            </div>

            {/* View's count badge */}
            {currentCount > 0 && isActive && (
                <div
                    className="shrink-0 min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                >
                    {currentCount}
                </div>
            )}
        </button>
    );
}
