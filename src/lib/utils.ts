import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names and conditionals reliably.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
