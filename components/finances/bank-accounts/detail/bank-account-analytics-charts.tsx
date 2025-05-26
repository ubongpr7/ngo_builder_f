"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Calendar, DollarSign, Activity, PieChartIcon } from "lucide-react"
import { useGetAccountTransactionsQuery, useGetBalanceHistoryQuery } from "@/redux/features/finance/bank-accounts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useState, useMemo } from "react"

interface BankAccountAnalyticsChartsProps {
  accountId: number
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export function BankAccountAnalyticsCharts({ accountId }: BankAccountAnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState("90")

  const { data: transactionsData, isLoading: transactionsLoading } = useGetAccountTransactionsQuery({
    accountId,
    page_size: 1000,
  })

  const { data: balanceHistory, isLoading: balanceLoading } = useGetBalanceHistoryQuery({
    accountId,
    days: Number.parseInt(timeRange),
  })

  const analyticsData = useMemo(() => {
    if (!transactionsData?.results) return null

    const transactions = transactionsData.results
    const now = new Date()
    const rangeStart = new Date(now.getTime() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000)

    const filteredTransactions = transactions.filter((t) => new Date(t.transaction_date) >= rangeStart)

    // Weekly trends
    const weeklyData = Array.from({ length: Math.ceil(Number.parseInt(timeRange) / 7) }, (_, i) => {
      const weekStart = new Date(rangeStart.getTime() + i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const weekTransactions = filteredTransactions.filter((t) => {
        const date = new Date(t.transaction_date)
        return date >= weekStart && date < weekEnd
      })

      const credits = weekTransactions
        .filter((t) => t.transaction_type === "credit")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

      const debits = weekTransactions
        .filter((t) => t.transaction_type === "debit")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

      return {
        week: `Week ${i + 1}`,
        credits,
        debits,
        net: credits - debits,
        count: weekTransactions.length,
      }
    })

    // Transaction volume by hour
    const hourlyVolume = Array.from({ length: 24 }, (_, hour) => {
      const hourTransactions = filteredTransactions.filter((t) => {
        const transactionHour = new Date(t.transaction_date).getHours()
        return transactionHour === hour
      })

      return {
        hour: `${hour}:00`,
        count: hourTransactions.length,
        amount: hourTransactions.reduce((sum, t) => sum + Number.parseFloat(t.amount), 0),
      }
    })

    // Transaction size distribution
    const sizeRanges = [
      { range: "$0-$100", min: 0, max: 100 },
      { range: "$100-$500", min: 100, max: 500 },
      { range: "$500-$1K", min: 500, max: 1000 },
      { range: "$1K-$5K", min: 1000, max: 5000 },
      { range: "$5K-$10K", min: 5000, max: 10000 },
      { range: "$10K+", min: 10000, max: Number.POSITIVE_INFINITY },
    ]

    const sizeDistribution = sizeRanges.map((range) => {
      const count = filteredTransactions.filter((t) => {
        const amount = Number.parseFloat(t.amount)
        return amount >= range.min && amount < range.max
      }).length

      return {
        range: range.range,
        count,
        percentage: filteredTransactions.length > 0 ? ((count / filteredTransactions.length) * 100).toFixed(1) : "0",
      }
    })

    // Monthly comparison
    const monthlyComparison = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.transaction_date)
        return date >= monthStart && date <= monthEnd
      })

      const credits = monthTransactions
        .filter((t) => t.transaction_type === "credit")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

      const debits = monthTransactions
        .filter((t) => t.transaction_type === "debit")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

      return {
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        credits,
        debits,
        net: credits - debits,
        count: monthTransactions.length,
      }
    }).reverse()

    // Cash flow patterns
    const cashFlowPatterns = filteredTransactions.reduce(
      (acc, transaction) => {
        const dayOfWeek = new Date(transaction.transaction_date).toLocaleDateString("en-US", { weekday: "long" })
        if (!acc[dayOfWeek]) {
          acc[dayOfWeek] = { day: dayOfWeek, credits: 0, debits: 0, count: 0 }
        }

        if (transaction.transaction_type === "credit") {
          acc[dayOfWeek].credits += Number.parseFloat(transaction.amount)
        } else {
          acc[dayOfWeek].debits += Number.parseFloat(transaction.amount)
        }
        acc[dayOfWeek].count += 1

        return acc
      },
      {} as Record<string, any>,
    )

    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const cashFlowData = dayOrder.map((day) => cashFlowPatterns[day] || { day, credits: 0, debits: 0, count: 0 })

    return {
      weeklyData,
      hourlyVolume,
      sizeDistribution,
      monthlyComparison,
      cashFlowData,
    }
  }, [transactionsData, timeRange])

  if (transactionsLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No data available for analytics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Account Analytics
            </CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="60">Last 60 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Trends
            </CardTitle>
            <CardDescription>Credits vs Debits by week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === "credits" ? "Credits" : name === "debits" ? "Debits" : "Net Flow",
                  ]}
                />
                <Bar dataKey="credits" fill="#10b981" name="credits" />
                <Bar dataKey="debits" fill="#ef4444" name="debits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Size Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Transaction Size Distribution
            </CardTitle>
            <CardDescription>Distribution by transaction amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.sizeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.sizeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Hourly Activity Pattern
            </CardTitle>
            <CardDescription>Transaction volume by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.hourlyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? value : `$${Number(value).toLocaleString()}`,
                    name === "count" ? "Transaction Count" : "Total Amount",
                  ]}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Flow by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash Flow by Day
            </CardTitle>
            <CardDescription>Average daily cash flow patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
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
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Comparison
          </CardTitle>
          <CardDescription>6-month transaction comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analyticsData.monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "credits" ? "Credits" : name === "debits" ? "Debits" : "Net Flow",
                ]}
              />
              <Line type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={2} name="credits" />
              <Line type="monotone" dataKey="debits" stroke="#ef4444" strokeWidth={2} name="debits" />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="net" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Balance History */}
      {balanceHistory && balanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balance History
            </CardTitle>
            <CardDescription>Account balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={balanceHistory}>
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
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
