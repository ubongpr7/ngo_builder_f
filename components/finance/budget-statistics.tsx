"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useGetFinanceStatisticsQuery } from "@/redux/features/finance/financeApiSlice"
import { DollarSign, PieChart, TrendingDown, BarChart } from "lucide-react"

export function BudgetStatistics() {
  const { data: statistics, isLoading } = useGetFinanceStatisticsQuery({})

  const budgetStats = statistics?.budget_stats || {
    total_budget: 0,
    total_spent: 0,
    total_remaining: 0,
    utilization_rate: 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${budgetStats.total_budget?.toFixed(2) || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Total allocated budget</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingDown className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${budgetStats.total_spent?.toFixed(2) || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Amount spent to date</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
          <BarChart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${budgetStats.total_remaining?.toFixed(2) || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Available funds</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          <PieChart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold">{budgetStats.utilization_rate?.toFixed(1) || "0"}%</div>
              <Progress value={budgetStats.utilization_rate || 0} className="h-2 mt-2" />
            </>
          )}
          <p className="text-xs text-gray-500 mt-1">Budget utilization</p>
        </CardContent>
      </Card>
    </div>
  )
}
