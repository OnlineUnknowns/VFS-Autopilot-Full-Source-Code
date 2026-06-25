import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and resolves conflicting Tailwind CSS classes.
 * @param inputs - Array of class values to be combined.
 * @returns Combined and resolved className string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
