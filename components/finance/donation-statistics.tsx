"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetFinanceSummaryQuery } from "@/redux/features/finance/financeApiSlice"
import { DollarSign, Users, CreditCard, TrendingUp } from "lucide-react"

export function SimpleDonationStatistics() {
  const { data: summary, isLoading } = useGetFinanceSummaryQuery({})
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${summary?.total_donations || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Total amount received</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Donations</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${summary?.monthly_donations || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          <CreditCard className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{summary?.active_campaigns || "0"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Currently running</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{summary?.pending_expenses || "0"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
        </CardContent>
      </Card>
    </div>
  )
}
