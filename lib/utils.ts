import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a more readable format
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions for customizing the format
 * @returns Formatted date string
 */
export function formatDate(
  dateString?: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  if (!dateString) return "Not available"

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    return new Intl.DateTimeFormat("en-US", options).format(date)
  } catch (error) {
    return "Error formatting date"
  }
}


export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
