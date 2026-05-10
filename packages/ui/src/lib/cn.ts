import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with conflict resolution.
 *
 * Usage: `cn('px-4 py-2', isActive && 'bg-precision-blue-600', extraClass)`
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
