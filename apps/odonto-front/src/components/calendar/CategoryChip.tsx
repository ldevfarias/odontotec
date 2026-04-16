import { cn } from '@/lib/utils';

import { EventCategory } from './types';

interface CategoryChipProps {
  category: EventCategory;
  isActive: boolean;
  onToggle: () => void;
}

export function CategoryChip({ category, isActive, onToggle }: CategoryChipProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
        isActive
          ? 'scale-100 shadow-sm'
          : 'bg-muted/40 scale-[0.97] border-transparent opacity-60 hover:opacity-80',
      )}
      style={
        isActive
          ? {
              backgroundColor: `${category.color}12`,
              borderColor: `${category.color}30`,
              color: category.color,
            }
          : undefined
      }
    >
      {/* Color dot */}
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full transition-all',
          isActive ? 'scale-100' : 'scale-75 opacity-50',
        )}
        style={{ backgroundColor: category.color }}
      />

      {/* Label */}
      <span className={cn(!isActive && 'text-muted-foreground')}>{category.name}</span>

      {/* Count */}
      {category.count !== undefined && category.count > 0 && (
        <span
          className={cn(
            'flex h-[18px] min-w-[18px] items-center justify-center rounded-full text-[10px] font-bold transition-all',
            isActive ? 'text-white' : 'bg-muted text-muted-foreground',
          )}
          style={isActive ? { backgroundColor: category.color } : undefined}
        >
          {category.count}
        </span>
      )}
    </button>
  );
}
