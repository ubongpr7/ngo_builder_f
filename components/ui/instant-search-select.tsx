// components/ui/searchable-select.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  disabled,
  className,
  error,
  loading,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  loading?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedLabel = options.find(o => o.value === value)?.label || ""

  // Keep dropdown open when input is focused (mobile fix)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const handleFocus = () => setIsOpen(true)
      inputRef.current.addEventListener('focus', handleFocus)
      return () => inputRef.current?.removeEventListener('focus', handleFocus)
    }
  }, [isOpen])

  return (
    <Select
      open={isOpen}
      onOpenChange={setIsOpen}
      value={value}
      onValueChange={(val) => {
        onValueChange(val)
        setIsOpen(false)
        setSearchTerm("")
      }}
    >
      <SelectTrigger 
        className={`${className} ${error ? "border-red-500" : ""}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <SelectValue placeholder={loading ? "Loading..." : placeholder}>
          {selectedLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="p-0">
        <div className="sticky top-0 z-10 bg-white p-2">
          <Input
            ref={inputRef}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            onKeyDown={(e) => e.stopPropagation()} // Prevent select from handling keys
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              onPointerDown={(e) => e.preventDefault()} // Mobile touch fix
            >
              {option.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  )
}