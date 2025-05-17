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
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Project } from "@/types/project"

interface AnalyticsSectionProps {
  projectStatistics: any
  projects: Project[]
  isLoading: boolean
  onRefresh: () => void
}

export function AnalyticsSection({ projectStatistics, projects, isLoading, onRefresh }: AnalyticsSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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

  if (!projectStatistics && !isLoading) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Project Analytics</h2>
        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)} className="flex items-center gap-1">
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
      </div>

      {expanded ? (
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusChart
                  statusCounts={projectStatistics?.status_counts || {}}
                  isLoading={isLoading}
                  onRefresh={onRefresh}
                />
                <TypeChart
                  typeCounts={projectStatistics?.type_counts || {}}
                  isLoading={isLoading}
                  onRefresh={onRefresh}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimelineChart
                  timelineStats={projectStatistics?.timeline_stats || {}}
                  isLoading={isLoading}
                  onRefresh={onRefresh}
                />
                <ProjectRanking projects={projects || []} isLoading={isLoading} onRefresh={onRefresh} />
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <div className="grid grid-cols-1 gap-4">
                <BudgetChart
                  budgetStats={projectStatistics?.budget_stats || {}}
                  isLoading={isLoading}
                  onRefresh={onRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 gap-4">
                <CategoryChart
                  categoryCounts={projectStatistics?.category_counts || {}}
                  isLoading={isLoading}
                  onRefresh={onRefresh}
                />
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProjectRanking projects={projects || []} isLoading={isLoading} onRefresh={onRefresh} />
                <TimelineChart
                  timelineStats={projectStatistics?.timeline_stats || {}}
                  isLoading={isLoading}
                  onRefresh={onRefresh}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatusChart
            statusCounts={projectStatistics?.status_counts || {}}
            isLoading={isLoading}
            onRefresh={onRefresh}
          />
          <BudgetChart
            budgetStats={projectStatistics?.budget_stats || {}}
            isLoading={isLoading}
            onRefresh={onRefresh}
          />
          <ProjectRanking projects={projects || []} isLoading={isLoading} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  )
}
