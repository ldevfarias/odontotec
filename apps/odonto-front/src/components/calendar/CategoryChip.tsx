import { EventCategory } from './types';
import { cn } from '@/lib/utils';

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
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer',
                isActive
                    ? 'shadow-sm scale-100'
                    : 'scale-[0.97] opacity-60 hover:opacity-80 border-transparent bg-muted/40'
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
                    'w-2 h-2 rounded-full shrink-0 transition-all',
                    isActive ? 'scale-100' : 'scale-75 opacity-50'
                )}
                style={{ backgroundColor: category.color }}
            />

            {/* Label */}
            <span className={cn(!isActive && 'text-muted-foreground')}>
                {category.name}
            </span>

            {/* Count */}
            {category.count !== undefined && category.count > 0 && (
                <span
                    className={cn(
                        'min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                        isActive ? 'text-white' : 'bg-muted text-muted-foreground'
                    )}
                    style={isActive ? { backgroundColor: category.color } : undefined}
                >
                    {category.count}
                </span>
            )}
        </button>
    );
}
