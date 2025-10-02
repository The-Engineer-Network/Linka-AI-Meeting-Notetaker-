import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for combining Tailwind classes (README: Utility functions)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // README: Utility functions (cn, etc.)
}