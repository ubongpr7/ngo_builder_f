"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, DollarSign, Target, Activity, Zap, Coins } from "lucide-react"
import Select from "react-select"
import { formatCurrency } from "@/lib/currency-utils"

interface CurrencyStatistics {
  summary: {
    currency_id: number
    currency_code: string
    currency_name: string
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
  }>
  by_department: Array<{
    department__name: string
    department__id: number
    count: number
    total_amount: number
    spent_amount: number
    avg_utilization: number
  }>
  performance_metrics: {
    budget_accuracy: number
    approval_efficiency: number
    spend_velocity: number
    forecast_precision: number
    resource_utilization: number
  }
  risk_analysis: {
    overspend_risk: number
    underspend_risk: number
    timeline_risk: number
    resource_risk: number
    compliance_risk: number
  }
}

interface MultiCurrencyStatistics {
  currencies: Record<string, CurrencyStatistics>
  generated_at: string
  filters_applied: Record<string, any>
}

interface BudgetOverviewDashboardProps {
  statistics: CurrencyStatistics | MultiCurrencyStatistics | null
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

// Component to render single currency dashboard
function SingleCurrencyDashboard({ currencyStats }: { currencyStats: CurrencyStatistics }) {
  const summary = currencyStats.summary || {}
  const safeByType = validateChartData(currencyStats.by_type || [])
  const safeByStatus = validateChartData(currencyStats.by_status || [])
  const safeByDepartment = validateChartData(currencyStats.by_department || [])

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

  // Create department data
  const departmentData =
    safeByDepartment.length > 0
      ? safeByDepartment.map((item, index) => ({
          department: item.department__name || "Unknown",
          count: safeNumber(item.count),
          amount: safeNumber(item.total_amount),
          spent: safeNumber(item.spent_amount),
          utilization: safeNumber(item.avg_utilization),
          color: COLORS[index % COLORS.length],
        }))
      : []

  const hasData = safeNumber(summary.total_budgets) > 0
  const currencyCode = summary.currency_code || "USD"

  return (
    <div className="space-y-6">
      {/* Currency Header */}
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">
          {summary.currency_name || "Unknown Currency"} ({currencyCode})
        </h3>
        <Badge variant="outline">{safeNumber(summary.total_budgets)} budgets</Badge>
      </div>

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
                  {formatCurrency(currencyCode, summary.total_allocated)}
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
                  {formatCurrency(currencyCode, summary.total_spent)}
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
                    label={({ name, value }) => `${name}: ${formatCurrency(currencyCode, value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(currencyCode, value), "Amount"]} />
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
                  <Tooltip
                    formatter={(value, name) => [
                      name === "count" ? safeNumber(value) : formatCurrency(currencyCode, value),
                      name === "count" ? "Count" : "Amount",
                    ]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" name="count" />
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

      {/* Department Analysis */}
      {departmentData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(currencyCode, value),
                    name === "amount" ? "Allocated" : "Spent",
                  ]}
                />
                <Bar dataKey="amount" fill="#3b82f6" name="amount" />
                <Bar dataKey="spent" fill="#10b981" name="spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function BudgetOverviewDashboard({ statistics, isLoading }: BudgetOverviewDashboardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("")

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

  // Check if this is multicurrency data or single currency data
  const isMultiCurrency = "currencies" in statistics
  const isSingleCurrency = "summary" in statistics

  if (isSingleCurrency) {
    // Single currency statistics
    return <SingleCurrencyDashboard currencyStats={statistics as CurrencyStatistics} />
  }

  if (isMultiCurrency) {
    // Multiple currencies statistics
    const multiCurrencyStats = statistics as MultiCurrencyStatistics
    const currencies = Object.entries(multiCurrencyStats.currencies || {})

    if (currencies.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No budget data available</p>
              <p className="text-sm">Create your first budget to see statistics</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (currencies.length === 1) {
      // Only one currency, display it directly
      return <SingleCurrencyDashboard currencyStats={currencies[0][1]} />
    }

    // Multiple currencies - show tabs
    const defaultCurrency = selectedCurrency || currencies[0][0]

    // Replace the Tabs component with react-select
    const currencyOptions = currencies.map(([currencyId, currencyData]) => ({
      value: currencyId,
      label: `${currencyData.summary.currency_code} (${currencyData.summary.total_budgets} budgets)`,
      currencyCode: currencyData.summary.currency_code,
      budgetCount: currencyData.summary.total_budgets,
    }))

    const selectedOption = currencyOptions.find((option) => option.value === defaultCurrency) || currencyOptions[0]

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Multi-Currency Budget Overview</h3>
            <Badge variant="outline">{currencies.length} currencies</Badge>
          </div>

          <div className="w-full md:w-64">
            <Select
              value={selectedOption}
              onChange={(option) => setSelectedCurrency(option?.value || currencies[0][0])}
              options={currencyOptions}
              className="w-full"
              placeholder="Select currency"
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>{option.currencyCode}</span>
                  <Badge variant="secondary" className="ml-1">
                    {option.budgetCount}
                  </Badge>
                </div>
              )}
            />
          </div>
        </div>

        {currencies.map(
          ([currencyId, currencyData]) =>
            currencyId === defaultCurrency && (
              <div key={currencyId}>
                <SingleCurrencyDashboard currencyStats={currencyData} />
              </div>
            ),
        )}
      </div>
    )
  }

  // Fallback for unexpected data structure
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p>Invalid statistics data format</p>
        </div>
      </CardContent>
    </Card>
  )
}
