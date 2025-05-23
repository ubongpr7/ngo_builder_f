"use client"

import { useState, useEffect } from "react"
import { DonationChart } from "./donation-chart"
import { CampaignChart } from "./campaign-chart"
import { GrantChart } from "./grant-chart"
import { BudgetUtilizationChart } from "./budget-utilization-chart"
import { ExpenseChart } from "./expense-chart"
import { RevenueChart } from "./revenue-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, RefreshCw, DollarSign, TrendingUp, PieChart, BarChart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FinanceAnalyticsSectionProps {
  donationStats: any
  campaignStats: any
  grantStats: any
  budgetStats: any
  expenseStats: any
  isLoading: boolean
  isRefreshing?: boolean
  onRefresh: () => void
}

export function FinanceAnalyticsSection({
  donationStats,
  campaignStats,
  grantStats,
  budgetStats,
  expenseStats,
  isLoading,
  isRefreshing = false,
  onRefresh,
}: FinanceAnalyticsSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [animateRefresh, setAnimateRefresh] = useState(false)

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpanded(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle refresh with animation
  const handleRefresh = () => {
    setAnimateRefresh(true)
    onRefresh()

    // Reset animation after a delay
    setTimeout(() => {
      setAnimateRefresh(false)
    }, 1000)
  }

  if (!donationStats && !campaignStats && !grantStats && !isLoading) {
    return null
  }

  const tabIcons = {
    overview: <BarChart className="h-4 w-4 mr-2" />,
    revenue: <DollarSign className="h-4 w-4 mr-2" />,
    expenses: <PieChart className="h-4 w-4 mr-2" />,
    performance: <TrendingUp className="h-4 w-4 mr-2" />,
  }

  return (
    <Card className={cn("p-6 mb-8 shadow-md transition-all duration-300", expanded ? "shadow-lg" : "hover:shadow-lg")}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Finance Analytics</h2>
          {(isRefreshing || animateRefresh) && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="transition-all duration-200 hover:bg-gray-100"
                >
                  <RefreshCw className={cn("h-4 w-4", (isRefreshing || animateRefresh) && "animate-spin")} />
                  <span className="sr-only">Refresh Analytics</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh analytics data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 transition-all duration-200 hover:bg-gray-100"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{expanded ? "Collapse analytics" : "Expand analytics"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-4">
              <TabsTrigger value="overview" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.overview}
                Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.revenue}
                Revenue
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.expenses}
                Expenses
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.performance}
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DonationChart
                  donationStats={donationStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <CampaignChart
                  campaignStats={campaignStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GrantChart
                  grantStats={grantStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <BudgetUtilizationChart
                  budgetStats={budgetStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <RevenueChart
                  donationStats={donationStats || {}}
                  grantStats={grantStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <ExpenseChart
                  expenseStats={expenseStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampaignChart
                  campaignStats={campaignStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <GrantChart
                  grantStats={grantStats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in-50 duration-300">
          <DonationChart
            donationStats={donationStats || {}}
            isLoading={isLoading || isRefreshing}
            onRefresh={handleRefresh}
          />
          <BudgetUtilizationChart
            budgetStats={budgetStats || {}}
            isLoading={isLoading || isRefreshing}
            onRefresh={handleRefresh}
          />
          <ExpenseChart
            expenseStats={expenseStats || {}}
            isLoading={isLoading || isRefreshing}
            onRefresh={handleRefresh}
          />
        </div>
      )}
    </Card>
  )
}
