"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, AlertTriangle, Target, Activity, Building2, BarChart3 } from "lucide-react"
import { BudgetOverviewDashboard } from "@/components/finances/budgets/dashboard/budget-overview-dashboard"
import { BudgetListTable } from "@/components/finances/budgets/dashboard/budget-list-table"
import { BudgetFiltersPanel } from "@/components/finances/budgets/dashboard/budget-filters-panel"
import { DepartmentBudgetBreakdown } from "@/components/finances/budgets/dashboard/department-budget-breakdown"
import { BudgetUtilizationMatrix } from "@/components/finances/budgets/dashboard/budget-utilization-matrix"
import { AddBudgetDialog } from "@/components/finances/budgets/dashboard/add-budget-dialog"
import { BudgetHealthIndicators } from "@/components/finances/budgets/dashboard/budget-health-indicators"
import { useGetBudgetsQuery, useGetBudgetStatisticsQuery } from "@/redux/features/finance/budgets"
import { useGetDepartmentsQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"

export default function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: currencies, isLoading: currenciesLoading } = useGetCurrenciesQuery("")
  const { data: departments } = useGetDepartmentsQuery("")

  const [filters, setFilters] = useState({
    budget_type: "",
    status: "",
    department: "",
    fiscal_year: "",
    ordering: "-created_at",
    currency: "", // Empty by default - not compulsory
  })

  // Build query parameters - only include non-empty values
  const queryParams = {
    search: searchTerm || undefined,
    budget_type: filters.budget_type || undefined,
    status: filters.status || undefined,
    department: filters.department || undefined,
    fiscal_year: filters.fiscal_year || undefined,
    ordering: filters.ordering,
    currency: filters.currency || undefined,
    page_size: 50,
  }

  // Remove undefined values
  const cleanQueryParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, value]) => value !== undefined && value !== ""),
  )

  const { data: budgets, isLoading: budgetsLoading, refetch } = useGetBudgetsQuery(cleanQueryParams)

  const { data: statistics, isLoading: statsLoading } = useGetBudgetStatisticsQuery(cleanQueryParams)

  const handleFilterChange = (newFilters: any) => {
    console.log("Filter change:", newFilters)
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleExport = () => {
    console.log("Exporting budget data...")
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

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Budget Management
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive budget planning, tracking, and analytics dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <BudgetFiltersPanel
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>

          <TabsTrigger value="budgets" className="gap-2">
            <Target className="h-4 w-4" />
            Budgets
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="utilization" className="gap-2">
            <Activity className="h-4 w-4" />
            Utilization
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BudgetOverviewDashboard statistics={statistics} isLoading={statsLoading} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetListTable
            budgets={budgets || []}
            isLoading={budgetsLoading}
            onFiltersChange={handleFilterChange}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentBudgetBreakdown queryParams={cleanQueryParams} isLoading={budgetsLoading} />
        </TabsContent>

        <TabsContent value="utilization" className="space-y-6">
          <BudgetUtilizationMatrix budgets={budgets || []} isLoading={budgetsLoading} />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <BudgetHealthIndicators
            statistics={statistics}
            budgets={budgets || []}
            isLoading={budgetsLoading || statsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Add Budget Dialog */}
      <AddBudgetDialog
        open={showAddDialog}
        onSuccess={() => {
          setShowAddDialog(false)
          refetch()
        }}
        onOpenChange={setShowAddDialog}
      />
    </div>
  )
}
