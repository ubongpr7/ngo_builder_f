"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useGetFinanceStatisticsQuery } from "@/redux/features/finance/financeApiSlice"
import { TrendingUp, Users, Calendar, Target } from "lucide-react"

export function CampaignStatistics() {
  const { data: statistics, isLoading } = useGetFinanceStatisticsQuery({})
  console.log(statistics)
  const campaignStats = statistics?.campaign_stats || {
    active_count: 0,
    total_raised: 0,
    success_rate: 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{campaignStats.active_count}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Currently running campaigns</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold">${campaignStats.total_raised?.toFixed(2) || "0.00"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Target className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold">{campaignStats.success_rate?.toFixed(1) || "0"}%</div>
              <Progress value={campaignStats.success_rate || 0} className="h-2 mt-2" />
            </>
          )}
          <p className="text-xs text-gray-500 mt-1">Campaigns reaching target</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Donor Engagement</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{statistics?.donation_stats?.donor_count || "0"}</div>
          )}
          <p className="text-xs text-gray-500 mt-1">Unique donors contributing</p>
        </CardContent>
      </Card>
    </div>
  )
}
