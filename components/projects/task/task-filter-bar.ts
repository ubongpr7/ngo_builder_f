"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DateTimeInput } from "@/components/ui/datetime-input"
import { Filter } from "lucide-react"
import Select from "react-select"
import { selectStyles } from "@/utils/select-styles"

interface TaskFilterBarProps {
  onFilterChange: (filters: any) => void
  currentFilters: any
}

// Define option types for react-select
interface SelectOption {
  value: string
  label: string
}

export function TaskFilterBar({ onFilterChange, currentFilters }: TaskFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<any>(currentFilters)

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

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => {
      const newFilters = { ...prev, [key]: value }
      return newFilters
    })
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
    setIsOpen(false)
  }

  const resetFilters = () => {
    const baseFilters = {
      projectId: currentFilters.projectId,
      milestoneId: currentFilters.milestoneId,
    }
    setLocalFilters(baseFilters)
    onFilterChange(baseFilters)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" /> Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h3 className="font-medium">Filter Tasks</h3>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              options={statusOptions}
              value={localFilters.status ? statusOptions.find((option) => option.value === localFilters.status) : null}
              onChange={(option) => handleFilterChange("status", option?.value)}
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
              value={
                localFilters.priority ? priorityOptions.find((option) => option.value === localFilters.priority) : null
              }
              onChange={(option) => handleFilterChange("priority", option?.value)}
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
              value={
                localFilters.taskType ? taskTypeOptions.find((option) => option.value === localFilters.taskType) : null
              }
              onChange={(option) => handleFilterChange("taskType", option?.value)}
              styles={selectStyles}
              placeholder="Select type"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">From</Label>
                <DateTimeInput
                  value={localFilters.dueDateStart ? new Date(localFilters.dueDateStart) : undefined}
                  onChange={(date) => handleFilterChange("dueDateStart", date ? date.toISOString() : undefined)}
                  id="due-date-start"
                />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <DateTimeInput
                  value={localFilters.dueDateEnd ? new Date(localFilters.dueDateEnd) : undefined}
                  onChange={(date) => handleFilterChange("dueDateEnd", date ? date.toISOString() : undefined)}
                  id="due-date-end"
                  minDateTime={localFilters.dueDateStart ? new Date(localFilters.dueDateStart) : undefined}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="overdue"
              checked={localFilters.isOverdue}
              onCheckedChange={(checked) => handleFilterChange("isOverdue", checked === true ? true : undefined)}
            />
            <Label htmlFor="overdue">Show overdue tasks only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={localFilters.isCompleted}
              onCheckedChange={(checked) => handleFilterChange("isCompleted", checked === true ? true : undefined)}
            />
            <Label htmlFor="completed">Show completed tasks only</Label>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
