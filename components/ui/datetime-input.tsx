"use client"

import type React from "react"
import { forwardRef } from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateTimeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  error?: string
  label?: string
  helperText?: string
  minDateTime?: Date
  maxDateTime?: Date
}

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ value, onChange, error, label, helperText, className, minDateTime, maxDateTime, ...props }, ref) => {
    // Convert Date to string format for datetime-local input (YYYY-MM-DDThh:mm)
    const dateTimeString = value ? format(value, "yyyy-MM-dd'T'HH:mm") : ""

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (!val) {
        onChange(undefined)
        return
      }

      try {
        // Parse the datetime string to a Date object
        const date = parse(val, "yyyy-MM-dd'T'HH:mm", new Date())
        onChange(date)
      } catch (error) {
        console.error("Invalid datetime format", error)
      }
    }

    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </div>
          <input
            ref={ref}
            type="datetime-local"
            className={cn(
              "block w-full pl-10 py-2 px-3 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              error ? "border-red-500" : "border-gray-300",
              className,
            )}
            value={dateTimeString}
            onChange={handleChange}
            min={minDateTime ? format(minDateTime, "yyyy-MM-dd'T'HH:mm") : undefined}
            max={maxDateTime ? format(maxDateTime, "yyyy-MM-dd'T'HH:mm") : undefined}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={cn("text-xs", error ? "text-red-500" : "text-gray-500")}>{error || helperText}</p>
        )}
      </div>
    )
  },
)

DateTimeInput.displayName = "DateTimeInput"
