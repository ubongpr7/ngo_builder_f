"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine,
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
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
} from "lucide-react"
import { useGetAccountTransactionsQuery, useGetBalanceHistoryQuery } from "@/redux/features/finance/bank-accounts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useMemo } from "react"
import { formatCurrency } from "@/lib/currency-utils"

interface BankAccountStatisticsProps {
  accountId: number
  account?: any
}

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"]

const TRANSACTION_TYPE_LABELS = {
  credit: "Money In",
  debit: "Money Out",
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

  const analytics = useMemo(() => {
    if (!transactionsData?.results) return null

    const transactions = transactionsData.results
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Time period filters
    const last30Days = transactions.filter((t) => new Date(t.transaction_date) >= thirtyDaysAgo)
    const last7Days = transactions.filter((t) => new Date(t.transaction_date) >= sevenDaysAgo)
    const previous30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= sixtyDaysAgo && new Date(t.transaction_date) < thirtyDaysAgo,
    )

    // Calculate cash flow metrics
    const calculateCashFlow = (txns: any[]) => {
      const moneyIn = txns
        .filter((t) => t.transaction_type === "credit" || t.transaction_type === "transfer_in")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

      const moneyOut = txns
        .filter((t) => t.transaction_type === "debit" || t.transaction_type === "transfer_out")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

      return { moneyIn, moneyOut, netFlow: moneyIn - moneyOut }
    }

    const current30Days = calculateCashFlow(last30Days)
    const previous30DaysFlow = calculateCashFlow(previous30Days)
    const last7DaysFlow = calculateCashFlow(last7Days)

    // Growth rates
    const netFlowGrowth =
      previous30DaysFlow.netFlow !== 0
        ? ((current30Days.netFlow - previous30DaysFlow.netFlow) / Math.abs(previous30DaysFlow.netFlow)) * 100
        : 0

    const volumeGrowth =
      previous30Days.length > 0 ? ((last30Days.length - previous30Days.length) / previous30Days.length) * 100 : 0

    // Transaction patterns by day of week
    const dayOfWeekPatterns = Array.from({ length: 7 }, (_, i) => {
      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]
      const dayTransactions = transactions.filter((t) => new Date(t.transaction_date).getDay() === i)
      const dayFlow = calculateCashFlow(dayTransactions)

      return {
        day: dayName,
        ...dayFlow,
        avgTransactionSize:
          dayTransactions.length > 0 ? (dayFlow.moneyIn + dayFlow.moneyOut) / dayTransactions.length : 0,
        transactionCount: dayTransactions.length,
      }
    })

    // Monthly trends for the last 6 months
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthTransactions = transactions.filter((t) => {
        const txDate = new Date(t.transaction_date)
        return txDate >= monthStart && txDate <= monthEnd
      })

      const monthFlow = calculateCashFlow(monthTransactions)

      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        ...monthFlow,
        transactionCount: monthTransactions.length,
        avgDailyFlow: monthFlow.netFlow / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
      }
    })

    // Transaction velocity (transactions per day)
    const transactionVelocity = last30Days.length / 30
    const previousVelocity = previous30Days.length / 30
    const velocityChange =
      previousVelocity > 0 ? ((transactionVelocity - previousVelocity) / previousVelocity) * 100 : 0

    // Cash flow consistency (standard deviation of daily net flows)
    const dailyNetFlows = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const dayTxns = transactions.filter((t) => t.transaction_date.startsWith(dateStr))
      return calculateCashFlow(dayTxns).netFlow
    })

    const avgDailyFlow = dailyNetFlows.reduce((sum, flow) => sum + flow, 0) / dailyNetFlows.length
    const variance =
      dailyNetFlows.reduce((sum, flow) => sum + Math.pow(flow - avgDailyFlow, 2), 0) / dailyNetFlows.length
    const consistency = Math.sqrt(variance)

    // Risk indicators
    const negativeFlowDays = dailyNetFlows.filter((flow) => flow < 0).length
    const riskLevel = negativeFlowDays > 15 ? "high" : negativeFlowDays > 7 ? "medium" : "low"

    // Transaction type insights
    const typeDistribution = transactions.reduce(
      (acc, t) => {
        const type = t.transaction_type
        if (!acc[type]) acc[type] = { count: 0, amount: 0 }
        acc[type].count += 1
        acc[type].amount += Number.parseFloat(t.amount)
        return acc
      },
      {} as Record<string, { count: number; amount: number }>,
    )

    const typeInsights = Object.entries(typeDistribution).map(([type, data]) => ({
      type: TRANSACTION_TYPE_LABELS[type] || type,
      count: data.count,
      amount: data.amount,
      percentage: ((data.count / transactions.length) * 100).toFixed(1),
      avgAmount: data.amount / data.count,
    }))

    return {
      current30Days,
      previous30DaysFlow,
      last7DaysFlow,
      netFlowGrowth,
      volumeGrowth,
      dayOfWeekPatterns,
      monthlyTrends,
      transactionVelocity,
      velocityChange,
      consistency,
      riskLevel,
      negativeFlowDays,
      typeInsights,
      totalTransactions: transactions.length,
      avgTransactionSize:
        transactions.length > 0
          ? Object.values(typeDistribution).reduce((sum, t) => sum + t.amount, 0) / transactions.length
          : 0,
    }
  }, [transactionsData])

  if (transactionsLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No transaction data available for analysis</p>
        </CardContent>
      </Card>
    )
  }

  const currencyCode = account?.currency?.code || "USD"

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Health Score
          </CardTitle>
          <CardDescription>Overall account performance and risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cash Flow Trend</span>
                <Badge variant={analytics.netFlowGrowth >= 0 ? "default" : "destructive"}>
                  {analytics.netFlowGrowth >= 0 ? "Positive" : "Negative"}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {analytics.netFlowGrowth >= 0 ? "+" : ""}
                {analytics.netFlowGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous 30 days</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activity Level</span>
                <Badge variant={analytics.velocityChange >= 0 ? "default" : "secondary"}>
                  {analytics.transactionVelocity.toFixed(1)} txns/day
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {analytics.velocityChange >= 0 ? "+" : ""}
                {analytics.velocityChange.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">transaction velocity change</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level</span>
                <Badge
                  variant={
                    analytics.riskLevel === "low"
                      ? "default"
                      : analytics.riskLevel === "medium"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {analytics.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{analytics.negativeFlowDays}/30</div>
              <p className="text-xs text-muted-foreground">negative cash flow days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                <p
                  className={`text-2xl font-bold ${analytics.current30Days.netFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(currencyCode, analytics.current30Days.netFlow)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.netFlowGrowth >= 0 ? "+" : ""}
                  {analytics.netFlowGrowth.toFixed(1)}% from last period
                </p>
              </div>
              {analytics.current30Days.netFlow >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Money Inflow</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(currencyCode, analytics.current30Days.moneyIn)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Weekly: {formatCurrency(currencyCode, analytics.last7DaysFlow.moneyIn)}
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
                <p className="text-sm font-medium text-muted-foreground">Money Outflow</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(currencyCode, analytics.current30Days.moneyOut)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Weekly: {formatCurrency(currencyCode, analytics.last7DaysFlow.moneyOut)}
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
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(currencyCode, analytics.avgTransactionSize)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{analytics.totalTransactions} total transactions</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Type Breakdown */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Transaction Type Breakdown</h3>
          <p className="text-sm text-muted-foreground">Detailed view of each transaction type and amounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics.typeInsights.map((insight, index) => (
            <Card key={insight.type} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type.includes("Money In") || insight.type.includes("Transfer In") ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : insight.type.includes("Money Out") || insight.type.includes("Transfer Out") ? (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">{insight.type}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p
                    className={`text-xl font-bold ${
                      insight.type.includes("Money In") || insight.type.includes("Transfer In")
                        ? "text-green-600"
                        : insight.type.includes("Money Out") || insight.type.includes("Transfer Out")
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  >
                    {formatCurrency(currencyCode, insight.amount)}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{insight.count} transactions</span>
                    <span>{insight.percentage}%</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(currencyCode, insight.avgAmount)}
                  </div>
                </div>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    insight.type.includes("Money In") || insight.type.includes("Transfer In")
                      ? "bg-green-500"
                      : insight.type.includes("Money Out") || insight.type.includes("Transfer Out")
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Insights and Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Patterns by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Cash Flow Patterns
            </CardTitle>
            <CardDescription>Discover which days drive your best financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.dayOfWeekPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => formatCurrency(currencyCode, value, { compact: true })} />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(currencyCode, Number(value)),
                    name === "netFlow" ? "Net Cash Flow" : name === "moneyIn" ? "Money In" : "Money Out",
                  ]}
                />
                <Bar dataKey="moneyIn" fill="#10b981" name="moneyIn" />
                <Bar dataKey="moneyOut" fill="#ef4444" name="moneyOut" />
                <Line type="monotone" dataKey="netFlow" stroke="#3b82f6" strokeWidth={3} name="netFlow" />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                💡 <strong>Insight:</strong>{" "}
                {analytics.dayOfWeekPatterns.reduce((best, day) => (day.netFlow > best.netFlow ? day : best)).day} shows
                the strongest cash flow performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Type Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Mix Analysis
            </CardTitle>
            <CardDescription>Understanding your transaction patterns and their impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.typeInsights.map((insight, index) => (
                <div key={insight.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{insight.type}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">{insight.percentage}%</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(currencyCode, insight.avgAmount)} avg
                      </div>
                    </div>
                  </div>
                  <Progress value={Number(insight.percentage)} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {insight.count} transactions • {formatCurrency(currencyCode, insight.amount)} total
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              6-Month Performance Trend
            </CardTitle>
            <CardDescription>Track your financial momentum and identify seasonal patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(currencyCode, value, { compact: true })} />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(currencyCode, Number(value)),
                    name === "netFlow" ? "Net Flow" : name === "avgDailyFlow" ? "Avg Daily Flow" : "Transaction Count",
                  ]}
                />
                <Bar dataKey="netFlow" fill="#3b82f6" name="netFlow" />
                <Line type="monotone" dataKey="avgDailyFlow" stroke="#10b981" strokeWidth={2} name="avgDailyFlow" />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                📈 <strong>Trend:</strong>{" "}
                {analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.netFlow >
                analytics.monthlyTrends[0]?.netFlow
                  ? "Improving"
                  : "Declining"}{" "}
                financial performance over the last 6 months
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Balance History with Insights */}
        {balanceHistory && balanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Balance Evolution & Volatility
              </CardTitle>
              <CardDescription>90-day balance history with volatility analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    fill="url(#balanceGradient)"
                  />
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Volatility Score</p>
                  <p className="font-bold">
                    {analytics.consistency < 1000 ? "Low" : analytics.consistency < 5000 ? "Medium" : "High"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stability Rating</p>
                  <div className="flex items-center gap-2">
                    {analytics.riskLevel === "low" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-bold capitalize">{analytics.riskLevel}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actionable Insights */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actionable Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Strengths</h4>
              {analytics.current30Days.netFlow > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">
                    Positive cash flow of {formatCurrency(currencyCode, analytics.current30Days.netFlow)} this month
                  </p>
                </div>
              )}
              {analytics.velocityChange > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Transaction activity increased by {analytics.velocityChange.toFixed(1)}%</p>
                </div>
              )}
              {analytics.riskLevel === "low" && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Low risk profile with consistent cash flow patterns</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
              {analytics.current30Days.netFlow < 0 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <p className="text-sm">Negative cash flow requires attention - consider reducing outflows</p>
                </div>
              )}
              {analytics.negativeFlowDays > 10 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <p className="text-sm">
                    {analytics.negativeFlowDays} days with negative flow - improve cash flow timing
                  </p>
                </div>
              )}
              {analytics.consistency > 5000 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <p className="text-sm">High volatility detected - consider smoothing cash flow patterns</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
