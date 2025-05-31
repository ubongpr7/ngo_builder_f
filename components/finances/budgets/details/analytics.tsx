"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  ComposedChart,
} from "recharts"
import {
  DollarSign,
  PieChartIcon,
  BarChartIcon,
  Activity,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Wallet,
  ArrowDownUp,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Info,
  Lock,
} from "lucide-react"
import type { Budget } from "@/types/finance"
import { formatCurrency, formatPercentage } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetInsightsProps {
  budget: Budget | null
  isLoading?: boolean
}

// Safe date formatting helper
const safeFormatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  try {
    return formatDate(dateString)
  } catch (e) {
    return "Invalid Date"
  }
}

// Define color palettes for consistent visualization
const COLOR_PALETTE = {
  primary: "#3b82f6",
  secondary: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  gray: "#9ca3af",
  funding: ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316"],
  expense: ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"],
  categories: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"],
}

export function BudgetInsights({ budget, isLoading = false }: BudgetInsightsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Process comprehensive data for visualizations
  const processedData = useMemo(() => {
    if (!budget) return null

    // Enhanced funding breakdown by source type with detailed analysis
    const fundingByType =
      budget.funding_breakdown?.reduce((acc, item) => {
        const existing = acc.find((i) => i.source_type === item.source_type)
        if (existing) {
          existing.total_amount += Number.parseFloat(item.amount_allocated)
          existing.count += 1
          existing.sources.push(item.source_name)
        } else {
          acc.push({
            source_type: item.source_type,
            source_type_display: item.source_type_display,
            total_amount: Number.parseFloat(item.amount_allocated),
            count: 1,
            sources: [item.source_name],
            percentage: item.percentage_of_budget,
            is_active: item.is_active,
          })
        }
        return acc
      }, [] as any[]) || []

    // Enhanced expense summary by category with detailed breakdown
    const expensesByCategory =
      budget.expense_summary?.map((expense) => ({
        name: expense.expense_type_display,
        value: expense.total_amount,
        count: expense.total_count,
        formatted_amount: expense.formatted_total_amount,
        by_status: expense.by_status,
        average_amount: expense.total_amount / Math.max(expense.total_count, 1),
      })) || []

    // Enhanced category breakdown with utilization analysis
    const categoryBreakdown =
      budget.category_breakdown?.map((category) => ({
        category: category.category,
        budgeted_amount: Number.parseFloat(category.budgeted_amount),
        spent_amount: Number.parseFloat(category.spent_amount),
        committed_amount: Number.parseFloat(category.committed_amount),
        pending_amount: Number.parseFloat(category.pending_amount),
        remaining_amount: Number.parseFloat(category.remaining_amount),
        spent_percentage: category.spent_percentage,
        committed_percentage: category.committed_percentage,
        utilization_percentage: category.utilization_percentage,
        variance: Number.parseFloat(category.budgeted_amount) - Number.parseFloat(category.spent_amount),
        efficiency:
          category.spent_percentage > 0
            ? (Number.parseFloat(category.spent_amount) / Number.parseFloat(category.budgeted_amount)) * 100
            : 0,
      })) || []

    // Enhanced budget timeline analysis with projections
    const today = new Date()
    const startDate = budget.start_date ? new Date(budget.start_date) : today
    const endDate = budget.end_date ? new Date(budget.end_date) : today
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const remainingDays = Math.max(0, totalDays - elapsedDays)
    const progressPercentage = Math.min(100, Math.max(0, (elapsedDays / Math.max(totalDays, 1)) * 100))

    // Enhanced burn rate analysis with projections
    const idealBurnRate = Number.parseFloat(budget.total_amount) / Math.max(totalDays, 1)
    const actualBurnRate = Number.parseFloat(budget.spent_amount) / Math.max(elapsedDays, 1)
    const projectedSpend = actualBurnRate * totalDays
    const variance = projectedSpend - Number.parseFloat(budget.total_amount)

    // Calculate projected end date safely
    let projectedEndDate = null
    if (actualBurnRate > 0) {
      try {
        projectedEndDate = new Date(
          startDate.getTime() + (Number.parseFloat(budget.total_amount) / actualBurnRate) * 24 * 60 * 60 * 1000,
        )
        // Validate the date is valid
        if (isNaN(projectedEndDate.getTime())) {
          projectedEndDate = null
        }
      } catch (e) {
        projectedEndDate = null
      }
    }

    // Enhanced monthly spending trend with analysis
    const monthlyTrend =
      budget.monthly_spending_trend?.map((month, index) => {
        const monthlyBudget = Number.parseFloat(budget.total_amount) / 12
        const efficiency = Number.parseFloat(month.spent_amount) / monthlyBudget
        return {
          month: month.month,
          spent_amount: Number.parseFloat(month.spent_amount),
          budget_amount: monthlyBudget,
          cumulative_spent: budget.monthly_spending_trend
            .slice(0, index + 1)
            .reduce((sum, m) => sum + Number.parseFloat(m.spent_amount), 0),
          efficiency: efficiency,
          variance: monthlyBudget - Number.parseFloat(month.spent_amount),
          currency: month.currency,
        }
      }) || []

    // Enhanced budget utilization by item analysis
    const itemUtilization =
      budget.budget_utilization_by_item?.map((item) => ({
        id: item.id,
        category: item.category,
        subcategory: item.subcategory,
        description: item.description,
        budgeted_amount: Number.parseFloat(item.budgeted_amount),
        spent_amount: Number.parseFloat(item.spent_amount),
        committed_amount: Number.parseFloat(item.committed_amount),
        pending_amount: Number.parseFloat(item.pending_amount),
        remaining_amount: Number.parseFloat(item.remaining_amount),
        truly_available_amount: Number.parseFloat(item.truly_available_amount),
        spent_percentage: item.spent_percentage,
        committed_percentage: item.committed_percentage,
        utilization_percentage: item.utilization_percentage,
        status: item.status,
        budget_health: item.budget_health,
        is_locked: item.is_locked,
        is_over_budget: item.is_over_budget,
        is_overcommitted: item.is_overcommitted,
        has_pending_requests: item.has_pending_requests,
        responsible_person: item.responsible_person,
        risk_level: item.spent_percentage > 90 ? "high" : item.spent_percentage > 75 ? "medium" : "low",
      })) || []

    // Enhanced funding vs spending analysis
    const fundingAnalysis = budget.funding_vs_spending_analysis
      ? {
          total_budget: Number.parseFloat(budget.funding_vs_spending_analysis.total_budget),
          total_funded: Number.parseFloat(budget.funding_vs_spending_analysis.total_funded),
          total_spent: Number.parseFloat(budget.funding_vs_spending_analysis.total_spent),
          total_committed: Number.parseFloat(budget.funding_vs_spending_analysis.total_committed),
          total_pending: Number.parseFloat(budget.funding_vs_spending_analysis.total_pending),
          funding_gap: Number.parseFloat(budget.funding_vs_spending_analysis.funding_gap),
          funding_surplus: Number.parseFloat(budget.funding_vs_spending_analysis.funding_surplus),
          spending_vs_funding_ratio: budget.funding_vs_spending_analysis.spending_vs_funding_ratio,
          committed_vs_funding_ratio: budget.funding_vs_spending_analysis.committed_vs_funding_ratio,
          budget_utilization: budget.funding_vs_spending_analysis.budget_utilization,
          committed_utilization: budget.funding_vs_spending_analysis.committed_utilization,
          total_utilization: budget.funding_vs_spending_analysis.total_utilization,
          funding_utilization: budget.funding_vs_spending_analysis.funding_utilization,
          funding_efficiency: budget.funding_vs_spending_analysis.funding_efficiency,
          spending_efficiency: budget.funding_vs_spending_analysis.spending_efficiency,
          is_overspent: budget.funding_vs_spending_analysis.is_overspent,
          is_overcommitted: budget.funding_vs_spending_analysis.is_overcommitted,
          is_underfunded: budget.funding_vs_spending_analysis.is_underfunded,
          has_pending_requests: budget.funding_vs_spending_analysis.has_pending_requests,
          currency: budget.funding_vs_spending_analysis.currency,
        }
      : null

    return {
      fundingByType,
      expensesByCategory,
      categoryBreakdown,
      itemUtilization,
      fundingAnalysis,
      timeline: {
        totalDays,
        elapsedDays,
        remainingDays,
        progressPercentage,
        projectedEndDate,
      },
      burnRate: {
        ideal: idealBurnRate,
        actual: actualBurnRate,
        projectedSpend,
        variance,
        isOverBudget: projectedSpend > Number.parseFloat(budget.total_amount),
        efficiency: actualBurnRate > 0 ? (idealBurnRate / actualBurnRate) * 100 : 100,
      },
      monthlyTrend,
      health: budget.budget_health,
      performance: budget.performance_metrics,
      alerts: budget.budget_alerts || [],
    }
  }, [budget])

  // Enhanced custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-lg max-w-xs">
          <p className="font-bold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mt-1">
              <span style={{ color: entry.color }} className="text-sm">
                {entry.name}:
              </span>
              <span className="font-medium ml-2">
                {typeof entry.value === "number"
                  ? formatCurrency(budget?.currency?.code || "USD", entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Loading state with proper skeleton structure
  if (isLoading || !budget) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards with comprehensive metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budget.formatted_amount || formatCurrency(budget.currency?.code, budget.total_amount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safeFormatDate(budget.start_date)} - {safeFormatDate(budget.end_date)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={budget.budget_health === "HEALTHY" ? "default" : "destructive"}>
                {budget.budget_health?.replace("_", " ") || "Unknown"}
              </Badge>
              <span className="text-xs text-gray-500">{budget.total_budget_items_count || 0} items</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budget.formatted_spent_amount || formatCurrency(budget.currency?.code, budget.spent_amount)}
            </div>
            <div className="flex items-center mt-1">
              <Progress
                value={budget.spent_percentage || 0}
                className="h-2 w-full mr-2"
                indicatorClassName={
                  (budget.spent_percentage || 0) > 90
                    ? "bg-red-500"
                    : (budget.spent_percentage || 0) > 75
                      ? "bg-orange-500"
                      : "bg-blue-500"
                }
              />
              <span className="text-xs text-gray-500">{formatPercentage(budget.spent_percentage || 0)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Committed:</span>
                <span className="font-medium ml-1">
                  {budget.formatted_committed_amount || formatCurrency(budget.currency?.code, budget.committed_amount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Pending:</span>
                <span className="font-medium ml-1">
                  {budget.formatted_pending_amount || formatCurrency(budget.currency?.code, budget.pending_amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Funding Status</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budget.formatted_funding_allocated ||
                formatCurrency(budget.currency?.code, budget.total_funding_allocated)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budget.funding_sources_count || 0} sources •{" "}
              {formatPercentage(
                ((Number.parseFloat(budget.total_funding_allocated) || 0) /
                  (Number.parseFloat(budget.total_amount) || 1)) *
                  100,
              )}{" "}
              funded
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Coverage</span>
                <span>{formatPercentage(budget.funding_utilization_percentage || 0)}</span>
              </div>
              <Progress value={budget.funding_utilization_percentage || 0} className="h-2" />
            </div>
            {budget.funding_gap && Number.parseFloat(budget.funding_gap) > 0 && (
              <div className="mt-2 text-xs text-red-600">
                Gap: {budget.formatted_funding_gap || formatCurrency(budget.currency?.code, budget.funding_gap)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  budget.budget_health === "CRITICAL"
                    ? "bg-red-500"
                    : budget.budget_health === "WARNING"
                      ? "bg-orange-500"
                      : budget.budget_health === "UNDERUTILIZED"
                        ? "bg-blue-500"
                        : "bg-green-500"
                }`}
              />
              <div className="text-2xl font-bold">{formatPercentage(budget.spending_efficiency || 0)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Efficiency Score</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Allocation:</span>
                <span className="font-medium ml-1">{formatPercentage(budget.allocation_efficiency || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500">Funding:</span>
                <span className="font-medium ml-1">{formatPercentage(budget.funding_efficiency || 0)}</span>
              </div>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-gray-500">Days remaining:</span>
              <span className="font-medium ml-1">{budget.days_remaining || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Budget Alerts Section */}
      {processedData?.alerts && processedData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Budget Alerts & Notifications
            </CardTitle>
            <CardDescription>Current alerts and recommendations for this budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-500"
                      : alert.severity === "high"
                        ? "bg-orange-50 border-orange-500"
                        : alert.severity === "medium"
                          ? "bg-yellow-50 border-yellow-500"
                          : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />}
                    {alert.type === "error" && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                    {alert.type === "info" && <Info className="h-5 w-5 text-blue-500 mt-0.5" />}
                    {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{alert.message}</h4>
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                  ? "secondary"
                                  : "default"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Category: {alert.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="funding">
            <DollarSign className="h-4 w-4 mr-2" /> Funding
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" /> Categories
          </TabsTrigger>
          <TabsTrigger value="items">
            <BarChartIcon className="h-4 w-4 mr-2" /> Items
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="h-4 w-4 mr-2" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="h-4 w-4 mr-2" /> Forecast
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Comprehensive overview of budget financial health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Utilization Gauge */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${budget.spent_percentage || 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold">{formatPercentage(budget.spent_percentage || 0)}</div>
                          <div className="text-xs text-gray-500">Utilized</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {budget.formatted_remaining_amount ||
                        formatCurrency(budget.currency?.code, budget.remaining_amount)}{" "}
                      remaining
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">Total Budget</span>
                      <span className="font-bold">
                        {budget.formatted_amount || formatCurrency(budget.currency?.code, budget.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Allocated</span>
                      <span className="font-medium">
                        {budget.formatted_allocated_amount ||
                          formatCurrency(budget.currency?.code, budget.allocated_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Spent</span>
                      <span className="font-medium text-blue-600">
                        {budget.formatted_spent_amount || formatCurrency(budget.currency?.code, budget.spent_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Committed</span>
                      <span className="font-medium text-orange-600">
                        {budget.formatted_committed_amount ||
                          formatCurrency(budget.currency?.code, budget.committed_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-medium text-yellow-600">
                        {budget.formatted_pending_amount ||
                          formatCurrency(budget.currency?.code, budget.pending_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Available</span>
                      <span className="font-medium text-green-600">
                        {budget.formatted_available_amount ||
                          formatCurrency(budget.currency?.code, budget.available_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium">Variance</span>
                      <span
                        className={`font-bold ${
                          (Number.parseFloat(budget.variance) || 0) >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {budget.formatted_variance || formatCurrency(budget.currency?.code, budget.variance)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators and efficiency measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Spending Efficiency</span>
                      <span className="font-medium">{formatPercentage(budget.spending_efficiency || 0)}</span>
                    </div>
                    <Progress value={budget.spending_efficiency || 0} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">Measures how effectively budget is being utilized</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Allocation Efficiency</span>
                      <span className="font-medium">{formatPercentage(budget.allocation_efficiency || 0)}</span>
                    </div>
                    <Progress value={budget.allocation_efficiency || 0} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">Percentage of budget properly allocated to items</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Funding Efficiency</span>
                      <span className="font-medium">{formatPercentage(budget.funding_efficiency || 0)}</span>
                    </div>
                    <Progress value={budget.funding_efficiency || 0} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">How well funding sources are being utilized</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time Progress</span>
                      <span className="font-medium">{formatPercentage(budget.progress_percentage || 0)}</span>
                    </div>
                    <Progress value={budget.progress_percentage || 0} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {budget.days_elapsed || 0} of {budget.total_budget_days || 0} days elapsed
                    </p>
                  </div>

                  {/* Key Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(budget.currency?.code, budget.burn_rate || 0)}
                      </div>
                      <div className="text-xs text-blue-600">Daily Burn Rate</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{budget.critical_items_count || 0}</div>
                      <div className="text-xs text-green-600">Critical Items</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChartIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Budget Status</h3>
                    <p className="text-sm text-muted-foreground">Overall health assessment</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Status</span>
                    <Badge variant={budget.budget_health === "HEALTHY" ? "default" : "destructive"}>
                      {budget.budget_health?.replace("_", " ") || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Over Budget</span>
                    <Badge variant={budget.is_over_budget ? "destructive" : "default"}>
                      {budget.is_over_budget ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overcommitted</span>
                    <Badge variant={budget.is_overcommitted ? "destructive" : "default"}>
                      {budget.is_overcommitted ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fully Funded</span>
                    <Badge variant={budget.is_fully_funded ? "default" : "secondary"}>
                      {budget.is_fully_funded ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Progress Tracking</h3>
                    <p className="text-sm text-muted-foreground">Timeline and milestones</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Days Elapsed</span>
                    <span className="font-medium">{budget.days_elapsed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Days Remaining</span>
                    <span className="font-medium">{budget.days_remaining || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="font-medium">{formatPercentage(budget.progress_percentage || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Period</span>
                    <Badge variant={budget.is_active_period ? "default" : "secondary"}>
                      {budget.is_active_period ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Activity Summary</h3>
                    <p className="text-sm text-muted-foreground">Current activity levels</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Items</span>
                    <span className="font-medium">{budget.total_budget_items_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Items</span>
                    <span className="font-medium">{budget.active_budget_items_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Expenses</span>
                    <span className="font-medium">{budget.expenses_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Requests</span>
                    <Badge variant={budget.has_pending_requests ? "secondary" : "default"}>
                      {budget.has_pending_requests ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Funding Tab */}
        <TabsContent value="funding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funding Sources Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Sources Distribution</CardTitle>
                <CardDescription>Breakdown of funding sources by type and amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedData?.fundingByType || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total_amount"
                        nameKey="source_type_display"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {processedData?.fundingByType?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLOR_PALETTE.funding[index % COLOR_PALETTE.funding.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Funding Type Summary */}
                <div className="mt-4 space-y-3">
                  {processedData?.fundingByType?.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLOR_PALETTE.funding[index % COLOR_PALETTE.funding.length] }}
                        />
                        <div>
                          <div className="font-medium">{type.source_type_display}</div>
                          <div className="text-sm text-gray-500">
                            {type.count} source{type.count !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(budget.currency?.code, type.total_amount)}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(type.percentage || 0)} of budget</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funding vs Spending Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Funding vs Spending Analysis</CardTitle>
                <CardDescription>Comprehensive analysis of funding efficiency and utilization</CardDescription>
              </CardHeader>
              <CardContent>
                {processedData?.fundingAnalysis ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(processedData.fundingAnalysis.funding_utilization || 0)}
                        </div>
                        <div className="text-sm text-blue-600">Funding Utilization</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(processedData.fundingAnalysis.spending_efficiency || 0)}
                        </div>
                        <div className="text-sm text-green-600">Spending Efficiency</div>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm font-medium">Total Budget</span>
                        <span className="font-bold">
                          {formatCurrency(budget.currency?.code, processedData.fundingAnalysis.total_budget)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Total Funded</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, processedData.fundingAnalysis.total_funded)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, processedData.fundingAnalysis.total_spent)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Total Committed</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, processedData.fundingAnalysis.total_committed)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Pending Requests</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, processedData.fundingAnalysis.total_pending)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t">
                        <span className="text-sm font-medium">Funding Gap</span>
                        <span
                          className={`font-bold ${
                            processedData.fundingAnalysis.funding_gap > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatCurrency(budget.currency?.code, processedData.fundingAnalysis.funding_gap)}
                        </span>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overspent</span>
                          <Badge variant={processedData.fundingAnalysis.is_overspent ? "destructive" : "default"}>
                            {processedData.fundingAnalysis.is_overspent ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overcommitted</span>
                          <Badge variant={processedData.fundingAnalysis.is_overcommitted ? "destructive" : "default"}>
                            {processedData.fundingAnalysis.is_overcommitted ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Underfunded</span>
                          <Badge variant={processedData.fundingAnalysis.is_underfunded ? "destructive" : "default"}>
                            {processedData.fundingAnalysis.is_underfunded ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pending Requests</span>
                          <Badge variant={processedData.fundingAnalysis.has_pending_requests ? "secondary" : "default"}>
                            {processedData.fundingAnalysis.has_pending_requests ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Utilization Ratios */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Utilization Ratios</h4>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Budget Utilization</span>
                          <span>{formatPercentage(processedData.fundingAnalysis.budget_utilization || 0)}</span>
                        </div>
                        <Progress value={processedData.fundingAnalysis.budget_utilization || 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Committed Utilization</span>
                          <span>{formatPercentage(processedData.fundingAnalysis.committed_utilization || 0)}</span>
                        </div>
                        <Progress value={processedData.fundingAnalysis.committed_utilization || 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total Utilization</span>
                          <span>{formatPercentage(processedData.fundingAnalysis.total_utilization || 0)}</span>
                        </div>
                        <Progress value={processedData.fundingAnalysis.total_utilization || 0} className="h-2" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No funding analysis data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Funding Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Funding Sources</CardTitle>
              <CardDescription>Complete breakdown of all funding sources with allocation details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budget.funding_sources_summary && budget.funding_sources_summary.length > 0 ? (
                  budget.funding_sources_summary.map((source, index) => (
                    <div key={source.id} className="border rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{source.name}</h4>
                            <Badge className={getFundingTypeColor(source.funding_type)}>
                              {source.funding_type_display}
                            </Badge>
                            {!source.is_active && <Badge variant="secondary">Inactive</Badge>}
                          </div>

                          <div className="text-sm text-gray-600">
                            <div>Funding Type: {source.funding_type_display}</div>
                            {source.allocation_date && <div>Allocated: {safeFormatDate(source.allocation_date)}</div>}
                          </div>

                          {source.notes && <p className="text-sm text-gray-600">{source.notes}</p>}
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold">{source.formatted_amount}</div>
                          <div className="text-sm text-gray-600">
                            {formatPercentage(source.percentage || 0)} of budget
                          </div>
                          <div className="text-xs text-gray-500">Currency: {source.currency_code}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No funding sources allocated to this budget yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Budget allocation and spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedData?.categoryBreakdown || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="spent_amount"
                        nameKey="category"
                        label={({ category, spent_percentage }) =>
                          `${category}: ${formatPercentage(spent_percentage || 0)}`
                        }
                      >
                        {processedData?.categoryBreakdown?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLOR_PALETTE.categories[index % COLOR_PALETTE.categories.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Budgeted vs spent vs committed amounts by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData?.categoryBreakdown || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis tickFormatter={(value) => formatCurrency(budget.currency?.code, value, true)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="budgeted_amount" fill="#3b82f6" name="Budgeted" />
                      <Bar dataKey="spent_amount" fill="#10b981" name="Spent" />
                      <Bar dataKey="committed_amount" fill="#f59e0b" name="Committed" />
                      <Bar dataKey="pending_amount" fill="#ef4444" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Category Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Category Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of each budget category with utilization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedData?.categoryBreakdown && processedData.categoryBreakdown.length > 0 ? (
                  processedData.categoryBreakdown.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{category.category}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge
                              variant={
                                category.utilization_percentage > 90
                                  ? "destructive"
                                  : category.utilization_percentage > 75
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {formatPercentage(category.utilization_percentage)} utilized
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Efficiency: {formatPercentage(category.efficiency)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(budget.currency?.code, category.budgeted_amount)}
                          </div>
                          <div className="text-sm text-gray-500">Budgeted Amount</div>
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">
                            {formatCurrency(budget.currency?.code, category.spent_amount)}
                          </div>
                          <div className="text-xs text-blue-600">Spent</div>
                          <div className="text-xs text-gray-500">{formatPercentage(category.spent_percentage)}</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded">
                          <div className="font-bold text-orange-600">
                            {formatCurrency(budget.currency?.code, category.committed_amount)}
                          </div>
                          <div className="text-xs text-orange-600">Committed</div>
                          <div className="text-xs text-gray-500">{formatPercentage(category.committed_percentage)}</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded">
                          <div className="font-bold text-yellow-600">
                            {formatCurrency(budget.currency?.code, category.pending_amount)}
                          </div>
                          <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="font-bold text-green-600">
                            {formatCurrency(budget.currency?.code, category.remaining_amount)}
                          </div>
                          <div className="text-xs text-green-600">Remaining</div>
                        </div>
                      </div>

                      {/* Utilization Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilization Progress</span>
                          <span>{formatPercentage(category.utilization_percentage)}</span>
                        </div>
                        <Progress
                          value={category.utilization_percentage}
                          className="h-3"
                          indicatorClassName={
                            category.utilization_percentage > 90
                              ? "bg-red-500"
                              : category.utilization_percentage > 75
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }
                        />
                      </div>

                      {/* Variance Analysis */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Budget Variance</span>
                          <span className={`font-bold ${category.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {category.variance >= 0 ? "+" : ""}
                            {formatCurrency(budget.currency?.code, category.variance)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {category.variance >= 0
                            ? "Under budget - funds available for reallocation"
                            : "Over budget - requires attention"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No category breakdown data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Items Overview</CardTitle>
                <CardDescription>Summary of all budget items and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{budget.total_budget_items_count || 0}</div>
                    <div className="text-sm text-blue-600">Total Items</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{budget.active_budget_items_count || 0}</div>
                    <div className="text-sm text-green-600">Active Items</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{budget.over_budget_items_count || 0}</div>
                    <div className="text-sm text-red-600">Over Budget</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{budget.critical_items_count || 0}</div>
                    <div className="text-sm text-orange-600">Critical Items</div>
                  </div>
                </div>

                {/* Items Status Distribution */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Items by Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Healthy Items</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${((budget.total_budget_items_count - budget.critical_items_count - budget.over_budget_items_count) / Math.max(budget.total_budget_items_count, 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {budget.total_budget_items_count -
                            budget.critical_items_count -
                            budget.over_budget_items_count || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical Items</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${(budget.critical_items_count / Math.max(budget.total_budget_items_count, 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{budget.critical_items_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Over Budget Items</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(budget.over_budget_items_count / Math.max(budget.total_budget_items_count, 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{budget.over_budget_items_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Utilization Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Items Utilization Distribution</CardTitle>
                <CardDescription>Distribution of budget items by utilization percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData?.itemUtilization?.slice(0, 10) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "utilization_percentage"
                            ? `${value}%`
                            : formatCurrency(budget.currency?.code, value as number),
                          name === "utilization_percentage"
                            ? "Utilization"
                            : name === "spent_amount"
                              ? "Spent"
                              : name === "budgeted_amount"
                                ? "Budgeted"
                                : name,
                        ]}
                        labelFormatter={(label) => `Item: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="utilization_percentage" fill="#3b82f6" name="Utilization %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Items Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Budget Items Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of individual budget items with performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedData?.itemUtilization && processedData.itemUtilization.length > 0 ? (
                  processedData.itemUtilization.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-lg">{item.category}</h4>
                            {item.subcategory && <Badge variant="outline">{item.subcategory}</Badge>}
                            <Badge
                              variant={
                                item.budget_health === "HEALTHY"
                                  ? "default"
                                  : item.budget_health === "WARNING"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {item.budget_health?.replace("_", " ") || "Unknown"}
                            </Badge>
                            {item.is_locked && (
                              <Badge variant="secondary">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                          {item.responsible_person && (
                            <div className="text-sm text-gray-500">Responsible: {item.responsible_person}</div>
                          )}

                          {/* Status Indicators */}
                          <div className="flex items-center gap-2 mt-2">
                            {item.is_over_budget && <Badge variant="destructive">Over Budget</Badge>}
                            {item.is_overcommitted && <Badge variant="destructive">Overcommitted</Badge>}
                            {item.has_pending_requests && <Badge variant="secondary">Pending Requests</Badge>}
                            <Badge
                              variant={
                                item.risk_level === "high"
                                  ? "destructive"
                                  : item.risk_level === "medium"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {item.risk_level} risk
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(budget.currency?.code, item.budgeted_amount)}
                          </div>
                          <div className="text-sm text-gray-500">Budgeted Amount</div>
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">
                            {formatCurrency(budget.currency?.code, item.spent_amount)}
                          </div>
                          <div className="text-xs text-blue-600">Spent</div>
                          <div className="text-xs text-gray-500">{formatPercentage(item.spent_percentage)}</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded">
                          <div className="font-bold text-orange-600">
                            {formatCurrency(budget.currency?.code, item.committed_amount)}
                          </div>
                          <div className="text-xs text-orange-600">Committed</div>
                          <div className="text-xs text-gray-500">{formatPercentage(item.committed_percentage)}</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded">
                          <div className="font-bold text-yellow-600">
                            {formatCurrency(budget.currency?.code, item.pending_amount)}
                          </div>
                          <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="font-bold text-green-600">
                            {formatCurrency(budget.currency?.code, item.remaining_amount)}
                          </div>
                          <div className="text-xs text-green-600">Remaining</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="font-bold text-purple-600">
                            {formatCurrency(budget.currency?.code, item.truly_available_amount)}
                          </div>
                          <div className="text-xs text-purple-600">Available</div>
                        </div>
                      </div>

                      {/* Utilization Progress */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Spending Progress</span>
                            <span>{formatPercentage(item.spent_percentage)}</span>
                          </div>
                          <Progress
                            value={item.spent_percentage}
                            className="h-2"
                            indicatorClassName={
                              item.spent_percentage > 90
                                ? "bg-red-500"
                                : item.spent_percentage > 75
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                            }
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Utilization (Spent + Committed)</span>
                            <span>{formatPercentage(item.utilization_percentage)}</span>
                          </div>
                          <Progress
                            value={item.utilization_percentage}
                            className="h-2"
                            indicatorClassName={
                              item.utilization_percentage > 100
                                ? "bg-red-500"
                                : item.utilization_percentage > 90
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                            }
                          />
                        </div>
                      </div>

                      {/* Item Status Summary */}
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Item Status</span>
                          <Badge
                            variant={
                              item.status === "HEALTHY"
                                ? "default"
                                : item.status === "WARNING"
                                  ? "secondary"
                                  : item.status === "CRITICAL"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {item.status?.replace("_", " ") || "Unknown"}
                          </Badge>
                        </div>

                        {(item.is_over_budget || item.is_overcommitted || item.has_pending_requests) && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                            <div className="font-medium text-yellow-800">Attention Required:</div>
                            <ul className="text-yellow-700 mt-1 space-y-1">
                              {item.is_over_budget && <li>• Item is over budget</li>}
                              {item.is_overcommitted && <li>• Item has overcommitments</li>}
                              {item.has_pending_requests && <li>• Has pending expense requests</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No budget items data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>Historical spending pattern with budget comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedData?.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(budget.currency?.code, value, true)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="cumulative_spent"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        stroke="#3B82F6"
                        name="Cumulative Spent"
                      />
                      <Bar dataKey="spent_amount" fill="#10B981" name="Monthly Spending" />
                      <Line
                        type="monotone"
                        dataKey="budget_amount"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Monthly Budget"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Trend Analysis */}
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm">Trend Analysis</h4>
                  {processedData?.monthlyTrend?.map((month, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{month.month}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(budget.currency?.code, month.spent_amount)}</span>
                        <Badge
                          variant={
                            month.efficiency > 1.1 ? "destructive" : month.efficiency > 0.9 ? "secondary" : "default"
                          }
                        >
                          {formatPercentage(month.efficiency * 100)} efficiency
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline Progress</CardTitle>
                <CardDescription>Budget timeline with key milestones and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline Visualization */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Budget Period</span>
                      <span className="text-sm text-gray-500">
                        {safeFormatDate(budget.start_date)} - {safeFormatDate(budget.end_date)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-blue-500 h-4 rounded-full relative"
                        style={{ width: `${processedData?.timeline.progressPercentage || 0}%` }}
                      >
                        <div className="absolute right-0 top-0 h-4 w-1 bg-blue-700 rounded-r-full" />
                      </div>
                      <div className="absolute top-0 left-0 w-full h-4 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {formatPercentage(processedData?.timeline.progressPercentage || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Start</span>
                      <span>Today</span>
                      <span>End</span>
                    </div>
                  </div>

                  {/* Key Timeline Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{processedData?.timeline.elapsedDays || 0}</div>
                      <div className="text-xs text-blue-600">Days Elapsed</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {processedData?.timeline.remainingDays || 0}
                      </div>
                      <div className="text-xs text-green-600">Days Remaining</div>
                    </div>
                  </div>

                  {/* Burn Rate Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Burn Rate Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Burn Rate</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, processedData?.burnRate.actual || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ideal Daily Rate</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, processedData?.burnRate.ideal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Burn Rate Efficiency</span>
                        <Badge
                          variant={
                            (processedData?.burnRate.efficiency || 0) > 120
                              ? "destructive"
                              : (processedData?.burnRate.efficiency || 0) > 80
                                ? "default"
                                : "secondary"
                          }
                        >
                          {formatPercentage(processedData?.burnRate.efficiency || 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Projected Completion */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Projected Completion</span>
                      <span className="text-sm">
                        {processedData?.timeline.projectedEndDate &&
                        !isNaN(processedData.timeline.projectedEndDate.getTime())
                          ? formatDate(processedData.timeline.projectedEndDate.toISOString())
                          : "N/A"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Based on current spending rate of{" "}
                      {formatCurrency(budget.currency?.code, processedData?.burnRate.actual || 0)} per day
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline Summary & Milestones</CardTitle>
              <CardDescription>Key dates, milestones, and timeline-based insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key Dates */}
                <div className="space-y-4">
                  <h4 className="font-medium">Key Dates</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Budget Start</div>
                        <div className="text-xs text-gray-500">{safeFormatDate(budget.start_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Budget End</div>
                        <div className="text-xs text-gray-500">{safeFormatDate(budget.end_date)}</div>
                      </div>
                    </div>
                    {budget.approved_at && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium">Approved</div>
                          <div className="text-xs text-gray-500">{safeFormatDate(budget.approved_at)}</div>
                        </div>
                      </div>
                    )}
                    {processedData?.timeline.projectedEndDate && (
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium">Projected Completion</div>
                          <div className="text-xs text-gray-500">
                            {processedData?.timeline.projectedEndDate &&
                            !isNaN(processedData.timeline.projectedEndDate.getTime())
                              ? formatDate(processedData.timeline.projectedEndDate.toISOString())
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium">Timeline Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Duration</span>
                      <span className="font-medium">{processedData?.timeline.totalDays || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time Elapsed</span>
                      <span className="font-medium">
                        {formatPercentage(processedData?.timeline.progressPercentage || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Spending vs Time</span>
                      <Badge
                        variant={
                          (budget.spent_percentage || 0) > (processedData?.timeline.progressPercentage || 0) + 10
                            ? "destructive"
                            : (budget.spent_percentage || 0) < (processedData?.timeline.progressPercentage || 0) - 10
                              ? "secondary"
                              : "default"
                        }
                      >
                        {(budget.spent_percentage || 0) > (processedData?.timeline.progressPercentage || 0)
                          ? "Ahead"
                          : (budget.spent_percentage || 0) < (processedData?.timeline.progressPercentage || 0)
                            ? "Behind"
                            : "On Track"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Budget Period Status</span>
                      <Badge variant={budget.is_active_period ? "default" : "secondary"}>
                        {budget.is_active_period ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Indicators</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Time Efficiency</span>
                        <span>
                          {formatPercentage(
                            (processedData?.timeline.progressPercentage || 0) > 0
                              ? ((budget.spent_percentage || 0) / (processedData?.timeline.progressPercentage || 1)) *
                                  100
                              : 0,
                          )}
                        </span>
                      </div>
                      <Progress
                        value={
                          (processedData?.timeline.progressPercentage || 0) > 0
                            ? ((budget.spent_percentage || 0) / (processedData?.timeline.progressPercentage || 1)) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm font-medium text-blue-800">Velocity Score</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPercentage(
                          (processedData?.timeline.progressPercentage || 0) > 0
                            ? ((budget.spent_percentage || 0) / (processedData?.timeline.progressPercentage || 1)) * 100
                            : 0,
                        )}
                      </div>
                      <div className="text-xs text-blue-600">
                        {(budget.spent_percentage || 0) > (processedData?.timeline.progressPercentage || 0)
                          ? "Spending faster than time progress"
                          : "Spending slower than time progress"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Burn Rate Projections */}
            <Card>
              <CardHeader>
                <CardTitle>Burn Rate Analysis & Projections</CardTitle>
                <CardDescription>Current spending rate analysis with future projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Burn Rate Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(budget.currency?.code, processedData?.burnRate.actual || 0)}
                      </div>
                      <div className="text-sm text-blue-600">Daily Burn Rate</div>
                      <div className="text-xs text-gray-500 mt-1">Current spending pace</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(budget.currency?.code, processedData?.burnRate.ideal || 0)}
                      </div>
                      <div className="text-sm text-green-600">Ideal Daily Rate</div>
                      <div className="text-xs text-gray-500 mt-1">Target spending pace</div>
                    </div>
                  </div>

                  {/* Projection Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Projection Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm font-medium">Projected Total Spend</span>
                        <span className="font-bold">
                          {formatCurrency(budget.currency?.code, processedData?.burnRate.projectedSpend || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm">Budget Allocation</span>
                        <span className="font-medium">
                          {formatCurrency(budget.currency?.code, budget.total_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t">
                        <span className="text-sm font-medium">Projected Variance</span>
                        <span
                          className={`font-bold ${
                            (processedData?.burnRate.variance || 0) >= 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {(processedData?.burnRate.variance || 0) >= 0 ? "+" : ""}
                          {formatCurrency(budget.currency?.code, Math.abs(processedData?.burnRate.variance || 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Efficiency Metrics</h4>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Burn Rate Efficiency</span>
                        <span>{formatPercentage(processedData?.burnRate.efficiency || 0)}</span>
                      </div>
                      <Progress
                        value={Math.min(processedData?.burnRate.efficiency || 0, 200)}
                        className="h-3"
                        indicatorClassName={
                          (processedData?.burnRate.efficiency || 0) > 120
                            ? "bg-red-500"
                            : (processedData?.burnRate.efficiency || 0) > 80
                              ? "bg-green-500"
                              : "bg-orange-500"
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(processedData?.burnRate.efficiency || 0) > 100
                          ? "Spending faster than planned"
                          : "Spending slower than planned"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Projections Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Projection Visualization</CardTitle>
                <CardDescription>Visual representation of spending projections vs budget allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Current",
                          actual: Number.parseFloat(budget.spent_amount),
                          budget: Number.parseFloat(budget.total_amount),
                          projected: 0,
                        },
                        {
                          name: "Projected",
                          actual: 0,
                          budget: Number.parseFloat(budget.total_amount),
                          projected: processedData?.burnRate.projectedSpend || 0,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(budget.currency?.code, value, true)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="budget" fill="#E5E7EB" name="Budget Allocation" />
                      <Bar dataKey="actual" fill="#10B981" name="Current Spending" />
                      <Bar
                        dataKey="projected"
                        fill={processedData?.burnRate.isOverBudget ? "#EF4444" : "#3B82F6"}
                        name="Projected Spending"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Projection Status */}
                <div
                  className={`mt-4 p-3 rounded-lg border-l-4 ${
                    processedData?.burnRate.isOverBudget ? "bg-red-50 border-red-500" : "bg-green-50 border-green-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {processedData?.burnRate.isOverBudget ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <h4
                      className={`font-medium ${
                        processedData?.burnRate.isOverBudget ? "text-red-800" : "text-green-800"
                      }`}
                    >
                      {processedData?.burnRate.isOverBudget ? "Budget Overrun Projected" : "Budget On Track"}
                    </h4>
                  </div>
                  <p className={`text-sm ${processedData?.burnRate.isOverBudget ? "text-red-700" : "text-green-700"}`}>
                    {processedData?.burnRate.isOverBudget
                      ? `Current spending rate projects an overrun of ${formatCurrency(budget.currency?.code, Math.abs(processedData?.burnRate.variance || 0))}`
                      : `Current spending rate is sustainable within budget limits`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Recommendations & Action Items</CardTitle>
              <CardDescription>
                AI-powered recommendations based on current budget performance and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance-based Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Performance Recommendations
                  </h4>
                  <div className="space-y-3">
                    {processedData?.burnRate.isOverBudget ? (
                      <>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="font-medium text-red-800 mb-1">Critical: Reduce Spending Rate</div>
                          <p className="text-sm text-red-700">
                            Current burn rate of{" "}
                            {formatCurrency(budget.currency?.code, processedData?.burnRate.actual || 0)}/day needs to be
                            reduced to {formatCurrency(budget.currency?.code, processedData?.burnRate.ideal || 0)}/day
                            to stay within budget.
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="font-medium text-orange-800 mb-1">Review High-Spend Categories</div>
                          <p className="text-sm text-orange-700">
                            Focus on categories with utilization above 75% and consider reallocating funds from
                            underutilized categories.
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="font-medium text-yellow-800 mb-1">Implement Spending Controls</div>
                          <p className="text-sm text-yellow-700">
                            Consider implementing approval workflows for expenses above a certain threshold to control
                            spending velocity.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="font-medium text-green-800 mb-1">Good: Spending On Track</div>
                          <p className="text-sm text-green-700">
                            Current spending rate is sustainable. You have{" "}
                            {formatCurrency(budget.currency?.code, Math.abs(processedData?.burnRate.variance || 0))}
                            available for additional initiatives.
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="font-medium text-blue-800 mb-1">Opportunity: Accelerate Key Projects</div>
                          <p className="text-sm text-blue-700">
                            Consider accelerating high-priority projects or investing in strategic initiatives with the
                            available budget surplus.
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="font-medium text-purple-800 mb-1">Optimize: Review Underutilized Areas</div>
                          <p className="text-sm text-purple-700">
                            Some budget categories may be underutilized. Consider reallocating funds to areas with
                            higher impact potential.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Strategic Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Strategic Actions
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-800 mb-1">Monitor Critical Items</div>
                      <p className="text-sm text-blue-700">
                        {budget.critical_items_count || 0} budget items require immediate attention. Review these items
                        weekly to prevent budget overruns.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="font-medium text-indigo-800 mb-1">Improve Forecasting</div>
                      <p className="text-sm text-indigo-700">
                        Current forecasting accuracy is {formatPercentage(processedData?.burnRate.efficiency || 0)}.
                        Implement more granular tracking for better predictions.
                      </p>
                    </div>

                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="font-medium text-teal-800 mb-1">Optimize Funding Efficiency</div>
                      <p className="text-sm text-teal-700">
                        Funding efficiency is at {formatPercentage(budget.funding_efficiency || 0)}. Consider
                        renegotiating terms with underperforming funding sources.
                      </p>
                    </div>

                    {budget.has_pending_requests && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="font-medium text-amber-800 mb-1">Process Pending Requests</div>
                        <p className="text-sm text-amber-700">
                          There are pending expense requests that may impact projections. Process these requests
                          promptly for accurate forecasting.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Items Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Immediate Action Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">High Priority</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {processedData?.burnRate.isOverBudget && (
                        <li>• Implement spending controls to reduce burn rate</li>
                      )}
                      {(budget.critical_items_count || 0) > 0 && (
                        <li>• Review {budget.critical_items_count} critical budget items</li>
                      )}
                      {budget.has_pending_requests && <li>• Process pending expense requests</li>}
                      {(budget.funding_efficiency || 0) < 70 && <li>• Optimize funding source utilization</li>}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Medium Priority</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Review category allocations for optimization</li>
                      <li>• Update forecasting models with recent data</li>
                      <li>• Conduct quarterly budget review meeting</li>
                      <li>• Document lessons learned for future budgets</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get funding type colors
function getFundingTypeColor(type: string) {
  switch (type) {
    case "donation":
      return "bg-green-100 text-green-800"
    case "grant":
      return "bg-blue-100 text-blue-800"
    case "campaign":
      return "bg-purple-100 text-purple-800"
    case "internal":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-orange-100 text-orange-800"
  }
}
