"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download } from "lucide-react"
import { useGetBalanceHistoryQuery } from "@/redux/features/finance/bank-accounts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface BankAccountBalanceHistoryProps {
  accountId: number
}

export function BankAccountBalanceHistory({ accountId }: BankAccountBalanceHistoryProps) {
  const [timeRange, setTimeRange] = useState("30")
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const {
    data: balanceHistory,
    isLoading,
    error,
  } = useGetBalanceHistoryQuery({
    accountId,
    days: Number.parseInt(timeRange),
  })

  const handleExport = () => {
    if (!balanceHistory) return

    const csvContent = [
      ["Date", "Balance"],
      ...balanceHistory.map((item) => [new Date(item.date).toLocaleDateString(), item.balance.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `balance-history-${timeRange}-days.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getBalanceStats = () => {
    if (!balanceHistory || balanceHistory.length === 0) return null

    const balances = balanceHistory.map((item) => item.balance)
    const currentBalance = balances[balances.length - 1]
    const previousBalance = balances[0]
    const change = currentBalance - previousBalance
    const changePercentage = previousBalance !== 0 ? (change / previousBalance) * 100 : 0
    const maxBalance = Math.max(...balances)
    const minBalance = Math.min(...balances)
    const avgBalance = balances.reduce((sum, balance) => sum + balance, 0) / balances.length

    return {
      currentBalance,
      previousBalance,
      change,
      changePercentage,
      maxBalance,
      minBalance,
      avgBalance,
      isPositiveChange: change >= 0,
    }
  }

  const stats = getBalanceStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !balanceHistory) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load balance history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balance History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="60">Last 60 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="180">Last 6 Months</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={chartType} onValueChange={(value: "line" | "area") => setChartType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">${stats.currentBalance.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Period Change</p>
                  <p className={`text-2xl font-bold ${stats.isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                    {stats.isPositiveChange ? "+" : ""}${stats.change.toLocaleString()}
                  </p>
                  <p className={`text-xs ${stats.isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                    {stats.isPositiveChange ? "+" : ""}
                    {stats.changePercentage.toFixed(2)}%
                  </p>
                </div>
                {stats.isPositiveChange ? (
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
                  <p className="text-sm font-medium text-muted-foreground">Highest Balance</p>
                  <p className="text-2xl font-bold text-green-600">${stats.maxBalance.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Balance</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.avgBalance.toLocaleString()}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Balance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Trend</CardTitle>
          <CardDescription>Account balance over the last {timeRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            {chartType === "area" ? (
              <AreaChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Balance"]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Balance"]}
                />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Balance Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Starting Balance</p>
              <p className="text-lg font-semibold">${stats?.previousBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Ending Balance</p>
              <p className="text-lg font-semibold">${stats?.currentBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Lowest Balance</p>
              <p className="text-lg font-semibold text-red-600">${stats?.minBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Highest Balance</p>
              <p className="text-lg font-semibold text-green-600">${stats?.maxBalance.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
