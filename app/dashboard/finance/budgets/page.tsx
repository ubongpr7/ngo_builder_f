"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Target,
  Activity,
  Building2,
  PieChart,
  BarChart3,
  Zap,
} from "lucide-react"
import { BudgetOverviewDashboard } from "@/components/finances/budgets/dashboard/budget-overview-dashboard"
import { BudgetAnalyticsPanel } from "@/components/finances/budgets/dashboard/budget-analytics-panel"
import { BudgetListTable } from "@/components/finances/budgets/dashboard/budget-list-table"
import { BudgetFiltersPanel } from "@/components/finances/budgets/dashboard/budget-filters-panel"

import { DepartmentBudgetBreakdown } from "@/components/finances/budgets/dashboard/department-budget-breakdown"
import { BudgetUtilizationMatrix } from "@/components/finances/budgets/dashboard/budget-utilization-matrix"
import { AddBudgetDialog } from "@/components/finances/budgets/dashboard/add-budget-dialog"
import { BudgetHealthIndicators } from "@/components/finances/budgets/dashboard/budget-health-indicators"
import { useGetBudgetsQuery, useGetBudgetStatisticsQuery } from "@/redux/features/finance/budgets"



export default function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState({
    budget_type: "",
    status: "",
    department: "",
    fiscal_year: "",
    ordering: "-created_at",
  })

  const { data: budgets, isLoading: budgetsLoading } = useGetBudgetsQuery({
    search: searchTerm,
    ...filters,
    page_size: 50,
  })

  const { data: statistics, isLoading: statsLoading } = useGetBudgetStatisticsQuery()

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleExport = () => {
    // Export functionality
    console.log("Exporting budget data...")
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
          </Button>

          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
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

      {/* Executive Summary Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Budgets</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{statistics.total_budgets}</p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+12% from last quarter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Allocated</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    ${statistics.total_allocated?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Spent</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    ${statistics.total_spent?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">-3% from target</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Utilization Rate</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {statistics.total_allocated > 0
                      ? Math.round((statistics.total_spent / statistics.total_allocated) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">Optimal range</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
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

        <TabsContent value="analytics" className="space-y-6">
          <BudgetAnalyticsPanel statistics={statistics} isLoading={statsLoading} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetListTable
            budgets={budgets?.results || []}
            isLoading={budgetsLoading}
            onFiltersChange={handleFilterChange}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentBudgetBreakdown statistics={statistics} isLoading={statsLoading} />
        </TabsContent>

        <TabsContent value="utilization" className="space-y-6">
          <BudgetUtilizationMatrix budgets={budgets?.results || []} isLoading={budgetsLoading} />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <BudgetHealthIndicators
            statistics={statistics}
            budgets={budgets?.results || []}
            isLoading={budgetsLoading || statsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Add Budget Dialog */}
      <AddBudgetDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}
