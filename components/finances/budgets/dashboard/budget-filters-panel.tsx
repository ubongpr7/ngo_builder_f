"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Filter, Calendar, Target, RefreshCw, Activity } from "lucide-react"

interface BudgetFiltersPanelProps {
  filters: any
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

export function BudgetFiltersPanel({ filters, onFiltersChange, onClose }: BudgetFiltersPanelProps) {
  const budgetTypes = [
    "project",
    "organizational",
    "departmental",
    "program",
    "emergency",
    "capacity_building",
    "advocacy",
    "research",
    "partnership",
    "event",
    "maintenance",
    "contingency",
  ]

  const statuses = ["draft", "pending_approval", "approved", "active", "completed", "cancelled"]

  const currentYear = new Date().getFullYear()
  const fiscalYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      budget_type: "",
      status: "",
      department: "",
      fiscal_year: "",
      ordering: "-created_at",
    })
  }

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== "" && value !== "-created_at",
  ).length

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Advanced Filters
            {activeFiltersCount > 0 && <Badge className="bg-blue-600 text-white">{activeFiltersCount} active</Badge>}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Budget Type Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Budget Type
            </Label>
            <Select value={filters.budget_type} onValueChange={(value) => handleFilterChange("budget_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {budgetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Status
            </Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fiscal Year Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Fiscal Year
            </Label>
            <Select value={filters.fiscal_year} onValueChange={(value) => handleFilterChange("fiscal_year", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    FY {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-orange-600" />
              Sort By
            </Label>
            <Select value={filters.ordering} onValueChange={(value) => handleFilterChange("ordering", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
                <SelectItem value="-total_amount">Highest Amount</SelectItem>
                <SelectItem value="total_amount">Lowest Amount</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="-title">Title Z-A</SelectItem>
                <SelectItem value="-start_date">Latest Start Date</SelectItem>
                <SelectItem value="start_date">Earliest Start Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("status", "active")}
              className={filters.status === "active" ? "bg-green-100 border-green-300" : ""}
            >
              Active Budgets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("status", "pending_approval")}
              className={filters.status === "pending_approval" ? "bg-yellow-100 border-yellow-300" : ""}
            >
              Pending Approval
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("budget_type", "project")}
              className={filters.budget_type === "project" ? "bg-blue-100 border-blue-300" : ""}
            >
              Project Budgets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("fiscal_year", currentYear.toString())}
              className={filters.fiscal_year === currentYear.toString() ? "bg-purple-100 border-purple-300" : ""}
            >
              Current Year
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Clear All Filters
          </Button>

          <div className="text-sm text-muted-foreground">
            {activeFiltersCount > 0 && `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
