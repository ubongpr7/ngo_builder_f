"use client"

import { DashboardCard } from "@/components/ui/dashboard-card"
import { DollarSign, TrendingUp, Target, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { usePermissions } from "@/components/permissionHander"
import { Badge } from "@/components/ui/badge"
import { FinanceAnalyticsSection } from "./finance-analytics-section"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  useGetFinanceSummaryQuery,
  useGetDonationStatisticsQuery,
  useGetActiveCampaignsQuery,
  useGetActiveGrantsQuery,
  useGetActiveBudgetsQuery,
  useGetPendingOrganizationalExpensesQuery,
  useGetRecentDonationsQuery,
} from "@/redux/features/finance/financeApiSlice"

interface FinanceDashboardProps {
  userRoles?: any
  className?: string
}

export function FinanceDashboard({ userRoles, className }: FinanceDashboardProps) {
  const {
    data: financeSummary,
    isLoading: summaryLoading,
    refetch: refreshSummary,
    isFetching: isRefreshingSummary,
  } = useGetFinanceSummaryQuery({})

  const {
    data: donationStats,
    isLoading: donationStatsLoading,
    refetch: refreshDonationStats,
    isFetching: isRefreshingDonationStats,
  } = useGetDonationStatisticsQuery({})

  const {
    data: activeCampaigns,
    isLoading: campaignsLoading,
    refetch: refreshCampaigns,
    isFetching: isRefreshingCampaigns,
  } = useGetActiveCampaignsQuery()

  const {
    data: activeGrants,
    isLoading: grantsLoading,
    refetch: refreshGrants,
    isFetching: isRefreshingGrants,
  } = useGetActiveGrantsQuery()

  const {
    data: activeBudgets,
    isLoading: budgetsLoading,
    refetch: refreshBudgets,
    isFetching: isRefreshingBudgets,
  } = useGetActiveBudgetsQuery()

  const {
    data: pendingExpenses,
    isLoading: expensesLoading,
    refetch: refreshExpenses,
    isFetching: isRefreshingExpenses,
  } = useGetPendingOrganizationalExpensesQuery()

  const {
    data: recentDonations,
    isLoading: recentDonationsLoading,
    refetch: refreshRecentDonations,
    isFetching: isRefreshingRecentDonations,
  } = useGetRecentDonationsQuery()

  const is_finance_admin = usePermissions(userRoles, { requiredRoles: ["is_finance_admin"], requireKYC: true })
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true)
    await Promise.all([
      refreshSummary(),
      refreshDonationStats(),
      refreshCampaigns(),
      refreshGrants(),
      refreshBudgets(),
      refreshExpenses(),
      refreshRecentDonations(),
    ])
    setIsRefreshing(false)
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Check if any data is currently being refreshed
  const isAnyDataRefreshing =
    isRefreshing ||
    isRefreshingSummary ||
    isRefreshingDonationStats ||
    isRefreshingCampaigns ||
    isRefreshingGrants ||
    isRefreshingBudgets ||
    isRefreshingExpenses ||
    isRefreshingRecentDonations

  // Calculate campaign success rate
  const campaignSuccessRate =
    activeCampaigns?.length > 0
      ? (activeCampaigns.filter((c) => c.progress_percentage >= 100).length / activeCampaigns.length) * 100
      : 0

  // Calculate donation growth
  const monthlyTrend = donationStats?.monthly_trend || []
  const currentMonth = monthlyTrend[monthlyTrend.length - 1]?.total_amount || 0
  const previousMonth = monthlyTrend[monthlyTrend.length - 2]?.total_amount || 0
  const donationGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Finance Management</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAllData}
                disabled={isAnyDataRefreshing}
                className="transition-all duration-200 hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnyDataRefreshing ? "animate-spin" : ""}`} />
                {isAnyDataRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh finance data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Donations Card */}
        <DashboardCard
          title="Total Donations"
          value={summaryLoading ? "—" : formatCurrency(Number(financeSummary?.total_donations || 0))}
          description={`${formatCurrency(Number(financeSummary?.monthly_donations || 0))} this month`}
          icon={<DollarSign className="h-4 w-4 text-green-600" />}
          trend={{
            value: Math.abs(donationGrowth),
            isPositive: donationGrowth >= 0,
            label: "vs last month",
          }}
          isLoading={summaryLoading || isRefreshingSummary}
        />

        {/* Active Campaigns Card */}
        <DashboardCard
          title="Active Campaigns"
          value={campaignsLoading ? "—" : (activeCampaigns?.length || 0).toString()}
          description={`${campaignSuccessRate.toFixed(0)}% success rate`}
          icon={<Target className="h-4 w-4 text-blue-600" />}
          trend={{
            value: campaignSuccessRate,
            isPositive: campaignSuccessRate >= 70,
            label: "success rate",
          }}
          isLoading={campaignsLoading || isRefreshingCampaigns}
        />

        {/* Total Grants Card */}
        <DashboardCard
          title="Total Grants"
          value={summaryLoading ? "—" : formatCurrency(Number(financeSummary?.total_grants || 0))}
          description={`${activeGrants?.length || 0} active grants`}
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
          trend={{
            value: activeGrants?.length || 0,
            isPositive: true,
            label: "active",
          }}
          isLoading={summaryLoading || grantsLoading || isRefreshingSummary || isRefreshingGrants}
        />

        {/* Pending Expenses Card */}
        <DashboardCard
          title="Pending Expenses"
          value={expensesLoading ? "—" : (pendingExpenses?.length || 0).toString()}
          description={`${formatCurrency(Number(financeSummary?.monthly_expenses || 0))} this month`}
          icon={<AlertCircle className="h-4 w-4 text-orange-600" />}
          trend={{
            value: pendingExpenses?.length || 0,
            isPositive: (pendingExpenses?.length || 0) <= 5,
            label: "awaiting approval",
          }}
          isLoading={expensesLoading || isRefreshingExpenses}
        />
      </div>

      {/* Analytics Section */}
      <FinanceAnalyticsSection
        donationStats={donationStats}
        campaignStats={{
          active_campaigns: activeCampaigns?.length || 0,
          completed_campaigns: 0, // You might want to fetch this separately
          featured_campaigns: activeCampaigns?.filter((c) => c.is_featured).length || 0,
        }}
        grantStats={{
          active_grant_amount: activeGrants?.reduce((sum, grant) => sum + Number(grant.amount), 0) || 0,
          pending_grant_amount: 0, // You might want to fetch pending grants
          completed_grant_amount: 0, // You might want to fetch completed grants
          total_grant_amount: Number(financeSummary?.total_grants || 0),
          total_received_amount: activeGrants?.reduce((sum, grant) => sum + Number(grant.amount_received), 0) || 0,
        }}
        budgetStats={{
          total_budget: activeBudgets?.reduce((sum, budget) => sum + Number(budget.total_amount), 0) || 0,
          total_spent: activeBudgets?.reduce((sum, budget) => sum + Number(budget.spent_amount), 0) || 0,
        }}
        expenseStats={{
          pending_expenses: pendingExpenses?.length || 0,
          approved_expenses: 0, // You might want to fetch this separately
          rejected_expenses: 0, // You might want to fetch this separately
        }}
        isLoading={summaryLoading || donationStatsLoading || campaignsLoading}
        isRefreshing={isRefreshingSummary || isRefreshingDonationStats || isRefreshingCampaigns}
        onRefresh={refreshAllData}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Donations */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Recent Donations</h2>
              {isRefreshingRecentDonations && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
            </div>
            <Link href="/dashboard/finance/donations" className="text-sm text-blue-600 hover:underline">
              View all donations
            </Link>
          </div>

          {recentDonationsLoading || isRefreshingRecentDonations ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : recentDonations && recentDonations.length > 0 ? (
            <div className="space-y-4">
              {recentDonations.slice(0, 3).map((donation) => (
                <div key={donation.id} className="border-b pb-4 hover:bg-gray-50 transition-colors rounded p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{donation.donor_name_display}</h3>
                      <p className="text-sm text-gray-600">{formatCurrency(Number(donation.amount))}</p>
                      <p className="text-xs text-gray-500">{formatDate(donation.donation_date)}</p>
                    </div>
                    <Badge className={getStatusColor(donation.status)}>{donation.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent donations found</p>
              <Button variant="outline" className="mt-2 hover:bg-gray-100" asChild>
                <Link href="/dashboard/finance/donations">View Donations</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Active Campaigns */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Active Campaigns</h2>
              {isRefreshingCampaigns && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
            </div>
            <Link href="/dashboard/finance/campaigns" className="text-sm text-blue-600 hover:underline">
              View all campaigns
            </Link>
          </div>

          {campaignsLoading || isRefreshingCampaigns ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border-b pb-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeCampaigns && activeCampaigns.length > 0 ? (
            <div className="space-y-4">
              {activeCampaigns.slice(0, 3).map((campaign) => (
                <Link href={`/dashboard/finance/campaigns/${campaign.id}`} key={campaign.id}>
                  <div className="flex gap-4 border-b pb-4 hover:bg-gray-50 transition-colors rounded p-2 cursor-pointer">
                    <div className="text-black bg-green-100 p-2 rounded text-center min-w-[60px]">
                      <div className="text-sm font-bold">{formatDate(campaign.end_date).split(" ")[0]}</div>
                      <div className="text-xl font-bold">{formatDate(campaign.end_date).split(" ")[1]}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{campaign.title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(Number(campaign.current_amount))} of{" "}
                        {formatCurrency(Number(campaign.target_amount))}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No active campaigns found</p>
              <Button variant="outline" className="mt-2 hover:bg-gray-100" asChild>
                <Link href="/dashboard/finance/campaigns">Create Campaign</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
