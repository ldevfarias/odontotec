import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseISO(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? parsed : new Date();
  } catch {
    return new Date();
  }
}
