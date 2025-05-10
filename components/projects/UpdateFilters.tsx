"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

interface FilterState {
  projects: string[]
  categories: string[]
  statuses: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

interface UpdateFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

// Sample data - replace with actual API data
const SAMPLE_PROJECTS = [
  { id: "digital-skills", name: "Digital Skills Workshop" },
  { id: "community-health", name: "Community Health Outreach" },
  { id: "women-entrepreneurship", name: "Women Entrepreneurship Program" },
]

const CATEGORIES = [
  { id: "milestone", name: "Milestone" },
  { id: "progress", name: "Progress" },
  { id: "event", name: "Event" },
  { id: "logistics", name: "Logistics" },
]

const STATUSES = [
  { id: "completed", name: "Completed" },
  { id: "in-progress", name: "In Progress" },
  { id: "planned", name: "Planned" },
]

export default function UpdateFilters({ onFilterChange }: UpdateFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    projects: [],
    categories: [],
    statuses: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
  })

  const [dateOpen, setDateOpen] = useState(false)

  const handleProjectChange = (projectId: string, checked: boolean) => {
    setFilters((prev) => {
      const newProjects = checked ? [...prev.projects, projectId] : prev.projects.filter((id) => id !== projectId)

      const newFilters = { ...prev, projects: newProjects }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters((prev) => {
      const newCategories = checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter((id) => id !== categoryId)

      const newFilters = { ...prev, categories: newCategories }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handleStatusChange = (statusId: string, checked: boolean) => {
    setFilters((prev) => {
      const newStatuses = checked ? [...prev.statuses, statusId] : prev.statuses.filter((id) => id !== statusId)

      const newFilters = { ...prev, statuses: newStatuses }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setFilters((prev) => {
      const newFilters = { ...prev, dateRange: range }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const resetFilters = () => {
    const resetState = {
      projects: [],
      categories: [],
      statuses: [],
      dateRange: {
        from: undefined,
        to: undefined,
      },
    }
    setFilters(resetState)
    onFilterChange(resetState)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Projects</Label>
          {filters.projects.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                setFilters((prev) => {
                  const newFilters = { ...prev, projects: [] }
                  onFilterChange(newFilters)
                  return newFilters
                })
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {SAMPLE_PROJECTS.map((project) => (
            <div key={project.id} className="flex items-center space-x-2">
              <Checkbox
                id={`project-${project.id}`}
                checked={filters.projects.includes(project.id)}
                onCheckedChange={(checked) => handleProjectChange(project.id, checked as boolean)}
              />
              <Label htmlFor={`project-${project.id}`} className="text-sm font-normal cursor-pointer">
                {project.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Categories</Label>
          {filters.categories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                setFilters((prev) => {
                  const newFilters = { ...prev, categories: [] }
                  onFilterChange(newFilters)
                  return newFilters
                })
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Status</Label>
          {filters.statuses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                setFilters((prev) => {
                  const newFilters = { ...prev, statuses: [] }
                  onFilterChange(newFilters)
                  return newFilters
                })
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {STATUSES.map((status) => (
            <div key={status.id} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.id}`}
                checked={filters.statuses.includes(status.id)}
                onCheckedChange={(checked) => handleStatusChange(status.id, checked as boolean)}
              />
              <Label htmlFor={`status-${status.id}`} className="text-sm font-normal cursor-pointer">
                {status.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium block mb-2">Date Range</Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={filters.dateRange}
              onSelect={(range) => {
                handleDateChange(range || { from: undefined, to: undefined })
                if (range?.to) {
                  setDateOpen(false)
                }
              }}
              initialFocus
            />
            {filters.dateRange.from && (
              <div className="p-3 border-t border-gray-100 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    handleDateChange({ from: undefined, to: undefined })
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {(filters.projects.length > 0 ||
        filters.categories.length > 0 ||
        filters.statuses.length > 0 ||
        filters.dateRange.from) && (
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Reset All Filters
        </Button>
      )}
    </div>
  )
}
