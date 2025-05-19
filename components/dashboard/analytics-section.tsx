"use client"

import { useState, useEffect } from "react"
import { StatusChart } from "./status-chart"
import { TypeChart } from "./type-chart"
import { BudgetChart } from "./budget-chart"
import { TimelineChart } from "./timeline-chart"
import { CategoryChart } from "./category-chart"
import { ProjectRanking } from "./project-ranking"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, RefreshCw, BarChart, PieChart, LineChart, TrendingUp } from "lucide-react"
import type { Project } from "@/types/project"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnalyticsSectionProps {
  projectStatistics: any
  projects: Project[]
  isLoading: boolean
  isRefreshing?: boolean
  onRefresh: () => void
}

export function AnalyticsSection({
  projectStatistics,
  projects,
  isLoading,
  isRefreshing = false,
  onRefresh,
}: AnalyticsSectionProps) {
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

  if (!projectStatistics && !isLoading) {
    return null
  }

  const tabIcons = {
    overview: <BarChart className="h-4 w-4 mr-2" />,
    budget: <PieChart className="h-4 w-4 mr-2" />,
    categories: <LineChart className="h-4 w-4 mr-2" />,
    performance: <TrendingUp className="h-4 w-4 mr-2" />,
  }

  return (
    <Card className={cn("p-6 mb-8 shadow-md transition-all duration-300", expanded ? "shadow-lg" : "hover:shadow-lg")}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Project Analytics</h2>
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
              <TabsTrigger value="budget" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.budget}
                Budget
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.categories}
                Categories
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center justify-center transition-all duration-200">
                {tabIcons.performance}
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusChart
                  statusCounts={projectStatistics?.status_counts || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <TypeChart
                  typeCounts={projectStatistics?.type_counts || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimelineChart
                  timelineStats={projectStatistics?.timeline_stats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <ProjectRanking
                  projects={projects || []}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="budget" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <BudgetChart
                  budgetStats={projectStatistics?.budget_stats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="categories" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <CategoryChart
                  categoryCounts={projectStatistics?.category_counts || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProjectRanking
                  projects={projects || []}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <TimelineChart
                  timelineStats={projectStatistics?.timeline_stats || {}}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in-50 duration-300">
          <StatusChart
            statusCounts={projectStatistics?.status_counts || {}}
            isLoading={isLoading || isRefreshing}
            onRefresh={handleRefresh}
          />
          <BudgetChart
            budgetStats={projectStatistics?.budget_stats || {}}
            isLoading={isLoading || isRefreshing}
            onRefresh={handleRefresh}
          />
          <ProjectRanking projects={projects || []} isLoading={isLoading || isRefreshing} onRefresh={handleRefresh} />
        </div>
      )}
    </Card>
  )
}
