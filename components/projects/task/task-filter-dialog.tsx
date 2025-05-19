"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimeInput } from "@/components/ui/datetime-input"
import Select from "react-select"
import { selectStyles } from "@/utils/select-styles"

interface TaskFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialFilters: any
  onApply: (filters: any) => void
  onClear: () => void
}

// Define option types for react-select
interface SelectOption {
  value: string
  label: string
}

export function TaskFilterDialog({ open, onOpenChange, initialFilters, onApply, onClear }: TaskFilterDialogProps) {
  const [filters, setFilters] = useState({
    status: initialFilters.status || null,
    priority: initialFilters.priority || null,
    taskType: initialFilters.taskType || null,
    dueDateStart: initialFilters.dueDateStart ? new Date(initialFilters.dueDateStart) : null,
    dueDateEnd: initialFilters.dueDateEnd ? new Date(initialFilters.dueDateEnd) : null,
    isOverdue: initialFilters.isOverdue || false,
    isCompleted: initialFilters.isCompleted || false,
  })

  useEffect(() => {
    if (open) {
      setFilters({
        status: initialFilters.status || null,
        priority: initialFilters.priority || null,
        taskType: initialFilters.taskType || null,
        dueDateStart: initialFilters.dueDateStart ? new Date(initialFilters.dueDateStart) : null,
        dueDateEnd: initialFilters.dueDateEnd ? new Date(initialFilters.dueDateEnd) : null,
        isOverdue: initialFilters.isOverdue || false,
        isCompleted: initialFilters.isCompleted || false,
      })
    }
  }, [open, initialFilters])

  // Status options for react-select
  const statusOptions: SelectOption[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Under Review" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
    { value: "cancelled", label: "Cancelled" },
  ]

  // Priority options for react-select
  const priorityOptions: SelectOption[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  // Task type options for react-select
  const taskTypeOptions: SelectOption[] = [
    { value: "feature", label: "Feature" },
    { value: "bug", label: "Bug" },
    { value: "improvement", label: "Improvement" },
    { value: "documentation", label: "Documentation" },
    { value: "research", label: "Research" },
    { value: "other", label: "Other" },
  ]

  const handleApply = () => {
    const appliedFilters = {}

    if (filters.status) {
      appliedFilters.status = filters.status
    }

    if (filters.priority) {
      appliedFilters.priority = filters.priority
    }

    if (filters.taskType) {
      appliedFilters.taskType = filters.taskType
    }

    if (filters.dueDateStart) {
      appliedFilters.dueDateStart = filters.dueDateStart.toISOString()
    }

    if (filters.dueDateEnd) {
      appliedFilters.dueDateEnd = filters.dueDateEnd.toISOString()
    }

    if (filters.isOverdue) {
      appliedFilters.isOverdue = filters.isOverdue
    }

    if (filters.isCompleted) {
      appliedFilters.isCompleted = filters.isCompleted
    }

    onApply(appliedFilters)
  }

  const handleClear = () => {
    setFilters({
      status: null,
      priority: null,
      taskType: null,
      dueDateStart: null,
      dueDateEnd: null,
      isOverdue: false,
      isCompleted: false,
    })
    onClear()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
          <DialogDescription>Set filters to narrow down the tasks displayed.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              options={statusOptions}
              value={filters.status ? statusOptions.find((option) => option.value === filters.status) : null}
              onChange={(option) => setFilters({ ...filters, status: option?.value || null })}
              styles={selectStyles}
              placeholder="Select status"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              options={priorityOptions}
              value={filters.priority ? priorityOptions.find((option) => option.value === filters.priority) : null}
              onChange={(option) => setFilters({ ...filters, priority: option?.value || null })}
              styles={selectStyles}
              placeholder="Select priority"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select
              options={taskTypeOptions}
              value={filters.taskType ? taskTypeOptions.find((option) => option.value === filters.taskType) : null}
              onChange={(option) => setFilters({ ...filters, taskType: option?.value || null })}
              styles={selectStyles}
              placeholder="Select type"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDateStart" className="text-xs">
                  Start Date
                </Label>
                <DateTimeInput
                  id="dueDateStart"
                  value={filters.dueDateStart}
                  onChange={(date) => setFilters({ ...filters, dueDateStart: date })}
                  placeholder="From"
                />
              </div>
              <div>
                <Label htmlFor="dueDateEnd" className="text-xs">
                  End Date
                </Label>
                <DateTimeInput
                  id="dueDateEnd"
                  value={filters.dueDateEnd}
                  onChange={(date) => setFilters({ ...filters, dueDateEnd: date })}
                  placeholder="To"
                  minDateTime={filters.dueDateStart || undefined}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOverdue"
              checked={filters.isOverdue}
              onCheckedChange={(checked) => setFilters({ ...filters, isOverdue: checked === true })}
            />
            <Label htmlFor="isOverdue">Show overdue tasks only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCompleted"
              checked={filters.isCompleted}
              onCheckedChange={(checked) => setFilters({ ...filters, isCompleted: checked === true })}
            />
            <Label htmlFor="isCompleted">Show completed tasks only</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
