"use client"

import { useState, useCallback } from "react"

export function useDropdownManager() {
  const [openDropdown, setOpenDropdown] = useState<string | number | null>(null)

  const openDropdownById = useCallback((id: string | number) => {
    setOpenDropdown(id)
  }, [])

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null)
  }, [])

  const toggleDropdown = useCallback((id: string | number) => {
    setOpenDropdown((current) => (current === id ? null : id))
  }, [])

  const isDropdownOpen = useCallback(
    (id: string | number) => {
      return openDropdown === id
    },
    [openDropdown],
  )

  return {
    openDropdown,
    openDropdownById,
    closeDropdown,
    toggleDropdown,
    isDropdownOpen,
  }
}
