"use client"

import { useState } from "react"
import Select from "react-select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Filter } from "lucide-react"

interface DashboardFiltersProps {
  filters: {
    dateRange: string
    currency: string
    project: string
    department: string
  }
  onFiltersChange: (filters: any) => void
  autoRefresh: boolean
  onAutoRefreshChange: (enabled: boolean) => void
  refreshInterval: number
  onRefreshIntervalChange: (interval: number) => void
}

const dateRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
  { value: "custom", label: "Custom range" },
]

const currencyOptions = [
  { value: "all", label: "All Currencies" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
]

const projectOptions = [
  { value: "all", label: "All Projects" },
  { value: "1", label: "Education Initiative" },
  { value: "2", label: "Healthcare Program" },
  { value: "3", label: "Clean Water Project" },
]

const departmentOptions = [
  { value: "all", label: "All Departments" },
  { value: "1", label: "Programs" },
  { value: "2", label: "Operations" },
  { value: "3", label: "Fundraising" },
]

const refreshIntervalOptions = [
  { value: 15000, label: "15 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
]

export function DashboardFilters({
  filters,
  onFiltersChange,
  autoRefresh,
  onAutoRefreshChange,
  refreshInterval,
  onRefreshIntervalChange,
}: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({ ...filters, dateRange: value })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.currency !== "all") count++
    if (filters.project !== "all") count++
    if (filters.department !== "all") count++
    if (filters.dateRange !== "30d") count++
    return count
  }

  const clearFilters = () => {
    onFiltersChange({
      dateRange: "30d",
      currency: "all",
      project: "all",
      department: "all",
    })
    setCustomDateRange({ from: undefined, to: undefined })
  }

  return (
    <>
      <style jsx global>{`
        /* React Select Custom Styles */
        .react-select-container {
          font-size: 14px;
        }

        .react-select__control {
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          background-color: hsl(var(--background));
          min-height: 36px;
          box-shadow: none;
          transition: border-color 0.2s ease;
        }

        .react-select__control:hover {
          border-color: hsl(var(--border));
        }

        .react-select__control--is-focused {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }

        .react-select__value-container {
          padding: 2px 8px;
        }

        .react-select__single-value {
          color: hsl(var(--foreground));
        }

        .react-select__placeholder {
          color: hsl(var(--muted-foreground));
        }

        .react-select__input-container {
          color: hsl(var(--foreground));
        }

        .react-select__menu {
          background-color: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          z-index: 9999;
        }

        .react-select__menu-list {
          padding: 4px;
        }

        .react-select__option {
          background-color: transparent;
          color: hsl(var(--popover-foreground));
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .react-select__option:hover {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-select__option--is-focused {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-select__option--is-selected {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .react-select__indicator-separator {
          background-color: hsl(var(--border));
        }

        .react-select__dropdown-indicator {
          color: hsl(var(--muted-foreground));
          padding: 8px;
        }

        .react-select__dropdown-indicator:hover {
          color: hsl(var(--foreground));
        }

        .react-select__clear-indicator {
          color: hsl(var(--muted-foreground));
          padding: 8px;
        }

        .react-select__clear-indicator:hover {
          color: hsl(var(--destructive));
        }

        .react-select__multi-value {
          background-color: hsl(var(--secondary));
          border-radius: 4px;
          margin: 2px;
        }

        .react-select__multi-value__label {
          color: hsl(var(--secondary-foreground));
          padding: 2px 6px;
        }

        .react-select__multi-value__remove {
          color: hsl(var(--secondary-foreground));
          border-radius: 0 4px 4px 0;
          padding: 2px 6px;
        }

        .react-select__multi-value__remove:hover {
          background-color: hsl(var(--destructive));
          color: hsl(var(--destructive-foreground));
        }
      `}</style>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto" align="end">
          <div className="space-y-4 p-1">
            <div className="sticky top-0 bg-popover z-10 pb-2 border-b border-border mb-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Dashboard Filters</h4>
                {getActiveFiltersCount() > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <Select
                value={dateRangeOptions.find((option) => option.value === filters.dateRange)}
                onChange={(selectedOption) => handleDateRangeChange(selectedOption?.value || "30d")}
                options={dateRangeOptions}
                placeholder="Select date range"
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={false}
              />

              {filters.dateRange === "custom" && (
                <div className="mt-2 max-h-80 overflow-y-auto">
                  <Calendar
                    mode="range"
                    selected={customDateRange}
                    onSelect={setCustomDateRange}
                    numberOfMonths={1}
                    className="rounded-md border"
                    disabled={(date) => date > new Date()}
                    toDate={new Date()}
                  />
                </div>
              )}
            </div>

            {/* Currency Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select
                value={currencyOptions.find((option) => option.value === filters.currency)}
                onChange={(selectedOption) => onFiltersChange({ ...filters, currency: selectedOption?.value || "all" })}
                options={currencyOptions}
                placeholder="Select currency"
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={true}
              />
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Project</Label>
              <Select
                value={projectOptions.find((option) => option.value === filters.project)}
                onChange={(selectedOption) => onFiltersChange({ ...filters, project: selectedOption?.value || "all" })}
                options={projectOptions}
                placeholder="Select project"
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={true}
              />
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Department</Label>
              <Select
                value={departmentOptions.find((option) => option.value === filters.department)}
                onChange={(selectedOption) =>
                  onFiltersChange({ ...filters, department: selectedOption?.value || "all" })
                }
                options={departmentOptions}
                placeholder="Select department"
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={true}
              />
            </div>

            <Separator />

            {/* Auto Refresh Settings */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Auto Refresh</Label>
                <Switch checked={autoRefresh} onCheckedChange={onAutoRefreshChange} />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label className="text-sm">Refresh Interval</Label>
                  <Select
                    value={refreshIntervalOptions.find((option) => option.value === refreshInterval)}
                    onChange={(selectedOption) => onRefreshIntervalChange(selectedOption?.value || 30000)}
                    options={refreshIntervalOptions}
                    placeholder="Select interval"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isSearchable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
