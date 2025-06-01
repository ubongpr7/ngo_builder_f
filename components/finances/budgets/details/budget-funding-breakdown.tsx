"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Calendar,
  Users,
  FileText,
  Activity,
  Wallet,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Legend,
} from "recharts"
import type { Budget } from "@/types/finance"
import { formatCurrency, formatPercentage } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"

interface BudgetOverviewEnhancedProps {
  budget: Budget
  isLoading?: boolean
}

// Safe calculation helpers
const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

const safePercentage = (value: any, total: any): number => {
  const val = safeNumber(value)
  const tot = safeNumber(total)
  if (tot === 0) return 0
  return Math.min(100, Math.max(0, (val / tot) * 100))
}

const safeFormatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A"
  try {
    return formatDate(dateString)
  } catch {
    return "Invalid Date"
  }
}

export function BudgetFundingBreakdown({ budget, isLoading = false }: BudgetOverviewEnhancedProps) {
  const [activeMetric, setActiveMetric] = useState("spending")

  // Process budget data safely
  const budgetMetrics = useMemo(() => {
    if (!budget) return null

    const totalAmount = safeNumber(budget.total_amount)
    const spentAmount = safeNumber(budget.spent_amount)
    const committedAmount = safeNumber(budget.committed_amount)
    const pendingAmount = safeNumber(budget.pending_amount)
    const remainingAmount = safeNumber(budget.remaining_amount)
    const fundingAllocated = safeNumber(budget.total_funding_allocated)

    // Calculate key metrics
    const spentPercentage = safePercentage(spentAmount, totalAmount)
    const committedPercentage = safePercentage(committedAmount, totalAmount)
    const fundingPercentage = safePercentage(fundingAllocated, totalAmount)
    const utilizationPercentage = safePercentage(spentAmount + committedAmount, totalAmount)

    // Timeline calculations
    const startDate = budget.start_date ? new Date(budget.start_date) : new Date()
    const endDate = budget.end_date ? new Date(budget.end_date) : new Date()
    const now = new Date()

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const timeProgress = safePercentage(elapsedDays, totalDays)

    // Performance indicators
    const burnRate = elapsedDays > 0 ? spentAmount / elapsedDays : 0
    const projectedSpend = burnRate * totalDays
    const variance = totalAmount - projectedSpend
    const efficiency = timeProgress > 0 ? (spentPercentage / timeProgress) * 100 : 100

    return {
      financial: {
        totalAmount,
        spentAmount,
        committedAmount,
        pendingAmount,
        remainingAmount,
        fundingAllocated,
        spentPercentage,
        committedPercentage,
        fundingPercentage,
        utilizationPercentage,
        variance,
      },
      timeline: {
        totalDays,
        elapsedDays,
        remainingDays,
        timeProgress,
        startDate: safeFormatDate(budget.start_date),
        endDate: safeFormatDate(budget.end_date),
      },
      performance: {
        burnRate,
        projectedSpend,
        efficiency,
        health: budget.budget_health || "UNKNOWN",
        riskLevel: getRiskLevel(spentPercentage, remainingDays, efficiency),
      },
      items: {
        total: budget.total_budget_items_count || 0,
        active: budget.active_budget_items_count || 0,
        critical: budget.critical_items_count || 0,
        overBudget: budget.over_budget_items_count || 0,
      },
    }
  }, [budget])

  // Generate chart data
  const chartData = useMemo(() => {
    if (!budgetMetrics) return { spending: [], categories: [], timeline: [] }

    // Spending breakdown
    const spending = [
      { name: "Spent", value: budgetMetrics.financial.spentAmount, color: "#3B82F6" },
      { name: "Committed", value: budgetMetrics.financial.committedAmount, color: "#F59E0B" },
      { name: "Pending", value: budgetMetrics.financial.pendingAmount, color: "#EF4444" },
      { name: "Available", value: budgetMetrics.financial.remainingAmount, color: "#10B981" },
    ].filter((item) => item.value > 0)

    // Category breakdown (mock data if not available)
    const categories =
      budget.category_breakdown?.map((cat, index) => ({
        name: cat.category,
        budgeted: safeNumber(cat.budgeted_amount),
        spent: safeNumber(cat.spent_amount),
        utilization: safeNumber(cat.utilization_percentage),
        color: getColorByIndex(index),
      })) || []

    // Timeline data
    const timeline = generateTimelineData(budget, budgetMetrics)

    return { spending, categories, timeline }
  }, [budgetMetrics, budget])

  if (isLoading) {
    return <BudgetOverviewSkeleton />
  }

  if (!budget || !budgetMetrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No budget data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{budget.title}</h1>
          <p className="text-muted-foreground">
            {budgetMetrics.timeline.startDate} - {budgetMetrics.timeline.endDate} • {budget.budget_type} Budget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              budgetMetrics.performance.health === "HEALTHY"
                ? "default"
                : budgetMetrics.performance.health === "WARNING"
                  ? "secondary"
                  : "destructive"
            }
          >
            {budgetMetrics.performance.health}
          </Badge>
          <Badge variant="outline">{budget.status}</Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Budget */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                  <p className="text-xs text-muted-foreground">{budget.currency?.code || "USD"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {formatCurrency(budget.currency?.code, budgetMetrics.financial.totalAmount)}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Funding:</span>
                <span className="font-medium">{formatPercentage(budgetMetrics.financial.fundingPercentage)}</span>
                {budgetMetrics.financial.fundingPercentage >= 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Spent</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(budgetMetrics.financial.spentPercentage)} utilized
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {budgetMetrics.financial.spentPercentage > budgetMetrics.timeline.timeProgress ? (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                ) : budgetMetrics.financial.spentPercentage < budgetMetrics.timeline.timeProgress ? (
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                ) : (
                  <Minus className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {formatCurrency(budget.currency?.code, budgetMetrics.financial.spentAmount)}
              </p>
              <Progress
                value={budgetMetrics.financial.spentPercentage}
                className="h-2"
                indicatorClassName={
                  budgetMetrics.financial.spentPercentage > 90
                    ? "bg-red-500"
                    : budgetMetrics.financial.spentPercentage > 75
                      ? "bg-orange-500"
                      : "bg-green-500"
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline Progress */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-xs text-muted-foreground">{budgetMetrics.timeline.remainingDays} days left</p>
                </div>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{formatPercentage(budgetMetrics.timeline.timeProgress)}</p>
              <Progress value={budgetMetrics.timeline.timeProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetMetrics.timeline.elapsedDays} elapsed</span>
                <span>{budgetMetrics.timeline.totalDays} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                  <p className="text-xs text-muted-foreground">Performance score</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {budgetMetrics.performance.efficiency > 100 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : budgetMetrics.performance.efficiency > 80 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{formatPercentage(budgetMetrics.performance.efficiency)}</p>
              <Progress
                value={Math.min(budgetMetrics.performance.efficiency, 100)}
                className="h-2"
                indicatorClassName={
                  budgetMetrics.performance.efficiency > 100
                    ? "bg-red-500"
                    : budgetMetrics.performance.efficiency > 80
                      ? "bg-green-500"
                      : "bg-orange-500"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeMetric} onValueChange={setActiveMetric} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="items">Budget Items</TabsTrigger>
        </TabsList>

        {/* Spending Analysis Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Budget Allocation
                </CardTitle>
                <CardDescription>Current distribution of budget funds</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.spending}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.spending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(budget.currency?.code, Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Financial Summary
                </CardTitle>
                <CardDescription>Detailed breakdown of budget finances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "Total Budget",
                    amount: budgetMetrics.financial.totalAmount,
                    percentage: 100,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Spent",
                    amount: budgetMetrics.financial.spentAmount,
                    percentage: budgetMetrics.financial.spentPercentage,
                    color: "bg-green-500",
                  },
                  {
                    label: "Committed",
                    amount: budgetMetrics.financial.committedAmount,
                    percentage: budgetMetrics.financial.committedPercentage,
                    color: "bg-orange-500",
                  },
                  {
                    label: "Available",
                    amount: budgetMetrics.financial.remainingAmount,
                    percentage: 100 - budgetMetrics.financial.utilizationPercentage,
                    color: "bg-gray-500",
                  },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.label}</span>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(budget.currency?.code, item.amount)}</span>
                        <span className="text-xs text-muted-foreground ml-2">{formatPercentage(item.percentage)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline View Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Spending Timeline
              </CardTitle>
              <CardDescription>Budget utilization over time with projections</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(budget.currency?.code, Number(value)),
                      name === "actual" ? "Actual Spending" : name === "projected" ? "Projected" : "Budget",
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="budget" fill="#E5E7EB" stroke="#9CA3AF" name="Budget Allocation" />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Actual Spending" />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projected Spending"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                Category Performance
              </CardTitle>
              <CardDescription>Budget utilization by category</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        formatCurrency(budget.currency?.code, Number(value)),
                        name === "budgeted" ? "Budgeted" : "Spent",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#E5E7EB" name="Budgeted" />
                    <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Items",
                value: budgetMetrics.items.total,
                icon: FileText,
                color: "bg-blue-100 text-blue-600",
              },
              {
                label: "Active Items",
                value: budgetMetrics.items.active,
                icon: Activity,
                color: "bg-green-100 text-green-600",
              },
              {
                label: "Critical Items",
                value: budgetMetrics.items.critical,
                icon: AlertTriangle,
                color: "bg-orange-100 text-orange-600",
              },
              {
                label: "Over Budget",
                value: budgetMetrics.items.overBudget,
                icon: XCircle,
                color: "bg-red-100 text-red-600",
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Create Item
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Assign Funding
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function getRiskLevel(spentPercentage: number, remainingDays: number, efficiency: number): number {
  let risk = 0
  if (spentPercentage > 90) risk += 30
  if (remainingDays < 30) risk += 25
  if (efficiency > 120) risk += 25
  if (efficiency < 50) risk += 20
  return Math.min(risk, 100)
}

function getColorByIndex(index: number): string {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]
  return colors[index % colors.length]
}

function generateTimelineData(budget: Budget, metrics: any) {
  // Generate mock timeline data based on budget period
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const monthlyBudget = metrics.financial.totalAmount / 6
  const monthlySpent = metrics.financial.spentAmount / 6

  return months.map((month, index) => ({
    period: month,
    budget: monthlyBudget,
    actual: index < 3 ? monthlySpent : null,
    projected: index >= 3 ? monthlySpent * 1.1 : null,
  }))
}

function BudgetOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
