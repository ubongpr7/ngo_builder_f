"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts"
import {
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  BarChart3,
  PieChartIcon,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

interface BudgetItemAnalyticsProps {
  budgetItem: any
  expenses: any[]
}

export function BudgetItemAnalytics({ budgetItem, expenses }: BudgetItemAnalyticsProps) {
  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  // Process expenses by month
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const month = new Date(expense.expense_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })

    if (!acc[month]) {
      acc[month] = {
        month,
        paid: 0,
        approved: 0,
        pending: 0,
        total: 0,
        count: 0,
      }
    }

    const amount = Number.parseFloat(expense.amount)
    acc[month].total += amount
    acc[month].count += 1

    switch (expense.status) {
      case "paid":
        acc[month].paid += amount
        break
      case "approved":
        acc[month].approved += amount
        break
      case "pending":
      case "draft":
        acc[month].pending += amount
        break
    }

    return acc
  }, {})

  const monthlyData = Object.values(expensesByMonth).sort(
    (a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime(),
  )

  // Process expenses by type and status
  const expensesByType = expenses.reduce((acc, expense) => {
    const type = expense.expense_type || "other"

    if (!acc[type]) {
      acc[type] = {
        type,
        paid: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        total: 0,
        count: 0,
      }
    }

    const amount = Number.parseFloat(expense.amount)
    acc[type].total += amount
    acc[type].count += 1
    acc[type][expense.status] = (acc[type][expense.status] || 0) + amount

    return acc
  }, {})

  const typeData = Object.values(expensesByType)

  // Calculate comprehensive metrics
  const totalBudget = Number.parseFloat(budgetItem.budgeted_amount || "0")
  const spentAmount = Number.parseFloat(budgetItem.spent_amount || "0")
  const committedAmount = Number.parseFloat(budgetItem.committed_amount || "0")
  const pendingAmount = Number.parseFloat(budgetItem.pending_amount || "0")
  const approvedAmount = Number.parseFloat(budgetItem.approved_amount || "0")
  const trulyAvailable = Number.parseFloat(budgetItem.truly_available_amount || "0")

  const spentPercentage = budgetItem.spent_percentage || 0
  const committedPercentage = budgetItem.committed_percentage || 0
  const utilizationPercentage = budgetItem.utilization_percentage || 0

  // Budget breakdown data for pie chart
  const budgetBreakdown = [
    { name: "Spent", value: spentAmount, color: "#ef4444" },
    { name: "Approved", value: approvedAmount, color: "#3b82f6" },
    { name: "Pending", value: pendingAmount, color: "#f59e0b" },
    { name: "Available", value: trulyAvailable, color: "#10b981" },
  ].filter((item) => item.value > 0)

  // Status distribution
  const statusCounts = expenses.reduce((acc, expense) => {
    acc[expense.status] = (acc[expense.status] || 0) + 1
    return acc
  }, {})

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: ((count as number) / expenses.length) * 100,
  }))

  // Utilization trend data
  const utilizationTrend = monthlyData.map((month: any) => ({
    ...month,
    cumulativeSpent: monthlyData
      .filter((m: any) => new Date(m.month) <= new Date(month.month))
      .reduce((sum: number, m: any) => sum + m.paid, 0),
    utilizationRate:
      totalBudget > 0
        ? (monthlyData
            .filter((m: any) => new Date(m.month) <= new Date(month.month))
            .reduce((sum: number, m: any) => sum + m.paid, 0) /
            totalBudget) *
          100
        : 0,
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  const getHealthColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-600"
    if (percentage >= 90) return "text-orange-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "OVER_BUDGET":
      case "OVERCOMMITTED":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "CRITICAL":
      case "AT_RISK":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "WARNING":
      case "CAUTION":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "approved":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "pending":
      case "draft":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Health</p>
                <div className="flex items-center gap-2 mt-1">
                  {getHealthIcon(budgetItem.budget_health)}
                  <span className="text-lg font-bold">{budgetItem.budget_health}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{utilizationPercentage}% utilized</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spent Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(currencyCode, spentAmount)}</p>
                <p className={`text-sm ${getHealthColor(spentPercentage)}`}>{spentPercentage}% of budget</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Committed Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(currencyCode, committedAmount)}</p>
                <p className={`text-sm ${getHealthColor(committedPercentage)}`}>
                  {committedPercentage}% committed
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Truly Available</p>
                <p className="text-2xl font-bold">{formatCurrency(currencyCode, trulyAvailable)}</p>
                <p className="text-sm text-gray-500">After all obligations</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Budget Utilization Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent ({spentPercentage}%)</span>
                <span>{formatCurrency(currencyCode, spentAmount)}</span>
              </div>
              <Progress value={spentPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Committed ({committedPercentage}%)</span>
                <span>{formatCurrency(currencyCode, committedAmount)}</span>
              </div>
              <Progress value={committedPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Utilization ({utilizationPercentage}%)</span>
                <span>{formatCurrency(currencyCode, committedAmount + pendingAmount)}</span>
              </div>
              <Progress value={utilizationPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${formatCurrency(currencyCode, value)} (${(percent * 100)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No budget data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Amount"]} />
                  <Bar dataKey="paid" fill="#10b981" name="Paid" />
                  <Bar dataKey="approved" fill="#3b82f6" name="Approved" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No expense data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Utilization Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Utilization Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {utilizationTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={utilizationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "utilizationRate" ? `${value}%` : formatCurrency(currencyCode, value),
                      name === "utilizationRate" ? "Utilization Rate" : "Cumulative Spent",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="utilizationRate"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    name="Utilization Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No utilization data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Expense Type Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Amount"]} />
                  <Bar dataKey="paid" fill="#10b981" name="Paid" />
                  <Bar dataKey="approved" fill="#3b82f6" name="Approved" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No expense type data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="font-medium">{formatCurrency(currencyCode, totalBudget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Spent Amount</span>
                <span className="font-medium text-green-600">{formatCurrency(currencyCode, spentAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Committed Amount</span>
                <span className="font-medium text-blue-600">{formatCurrency(currencyCode, committedAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Amount</span>
                <span className="font-medium text-yellow-600">{formatCurrency(currencyCode, pendingAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium">Truly Available</span>
                <span className="font-bold text-orange-600">{formatCurrency(currencyCode, trulyAvailable)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Expense Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusData.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm capitalize">{status.status.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{status.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {status.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
