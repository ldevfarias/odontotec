import {
  endOfMonth,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import Image from 'next/image';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import { CalendarEvent, CalendarView, Professional } from './types';

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

    return events.filter((e) => {
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <button
      onClick={onToggle}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-200',
        isActive
          ? 'bg-card border-border shadow-md hover:shadow-lg'
          : 'bg-card/80 hover:bg-card border-transparent opacity-70 shadow-sm hover:opacity-100 hover:shadow-md',
      )}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: isActive ? color : 'transparent',
        // Adding a subtle border color transition
        borderColor: isActive ? `${color}40` : undefined,
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {professional.avatarUrl ? (
          <Image
            src={professional.avatarUrl}
            alt={professional.name}
            width={36}
            height={36}
            className={cn(
              'h-9 w-9 rounded-full object-cover ring-2 transition-all',
              isActive ? 'ring-primary/20' : 'ring-transparent grayscale',
            )}
          />
        ) : (
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
              isActive ? 'text-white' : 'bg-muted text-muted-foreground',
            )}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            {professional.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
        {/* Online indicator */}
        {isActive && (
          <div className="border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-emerald-500" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-xs font-semibold transition-colors',
            isActive ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {formatName(professional.name)}
        </p>
        <p className="text-muted-foreground truncate text-[10px]">{professional.role}</p>
      </div>

      {/* View's count badge */}
      {currentCount > 0 && isActive && (
        <div
          className="flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {currentCount}
        </div>
      )}
    </button>
  );
}
