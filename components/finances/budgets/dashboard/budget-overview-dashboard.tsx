"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { AlertTriangle, DollarSign, Target, Activity, Calendar, Zap } from "lucide-react"

interface BudgetStatistics {
  summary: {
    total_budgets: number
    total_allocated: number
    total_spent: number
    total_remaining: number
    avg_utilization: number
    active_budgets: number
    pending_approval: number
    over_budget_count: number
    near_limit_count: number
    efficiency_score: number
  }
  by_type: Array<{
    budget_type: string
    count: number
    total_amount: number
    spent_amount: number
    avg_utilization: number
  }>
  by_status: Array<{
    status: string
    count: number
    total_amount: number
    spent_amount: number
    avg_utilization: number
  }>
  monthly_trends: Array<{
    month: string
    month_name: string
    budgets_created: number
    total_allocated: number
    total_spent: number
    net_position: number
  }>
  by_department: Array<{
    department: string
    count: number
    total_amount: number
    spent_amount: number
    avg_utilization: number
  }>
}

interface BudgetOverviewDashboardProps {
  statistics: BudgetStatistics | null
  isLoading: boolean
}

// Safe number validation and conversion
const safeNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

// Safe data validation for charts
const validateChartData = (data: any[]): any[] => {
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    const validatedItem: any = {}
    Object.keys(item).forEach((key) => {
      if (typeof item[key] === "number" || typeof item[key] === "string") {
        if (
          key.includes("amount") ||
          key.includes("utilization") ||
          key.includes("count") ||
          key.includes("allocated") ||
          key.includes("spent")
        ) {
          validatedItem[key] = safeNumber(item[key])
        } else {
          validatedItem[key] = item[key] || ""
        }
      } else {
        validatedItem[key] = item[key]
      }
    })
    return validatedItem
  })
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export function BudgetOverviewDashboard({ statistics, isLoading }: BudgetOverviewDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p>Unable to load budget statistics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const summary = statistics.summary || {}
  const safeByType = validateChartData(statistics.by_type || [])
  const safeByStatus = validateChartData(statistics.by_status || [])
  const safeMonthlyTrends = validateChartData(statistics.monthly_trends || [])
  const safeByDepartment = validateChartData(statistics.by_department || [])

  // Create safe pie chart data
  const pieChartData =
    safeByType.length > 0
      ? safeByType
          .map((item, index) => ({
            name: item.budget_type || "Unknown",
            value: safeNumber(item.total_amount),
            count: safeNumber(item.count),
            color: COLORS[index % COLORS.length],
          }))
          .filter((item) => item.value > 0)
      : [{ name: "No Data", value: 1, count: 0, color: "#e5e7eb" }]

  // Create safe status data
  const statusData =
    safeByStatus.length > 0
      ? safeByStatus.map((item, index) => ({
          status: item.status || "Unknown",
          count: safeNumber(item.count),
          amount: safeNumber(item.total_amount),
          color: COLORS[index % COLORS.length],
        }))
      : []

  // Create safe trend data
  const trendData =
    safeMonthlyTrends.length > 0
      ? safeMonthlyTrends.map((item) => ({
          month: item.month_name || item.month || "Unknown",
          allocated: safeNumber(item.total_allocated),
          spent: safeNumber(item.total_spent),
          net: safeNumber(item.net_position),
          budgets: safeNumber(item.budgets_created),
        }))
      : []

  const hasData = safeNumber(summary.total_budgets) > 0

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Budgets</p>
                <p className="text-3xl font-bold text-blue-900">{safeNumber(summary.total_budgets)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Allocated</p>
                <p className="text-3xl font-bold text-green-900">
                  ${safeNumber(summary.total_allocated).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Spent</p>
                <p className="text-3xl font-bold text-orange-900">
                  ${safeNumber(summary.total_spent).toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Utilization</p>
                <p className="text-3xl font-bold text-purple-900">{safeNumber(summary.avg_utilization).toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Distribution by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Distribution by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${safeNumber(value).toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${safeNumber(value).toLocaleString()}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No budget data available</p>
                  <p className="text-sm">Create your first budget to see distribution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Budget Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip formatter={(value) => [safeNumber(value), "Count"]} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No status data available</p>
                  <p className="text-sm">Budget statuses will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Budget Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 && trendData.some((item) => item.allocated > 0 || item.spent > 0) ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${safeNumber(value).toLocaleString()}`, ""]} />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Allocated"
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Spent"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No trend data available</p>
                <p className="text-sm">Budget trends will appear as you create and manage budgets</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
