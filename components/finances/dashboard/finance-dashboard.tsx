"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Download } from "lucide-react"
import { DashboardFilters } from "./dashboard-filters"
import { KPIGrid } from "./kpi-grid"
import { DonationTrends } from "./charts/donation-trends"
import { CampaignPerformance } from "./charts/campaign-performance"
import { BudgetUtilization } from "./charts/budget-utilization"
import { GrantPipeline } from "./charts/grant-pipeline"
import { CashFlowForecast } from "./charts/cash-flow-forecast"
import { RecentTransactions } from "./charts/recent-transactions"
import { TopDonors } from "./top-donors"
import { AlertsPanel } from "./alerts-panel"
import { useDashboardData } from "@/hooks/use-dashboard-data"

export function FinanceDashboard() {
  const [filters, setFilters] = useState({
    dateRange: "30d",
    currency: "all",
    project: "all",
    department: "all",
  })

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  const { data, isLoading, error, refetch, lastUpdated } = useDashboardData(filters)

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refetch])

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    // Export functionality
    console.log("Exporting dashboard data...")
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get the selected currency data
  const selectedCurrencyData = filters.currency !== "all" ? data?.currencies[filters.currency] : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time overview of your organization's financial health</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
          </Badge>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
{/* Filters 
          <DashboardFilters
            filters={filters}
            onFiltersChange={setFilters}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={setRefreshInterval}
          />
*/}
        </div>
      </div>

      {/* Alerts Panel */}
      <AlertsPanel />

      {/* KPI Grid */}
      <KPIGrid data={selectedCurrencyData?.financial_summary} isLoading={isLoading} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="grants">Grants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonationTrends data={selectedCurrencyData?.daily_trends} isLoading={isLoading} />
            <CashFlowForecast data={selectedCurrencyData?.financial_summary} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BudgetUtilization data={selectedCurrencyData?.budget_utilization_percentage} isLoading={isLoading} />
            </div>
            <RecentTransactions data={selectedCurrencyData?.recent_transactions} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonationTrends data={selectedCurrencyData?.daily_trends} isLoading={isLoading} detailed />
            <TopDonors data={selectedCurrencyData?.top_donors} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignPerformance data={selectedCurrencyData?.campaigns} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetUtilization data={selectedCurrencyData?.budget_utilization_percentage} isLoading={isLoading} detailed />
        </TabsContent>

        <TabsContent value="grants" className="space-y-6">
          <GrantPipeline data={selectedCurrencyData?.grant_pipeline} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
