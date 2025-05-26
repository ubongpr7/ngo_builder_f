"use client"

import { useState, useEffect } from "react"
import {
  useGetFinancialOverviewQuery,
  useGetDonationAnalyticsQuery,
  useGetBudgetPerformanceQuery,
  useGetGrantPipelineQuery,
  useGetCashFlowForecastQuery,
  useGetCampaignPerformanceQuery,
} from "@/redux/features/finance/dashboard"

export function useDashboardData(filters: any) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Fetch all dashboard data
  const overviewQuery = useGetFinancialOverviewQuery(filters)
  const donationAnalyticsQuery = useGetDonationAnalyticsQuery(filters)
  const budgetPerformanceQuery = useGetBudgetPerformanceQuery(filters)
  const grantPipelineQuery = useGetGrantPipelineQuery(filters)
  const cashFlowQuery = useGetCashFlowForecastQuery(filters)
  const campaignPerformanceQuery = useGetCampaignPerformanceQuery(filters)

  // Combine loading states - should be true if ANY query is loading
  const isLoading =
    overviewQuery.isLoading ||
    overviewQuery.isFetching ||
    donationAnalyticsQuery.isLoading ||
    donationAnalyticsQuery.isFetching ||
    budgetPerformanceQuery.isLoading ||
    budgetPerformanceQuery.isFetching ||
    grantPipelineQuery.isLoading ||
    grantPipelineQuery.isFetching ||
    cashFlowQuery.isLoading ||
    cashFlowQuery.isFetching ||
    campaignPerformanceQuery.isLoading ||
    campaignPerformanceQuery.isFetching

  // Combine error states
  const error =
    overviewQuery.error ||
    donationAnalyticsQuery.error ||
    budgetPerformanceQuery.error ||
    grantPipelineQuery.error ||
    cashFlowQuery.error ||
    campaignPerformanceQuery.error

  // Update last updated timestamp
  useEffect(() => {
    if (!isLoading && !error) {
      setLastUpdated(new Date().toISOString())
    }
  }, [isLoading, error])

  // Refetch all queries
  const refetch = async () => {
    await Promise.all([
      overviewQuery.refetch(),
      donationAnalyticsQuery.refetch(),
      budgetPerformanceQuery.refetch(),
      grantPipelineQuery.refetch(),
      cashFlowQuery.refetch(),
      campaignPerformanceQuery.refetch(),
    ])
  }

  // Combine all data
  const data = {
    overview: overviewQuery.data,
    donationTrends: donationAnalyticsQuery.data,
    budgetUtilization: budgetPerformanceQuery.data,
    grantPipeline: grantPipelineQuery.data,
    cashFlow: cashFlowQuery.data,
    campaignPerformance: campaignPerformanceQuery.data,
    // Mock data for components not yet implemented
    recentTransactions: [],
    topDonors: [],
  }

  return {
    data,
    isLoading,
    error,
    refetch,
    lastUpdated,
  }
}
