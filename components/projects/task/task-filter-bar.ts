"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { TaskFilterDialog } from "./task-filter-dialog"

interface TaskFilterBarProps {
  onFilterChange: (filters: any) => void
  currentFilters: any
}

export function TaskFilterBar({ onFilterChange, currentFilters }: TaskFilterBarProps) {
  const [showFilterDialog, setShowFilterDialog] = useState(false)

  const handleApplyFilters = (filters: any) => {
    // Preserve projectId and milestoneId
    const appliedFilters = {
      projectId: currentFilters.projectId,
      milestoneId: currentFilters.milestoneId,
      ...filters,
    }
    onFilterChange(appliedFilters)
    setShowFilterDialog(false)
  }

  const handleClearFilters = () => {
    const baseFilters = {
      projectId: currentFilters.projectId,
      milestoneId: currentFilters.milestoneId,
    }
    onFilterChange(baseFilters)
  }

  // Count active filters (excluding projectId and milestoneId)
  const activeFilterCount = Object.keys(currentFilters).filter(
    (key) =>
      key !== "projectId" && key !== "milestoneId" && currentFilters[key] !== undefined && currentFilters[key] !== null,
  ).length

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilterDialog(true)}
        className={activeFilterCount > 0 ? "bg-blue-50" : ""}
      >
        <Filter className="h-4 w-4 mr-1" />
        Filter
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5 text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <TaskFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        initialFilters={currentFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </>
  )
}
