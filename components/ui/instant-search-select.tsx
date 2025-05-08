// components/ui/instant-search-select.tsx
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InstantSearchSelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
  className?: string
  maxHeight?: number
}

export function InstantSearchSelect({
  value,
  onChange,
  options,
  placeholder = "Search...",
  disabled,
  className,
  maxHeight = 200,
}: InstantSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  const dynamicHeight = useMemo(() => {
    const itemHeight = 36 
    const visibleItems = Math.min(filteredOptions.length, 6)
    return Math.min(visibleItems * itemHeight, maxHeight)
  }, [filteredOptions.length, maxHeight])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearchTerm(options.find(o => o.value === val)?.label || "")
  }

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <Input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />

      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          style={{ height: `${dynamicHeight}px` }}
        >
          <ScrollArea className="h-full">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`h-9 px-4 flex items-center cursor-pointer transition-colors hover:bg-blue-600 hover:text-white box-border ${value === option.value ? "bg-gray-100 font-medium" : ""
                  }`}

                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}