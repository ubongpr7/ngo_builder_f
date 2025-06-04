"use client"

import { DashboardCard } from "@/components/ui/dashboard-card"
import { FileText, DollarSign, CheckCircle, ClipboardCheck, RefreshCw } from "lucide-react"
import { useGetAllProjectsQuery, useGetProjectStatisticsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetMilestoneStatisticsQuery } from "@/redux/features/projects/milestoneApiSlice"
import { useGetExpenseStatisticsQuery } from "@/redux/features/projects/expenseApiSlice"
import { useGetRecentUpdatesQuery } from "@/redux/features/projects/updateApiSlice"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"
import type { Project } from "@/types/project"
import { usePermissions } from "@/components/permissionHander"
import { AnalyticsSection } from "@/components/dashboard/analytics-section"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProjectDashboardProps {
  userRoles?: any
  className?: string
}

export function ProjectDashboard({ userRoles, className }: ProjectDashboardProps) {
  const {
    data: projectStatistics,
    isLoading: statsLoading,
    refetch: refreshStats,
    isFetching: isRefreshingStats,
  } = useGetProjectStatisticsQuery()
console.log("Project Statistics:", projectStatistics)
  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refreshProjects,
    isFetching: isRefreshingProjects,
  } = useGetAllProjectsQuery("")

  const {
    data: milestoneStats,
    isLoading: milestonesLoading,
    refetch: refreshMilestones,
    isFetching: isRefreshingMilestones,
  } = useGetMilestoneStatisticsQuery()

  const {
    data: expenseStats,
    isLoading: expensesLoading,
    refetch: refreshExpenses,
    isFetching: isRefreshingExpenses,
  } = useGetExpenseStatisticsQuery()

  const {
    data: recentUpdates,
    isLoading: updatesLoading,
    refetch: refreshUpdates,
    isFetching: isRefreshingUpdates,
  } = useGetRecentUpdatesQuery()

  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  const projects = projectsData as Project[]
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshStats(), refreshProjects(), refreshMilestones(), refreshExpenses(), refreshUpdates()])
    setIsRefreshing(false)
  }

  // Calculate project statistics
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    submitted: 0,
    overbudget: 0,
    totalBudget: 0,
    totalSpent: 0,
    averageBudget: 0,
  })

  useEffect(() => {
    if (projects) {
      const active = projects.filter(
        (p) => p.status === "planned" || p.status === "in_progress" || p.status === "active" || p.status === "planning",
      )?.length
      const completed =
        projectStatistics?.status_counts.completed || projects.filter((p) => p.status === "completed")?.length
      const submitted =
        projectStatistics?.status_counts.submitted || projects.filter((p) => p.status === "submitted")?.length
      const overbudget = projects.filter((p) => p.is_overbudget)?.length
      const totalBudget =
        projectStatistics?.budget_stats.total_budget ||
        projects.reduce((sum, p) => {
          if (["cancelled", "submitted", "rejected"].includes(p.status)) {
            return sum
          }
          return Number(sum) + (Number(p.budget) || 0)
        }, 0)
      const totalSpent = projectStatistics?.budget_stats.total_spent || 0

      setProjectStats({
        total: projects?.length,
        active,
        completed,
        submitted,
        overbudget,
        totalBudget,
        totalSpent,
        averageBudget: totalBudget / active,
      })
    }
  }, [projects, projectStatistics])

  const budgetUtilization =
    projectStats.totalBudget > 0 ? (projectStats.totalSpent / projectStats.totalBudget) * 100 : 0

  // Calculate the combined approved and reimbursed expenses percentage
  const calculateProcessedExpensesPercentage = () => {
    if (expensesLoading || !expenseStats?.total_expenses) return 0

    const approved = expenseStats.total_expenses.approved || 0
    const total = expenseStats.total_expenses.total || 1
    return Math.round((approved / total) * 100)
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
      case "planning":
      case "planned":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "on_hold":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      case "submitted":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Check if any data is currently being refreshed
  const isAnyDataRefreshing =
    isRefreshing ||
    isRefreshingStats ||
    isRefreshingProjects ||
    isRefreshingMilestones ||
    isRefreshingExpenses ||
    isRefreshingUpdates

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Management</h2>
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
              <p>Refresh project data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Projects Card */}
        <DashboardCard
          title="Projects"
          value={projectsLoading ? "—" : projectStats.total.toString()}
          description={`${projectStats.active} active`}
          icon={<FileText className="h-4 w-4 text-black" />}
          trend={{
            value: projectStats.completed > 0 ? (projectStats.completed / projectStats.total) * 100 : 0,
            isPositive: true,
            label: "completion rate",
          }}
          isLoading={projectsLoading || isRefreshingProjects}
        />

        {/* Proposals Card - Only visible to admins */}
        {is_DB_admin && projectStats.submitted > 0 && (
          <DashboardCard
            title="Proposals"
            value={projectsLoading ? "—" : projectStats.submitted.toString()}
            description="Awaiting approval"
            icon={<ClipboardCheck className="h-4 w-4 text-purple-600" />}
            trend={{
              value: Math.round((Number(projectStats.submitted) / Number(projectStats.total)) * 100),
              isPositive: true,
              label: "pending review",
            }}
            className="border-l-4 border-purple-500"
            isLoading={projectsLoading || isRefreshingProjects}
          />
        )}

        {/* Milestones Card */}
        <DashboardCard
          title="Milestones"
          value={milestonesLoading ? "—" : milestoneStats?.total_milestones || "0"}
          description={milestonesLoading ? "Loading..." : `${milestoneStats?.overdue_count || 0} overdue`}
          icon={<CheckCircle className="h-4 w-4 text-black" />}
          trend={{
            value: milestonesLoading
              ? 0
              : ((milestoneStats?.status_counts?.find((s) => s.status === "completed")?.count || 0) /
                  (milestoneStats?.total_milestones || 1)) *
                100,
            isPositive: true,
            label: "completed",
          }}
          isLoading={milestonesLoading || isRefreshingMilestones}
        />

        {/* Budget Card */}
        <DashboardCard
          title="Budget"
          value={projectsLoading ? "—" : formatCurrency(projectStats.totalBudget)}
          description={`${formatCurrency(projectStats.totalSpent)} spent`}
          icon={<DollarSign className="h-4 w-4 text-black" />}
          trend={{
            value: Number(budgetUtilization.toFixed(2)),
            isPositive: budgetUtilization <= 90,
            label: "utilization",
          }}
          isLoading={projectsLoading || statsLoading || isRefreshingStats || isRefreshingProjects}
        />
      </div>

      {/* Analytics Section */}
      <AnalyticsSection
        projectStatistics={projectStatistics}
        projects={projects || []}
        isLoading={statsLoading || projectsLoading}
        isRefreshing={isRefreshingStats || isRefreshingProjects}
        onRefresh={refreshAllData}
      />
    </div>
  )
}
