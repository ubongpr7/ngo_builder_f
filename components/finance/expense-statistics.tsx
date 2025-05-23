"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useGetFinanceStatisticsQuery } from "@/redux/features/finance/financeApiSlice"
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"

export function ExpenseStatistics() {
  const { data: statistics, isLoading } = useGetFinanceStatisticsQuery({})

  const expenseStats = statistics?.expense_stats || {
    total_amount: 0,
    pending_amount: 0,
    growth_rate: 0,
    approval_rate: 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${expenseStats.total_amount?.toFixed(2) || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Total approved expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${expenseStats.pending_amount?.toFixed(2) || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">
              {expenseStats.growth_rate > 0 ? "+" : ""}
              {expenseStats.growth_rate?.toFixed(1) || "0"}%
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Compared to previous period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold">{expenseStats.approval_rate?.toFixed(1) || "0"}%</div>
              <Progress value={expenseStats.approval_rate || 0} className="h-2 mt-2" />
            </>
          )}
          <p className="text-xs text-gray-500 mt-1">Expense approval rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
