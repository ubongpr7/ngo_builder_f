"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useGetAccountTransactionsQuery, useGetBalanceHistoryQuery } from "@/redux/features/finance/bank-accounts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useMemo } from "react"

interface BankAccountStatisticsProps {
  accountId: number
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export function BankAccountStatistics({ accountId }: BankAccountStatisticsProps) {
  const { data: transactionsData, isLoading: transactionsLoading } = useGetAccountTransactionsQuery({
    accountId,
    page_size: 1000,
  })

  const { data: balanceHistory, isLoading: balanceLoading } = useGetBalanceHistoryQuery({
    accountId,
    days: 90,
  })

  const statistics = useMemo(() => {
    if (!transactionsData?.results) return null

    const transactions = transactionsData.results
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Filter transactions by time periods
    const last30Days = transactions.filter((t) => new Date(t.transaction_date) >= thirtyDaysAgo)
    const last7Days = transactions.filter((t) => new Date(t.transaction_date) >= sevenDaysAgo)

    // Calculate totals
    const totalCredits = transactions
      .filter((t) => t.transaction_type === "credit")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    const totalDebits = transactions
      .filter((t) => t.transaction_type === "debit")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    const credits30Days = last30Days
      .filter((t) => t.transaction_type === "credit")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    const debits30Days = last30Days
      .filter((t) => t.transaction_type === "debit")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    // Transaction type distribution
    const typeDistribution = transactions.reduce(
      (acc, transaction) => {
        const type = transaction.transaction_type.replace("_", " ").toUpperCase()
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const typeChartData = Object.entries(typeDistribution).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / transactions.length) * 100).toFixed(1),
    }))

    // Monthly transaction volume
    const monthlyData = transactions.reduce(
      (acc, transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
        if (!acc[month]) {
          acc[month] = { month, credits: 0, debits: 0, count: 0 }
        }
        if (transaction.transaction_type === "credit") {
          acc[month].credits += Number.parseFloat(transaction.amount)
        } else {
          acc[month].debits += Number.parseFloat(transaction.amount)
        }
        acc[month].count += 1
        return acc
      },
      {} as Record<string, any>,
    )

    const monthlyChartData = Object.values(monthlyData).slice(-12)

    // Status distribution
    const statusDistribution = transactions.reduce(
      (acc, transaction) => {
        const status = transaction.status.replace("_", " ").toUpperCase()
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / transactions.length) * 100).toFixed(1),
    }))

    // Daily transaction trends (last 30 days)
    const dailyTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const dayTransactions = transactions.filter((t) => t.transaction_date.startsWith(dateStr))

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        credits: dayTransactions
          .filter((t) => t.transaction_type === "credit")
          .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0),
        debits: dayTransactions
          .filter((t) => t.transaction_type === "debit")
          .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0),
        count: dayTransactions.length,
      }
    })

    return {
      totalCredits,
      totalDebits,
      credits30Days,
      debits30Days,
      netFlow30Days: credits30Days - debits30Days,
      transactionCount30Days: last30Days.length,
      transactionCount7Days: last7Days.length,
      averageTransactionSize: transactions.length > 0 ? (totalCredits + totalDebits) / transactions.length : 0,
      typeChartData,
      monthlyChartData,
      statusChartData,
      dailyTrends,
    }
  }, [transactionsData])

  if (transactionsLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No transaction data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">${statistics.totalCredits.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">${statistics.totalDebits.toLocaleString()}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">30-Day Net Flow</p>
                <p
                  className={`text-2xl font-bold ${statistics.netFlow30Days >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${statistics.netFlow30Days.toLocaleString()}
                </p>
              </div>
              {statistics.netFlow30Days >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">${statistics.averageTransactionSize.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Types
            </CardTitle>
            <CardDescription>Distribution by transaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statistics.typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Transaction Volume
            </CardTitle>
            <CardDescription>Credits vs Debits by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === "credits" ? "Credits" : "Debits",
                  ]}
                />
                <Bar dataKey="credits" fill="#10b981" name="credits" />
                <Bar dataKey="debits" fill="#ef4444" name="debits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Transaction Trends
            </CardTitle>
            <CardDescription>Last 30 days activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={statistics.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? value : `$${Number(value).toLocaleString()}`,
                    name === "credits" ? "Credits" : name === "debits" ? "Debits" : "Count",
                  ]}
                />
                <Area type="monotone" dataKey="credits" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="debits" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transaction Status
            </CardTitle>
            <CardDescription>Status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.statusChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Balance History */}
      {balanceHistory && balanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balance History (90 Days)
            </CardTitle>
            <CardDescription>Account balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Balance"]}
                />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statistics.transactionCount30Days}</p>
              <p className="text-sm text-muted-foreground">Transactions (30 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.transactionCount7Days}</p>
              <p className="text-sm text-muted-foreground">Transactions (7 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">${statistics.credits30Days.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Credits (30 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">${statistics.debits30Days.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Debits (30 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
