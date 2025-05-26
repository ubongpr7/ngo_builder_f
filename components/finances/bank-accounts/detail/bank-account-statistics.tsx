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
import { formatCurrency } from "@/lib/currency-utils"

interface BankAccountStatisticsProps {
  accountId: number
  account?: any // Add account data to get currency
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

// Transaction type labels mapping
const TRANSACTION_TYPE_LABELS = {
  credit: "Credit (Money In)",
  debit: "Debit (Money Out)",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  currency_exchange: "Currency Exchange",
}

export function BankAccountStatistics({ accountId, account }: BankAccountStatisticsProps) {
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

    // Calculate totals by transaction type
    const totalsByType = transactions.reduce(
      (acc, t) => {
        const type = t.transaction_type
        const amount = Number.parseFloat(t.amount)
        if (!acc[type]) {
          acc[type] = 0
        }
        acc[type] += amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate 30-day totals by transaction type
    const totals30DaysByType = last30Days.reduce(
      (acc, t) => {
        const type = t.transaction_type
        const amount = Number.parseFloat(t.amount)
        if (!acc[type]) {
          acc[type] = 0
        }
        acc[type] += amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Transaction type distribution with proper labels
    const typeDistribution = transactions.reduce(
      (acc, transaction) => {
        const type = transaction.transaction_type
        const label = TRANSACTION_TYPE_LABELS[type] || type
        if (!acc[label]) {
          acc[label] = { count: 0, amount: 0 }
        }
        acc[label].count += 1
        acc[label].amount += Number.parseFloat(transaction.amount)
        return acc
      },
      {} as Record<string, { count: number; amount: number }>,
    )

    const typeChartData = Object.entries(typeDistribution).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount,
      percentage: ((data.count / transactions.length) * 100).toFixed(1),
    }))

    // Monthly transaction volume by all types
    const monthlyData = transactions.reduce(
      (acc, transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
        if (!acc[month]) {
          acc[month] = {
            month,
            credit: 0,
            debit: 0,
            transfer_in: 0,
            transfer_out: 0,
            currency_exchange: 0,
            count: 0,
          }
        }
        const type = transaction.transaction_type
        const amount = Number.parseFloat(transaction.amount)
        if (acc[month][type] !== undefined) {
          acc[month][type] += amount
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

    // Daily transaction trends (last 30 days) - all types
    const dailyTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const dayTransactions = transactions.filter((t) => t.transaction_date.startsWith(dateStr))

      const dayData = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        credit: 0,
        debit: 0,
        transfer_in: 0,
        transfer_out: 0,
        currency_exchange: 0,
        count: dayTransactions.length,
      }

      dayTransactions.forEach((t) => {
        const type = t.transaction_type
        const amount = Number.parseFloat(t.amount)
        if (dayData[type] !== undefined) {
          dayData[type] += amount
        }
      })

      return dayData
    })

    // Calculate net flow (money in vs money out)
    const moneyIn = (totals30DaysByType.credit || 0) + (totals30DaysByType.transfer_in || 0)
    const moneyOut = (totals30DaysByType.debit || 0) + (totals30DaysByType.transfer_out || 0)
    const netFlow30Days = moneyIn - moneyOut

    return {
      totalsByType,
      totals30DaysByType,
      netFlow30Days,
      transactionCount30Days: last30Days.length,
      transactionCount7Days: last7Days.length,
      averageTransactionSize:
        transactions.length > 0
          ? Object.values(totalsByType).reduce((sum, val) => sum + val, 0) / transactions.length
          : 0,
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

  const currencyCode = account?.currency?.code || "USD"

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Money In (30 days)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    currencyCode,
                    (statistics.totals30DaysByType.credit || 0) + (statistics.totals30DaysByType.transfer_in || 0),
                  )}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Money Out (30 days)</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    currencyCode,
                    (statistics.totals30DaysByType.debit || 0) + (statistics.totals30DaysByType.transfer_out || 0),
                  )}
                </p>
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
                  {formatCurrency(currencyCode, statistics.netFlow30Days)}
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
                <p className="text-2xl font-bold">{formatCurrency(currencyCode, statistics.averageTransactionSize)}</p>
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
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? value : formatCurrency(currencyCode, Number(value)),
                    name === "count" ? "Transaction Count" : "Total Amount",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Volume - All Transaction Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Transaction Volume
            </CardTitle>
            <CardDescription>All transaction types by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(currencyCode, value, { compact: true })} />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(currencyCode, Number(value)),
                    TRANSACTION_TYPE_LABELS[name] || name,
                  ]}
                />
                <Bar dataKey="credit" stackId="a" fill="#10b981" name="credit" />
                <Bar dataKey="debit" stackId="a" fill="#ef4444" name="debit" />
                <Bar dataKey="transfer_in" stackId="a" fill="#3b82f6" name="transfer_in" />
                <Bar dataKey="transfer_out" stackId="a" fill="#f59e0b" name="transfer_out" />
                <Bar dataKey="currency_exchange" stackId="a" fill="#8b5cf6" name="currency_exchange" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trends - All Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Transaction Trends
            </CardTitle>
            <CardDescription>Last 30 days activity by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={statistics.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(currencyCode, value, { compact: true })} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? value : formatCurrency(currencyCode, Number(value)),
                    name === "count" ? "Transaction Count" : TRANSACTION_TYPE_LABELS[name] || name,
                  ]}
                />
                <Area type="monotone" dataKey="credit" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="debit" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area
                  type="monotone"
                  dataKey="transfer_in"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="transfer_out"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="currency_exchange"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
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
                <YAxis tickFormatter={(value) => formatCurrency(currencyCode, value, { compact: true })} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [formatCurrency(currencyCode, Number(value)), "Balance"]}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statistics.transactionCount30Days}</p>
              <p className="text-sm text-muted-foreground">Transactions (30 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.transactionCount7Days}</p>
              <p className="text-sm text-muted-foreground">Transactions (7 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(currencyCode, statistics.totals30DaysByType.credit || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Credits (30 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(currencyCode, statistics.totals30DaysByType.transfer_in || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Transfers In (30 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(currencyCode, statistics.totals30DaysByType.debit || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Debits (30 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
