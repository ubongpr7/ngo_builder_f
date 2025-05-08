// components/ui/searchable-select.tsx
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  error,
  loading,
  className = ""
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
  error?: boolean
  loading?: boolean
  className?: string
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  const selectedLabel = options.find(o => o.value === value)?.label || ""

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setSearchTerm("")
          setHoveredIndex(null)
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger 
        className={`${className} ${error ? "border-red-500" : ""}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true)
            setSearchTerm("")
          }
        }}
      >
        <SelectValue placeholder={loading ? "Loading..." : placeholder}>
          {selectedLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 sticky top-0 bg-white z-10 border-b">
          <Input
            ref={inputRef}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={hoveredIndex === index ? "bg-gray-100" : ""}
              >
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="py-2 px-4 text-sm text-muted-foreground text-center">
              No results found
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )
}

export default SearchableSelect