"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import { useGetDepartmentsQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import Select from "react-select"

interface BudgetFiltersPanelProps {
  filters: {
    budget_type: string
    status: string
    department: string
    fiscal_year: string
    ordering: string
    currency: string
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

const BUDGET_TYPES = [
  { value: "project", label: "Project" },
  { value: "organizational", label: "Organizational" },
  { value: "departmental", label: "Departmental" },
  { value: "program", label: "Program" },
  { value: "emergency", label: "Emergency Response" },
  { value: "capacity_building", label: "Capacity Building" },
  { value: "advocacy", label: "Advocacy & Policy" },
  { value: "research", label: "Research & Development" },
  { value: "partnership", label: "Partnership" },
  { value: "event", label: "Event" },
  { value: "maintenance", label: "Maintenance & Operations" },
  { value: "contingency", label: "Contingency" },
]

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "#6b7280" },
  { value: "pending_approval", label: "Pending Approval", color: "#f59e0b" },
  { value: "approved", label: "Approved", color: "#10b981" },
  { value: "active", label: "Active", color: "#3b82f6" },
  { value: "completed", label: "Completed", color: "#8b5cf6" },
  { value: "cancelled", label: "Cancelled", color: "#ef4444" },
]

const ORDERING_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
  { value: "-total_amount", label: "Highest Amount" },
  { value: "total_amount", label: "Lowest Amount" },
  { value: "title", label: "Title A-Z" },
  { value: "-title", label: "Title Z-A" },
  { value: "-start_date", label: "Latest Start Date" },
  { value: "start_date", label: "Earliest Start Date" },
  { value: "-end_date", label: "Latest End Date" },
  { value: "end_date", label: "Earliest End Date" },
]

const generateFiscalYears = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push({ value: i.toString(), label: `FY ${i}` })
  }
  return years
}

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    minHeight: "40px",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
    color: state.isSelected ? "white" : "#374151",
  }),
}

export function BudgetFiltersPanel({ filters, onFiltersChange, onClose }: BudgetFiltersPanelProps) {
  const { data: departments, isLoading: departmentsLoading } = useGetDepartmentsQuery("")
  const { data: currencies, isLoading: currenciesLoading } = useGetCurrenciesQuery("")

  const fiscalYears = generateFiscalYears()

  const departmentOptions =
    departments?.map((dept: any) => ({
      value: dept.id.toString(),
      label: dept.name,
    })) || []

  const currencyOptions =
    currencies?.map((currency: any) => ({
      value: currency.id.toString(),
      label: `${currency.code} - ${currency.name}`,
      code: currency.code,
    })) || []

  // Apply filter changes immediately
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    console.log("Immediate filter change:", { key, value, newFilters })
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      budget_type: "",
      status: "",
      department: "",
      fiscal_year: "",
      ordering: "-created_at",
      currency: "",
    }
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.budget_type) count++
    if (filters.status) count++
    if (filters.department) count++
    if (filters.fiscal_year) count++
    if (filters.currency) count++
    return count
  }

  const removeFilter = (key: string) => {
    handleFilterChange(key, "")
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Filter Budgets</CardTitle>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.budget_type && (
                <Badge variant="outline" className="gap-1">
                  Type: {BUDGET_TYPES.find((t) => t.value === filters.budget_type)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter("budget_type")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className="gap-1">
                  Status: {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
                  <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => removeFilter("status")}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.department && (
                <Badge variant="outline" className="gap-1">
                  Dept: {departmentOptions.find((d: any) => d.value === filters.department)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter("department")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.fiscal_year && (
                <Badge variant="outline" className="gap-1">
                  FY: {filters.fiscal_year}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter("fiscal_year")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.currency && (
                <Badge variant="outline" className="gap-1">
                  Currency: {currencyOptions.find((c: any) => c.value === filters.currency)?.code}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter("currency")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Currency Filter - Optional */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Currency</Label>
            <Select
              value={currencyOptions.find((option) => option.value === filters.currency)}
              onChange={(selectedOption: any) => handleFilterChange("currency", selectedOption?.value || "")}
              options={currencyOptions}
              isLoading={currenciesLoading}
              isClearable
              isSearchable
              placeholder="All currencies"
              styles={customSelectStyles}
            />
          </div>

          {/* Budget Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Budget Type</Label>
            <Select
              value={BUDGET_TYPES.find((option) => option.value === filters.budget_type)}
              onChange={(selectedOption: any) => handleFilterChange("budget_type", selectedOption?.value || "")}
              options={BUDGET_TYPES}
              isClearable
              isSearchable
              placeholder="All types"
              styles={customSelectStyles}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={STATUS_OPTIONS.find((option) => option.value === filters.status)}
              onChange={(selectedOption: any) => handleFilterChange("status", selectedOption?.value || "")}
              options={STATUS_OPTIONS}
              isClearable
              isSearchable
              placeholder="All statuses"
              styles={customSelectStyles}
              formatOptionLabel={(option: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                  <span>{option.label}</span>
                </div>
              )}
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Department</Label>
            <Select
              value={departmentOptions.find((option: any) => option.value === filters.department)}
              onChange={(selectedOption: any) => handleFilterChange("department", selectedOption?.value || "")}
              options={departmentOptions}
              isLoading={departmentsLoading}
              isClearable
              isSearchable
              placeholder="All departments"
              styles={customSelectStyles}
            />
          </div>

          {/* Fiscal Year */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fiscal Year</Label>
            <Select
              value={fiscalYears.find((option) => option.value === filters.fiscal_year)}
              onChange={(selectedOption: any) => handleFilterChange("fiscal_year", selectedOption?.value || "")}
              options={fiscalYears}
              isClearable
              isSearchable
              placeholder="All years"
              styles={customSelectStyles}
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sort By</Label>
            <Select
              value={ORDERING_OPTIONS.find((option) => option.value === filters.ordering)}
              onChange={(selectedOption: any) => handleFilterChange("ordering", selectedOption?.value || "-created_at")}
              options={ORDERING_OPTIONS}
              isSearchable
              placeholder="Select sorting"
              styles={customSelectStyles}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
