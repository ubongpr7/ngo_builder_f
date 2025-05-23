"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetDonationStatisticsQuery } from "@/redux/features/finance/financeApiSlice"
import { BarChart } from "lucide-react"

export function MonthlyTrend() {
  const { data: statistics, isLoading } = useGetDonationStatisticsQuery({})
  const monthlyTrend = statistics?.monthly_trend || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Donation Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    )
  }

  if (monthlyTrend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Donation Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2">No trend data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find the maximum amount to scale the bars
  const maxAmount = Math.max(...monthlyTrend.map((item: any) => item.amount))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly Donation Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {monthlyTrend.map((item: any, index: number) => {
            const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">${item.amount.toFixed(0)}</div>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.max(height, 4)}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{item.month.split("-")[1]}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
