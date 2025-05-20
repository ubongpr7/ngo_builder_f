"use client"

import { DashboardCard } from "@/components/ui/dashboard-card"
import { FileText, DollarSign, CheckCircle, AlertTriangle, ClipboardCheck, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useGetAllProjectsQuery, useGetProjectStatisticsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetMilestoneStatisticsQuery } from "@/redux/features/projects/milestoneApiSlice"
import { useGetExpenseStatisticsQuery } from "@/redux/features/projects/expenseApiSlice"
import { useGetRecentUpdatesQuery } from "@/redux/features/projects/updateApiSlice"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import type { Project } from "@/types/project"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "@/components/permissionHander"
import { Badge } from "@/components/ui/badge"
import { AnalyticsSection } from "@/components/dashboard/analytics-section"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DashboardPage() {
  const {
    data: projectStatistics,
    isLoading: statsLoading,
    refetch: refreshStats,
    isFetching: isRefreshingStats,
  } = useGetProjectStatisticsQuery()

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

  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  const projects = projectsData as Project[]
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshStats(), refreshProjects(), refreshMilestones(), refreshExpenses(), refreshUpdates()])
    setIsRefreshing(false)
  }

  // Set up auto-refresh for real-time data
  useEffect(() => {
    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      refreshAllData()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
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
                {isAnyDataRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh all dashboard data</p>
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
              value: Math.round(Number(projectStats.submitted)/Number(projectStats.total) * 100),
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

        {/* Expenses Card */}
        <DashboardCard
          title="Expenses"
          value={expensesLoading ? "—" : formatCurrency(Number(expenseStats?.total_expenses?.total) || 0)}
          description={`${formatCurrency(Number(expenseStats?.total_expenses?.pending) || 0)} pending approval`}
          icon={<AlertTriangle className="h-4 w-4 text-black" />}
          trend={{
            value: calculateProcessedExpensesPercentage(),
            isPositive: true,
            label: "processed",
          }}
          isLoading={expensesLoading || isRefreshingExpenses}
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

      {/* Project Proposals Section - Only visible to admins */}
      {is_DB_admin && projectStats.submitted > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Project Proposals</h2>
            <Link href="/dashboard/projects?status=submitted" className="text-sm text-purple-600 hover:underline">
              View all proposals
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="space-y-4">
              {projectsLoading || isRefreshingProjects ? (
                <div className="space-y-4">
                  {[1, 2, 3]?.map((i) => (
                    <div key={i} className="flex gap-4 border-b pb-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                projects
                  .filter((project) => project.status === "submitted")
                  .slice(0, 3)
                  ?.map((project) => (
                    <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                      <div className="flex justify-between items-center border-b pb-4 hover:bg-gray-50 transition-colors rounded p-2 cursor-pointer">
                        <div className="flex gap-4">
                          <div className="text-black bg-purple-100 p-2 rounded text-center min-w-[60px]">
                            <div className="text-sm font-bold">
                              {formatDate(project.created_at || project.start_date).split(" ")[0]}
                            </div>
                            <div className="text-xl font-bold">
                              {formatDate(project.created_at || project.start_date).split(" ")[1]}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-sm text-gray-600">
                              Proposed by: {project.manager_details?.first_name} {project.manager_details?.last_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor("submitted")}>Submitted</Badge>
                      </div>
                    </Link>
                  ))
              )}

              {!projectsLoading &&
                !isRefreshingProjects &&
                projects.filter((project) => project.status === "submitted")?.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No project proposals awaiting review</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Project Updates */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Recent Updates</h2>
              {isRefreshingUpdates && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
            </div>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              View all projects
            </Link>
          </div>

          {updatesLoading || isRefreshingUpdates ? (
            <div className="space-y-4">
              {[1, 2, 3]?.map((i) => (
                <div key={i} className="border-b pb-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : recentUpdates && recentUpdates?.length > 0 ? (
            <div className="space-y-4">
              {recentUpdates.slice(0, 3)?.map((update) => (
                <Link href={`/dashboard/projects/${update.project_id}`} key={update.id}>
                  <div className="border-b pb-4 hover:bg-gray-50 transition-colors rounded p-2 cursor-pointer">
                    <h3 className="font-medium">{update.project_details?.title || "Project Update"}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{update.summary}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        By {update.submitted_by_details?.first_name || "User"}{" "}
                        {update.submitted_by_details?.last_name || ""}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(update.date || "")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent updates found</p>
              <Button variant="outline" className="mt-2 hover:bg-gray-100" asChild>
                <Link href="/dashboard/projects">Add Project Update</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Upcoming Milestones</h2>
              {isRefreshingMilestones && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
            </div>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              View all milestones
            </Link>
          </div>

          {milestonesLoading || isRefreshingMilestones ? (
            <div className="space-y-4">
              {[1, 2, 3]?.map((i) => (
                <div key={i} className="flex gap-4 border-b pb-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects ? (
            <div className="space-y-4">
              {projects
                .filter((project) => project.status !== "submitted" && project.status !== "cancelled")
                .slice(0, 3)
                ?.map((project) => (
                  <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                    <div className="flex gap-4 border-b pb-4 hover:bg-gray-50 transition-colors rounded p-2 cursor-pointer">
                      <div className="text-black bg-[#FDD65B] p-2 rounded text-center min-w-[60px]">
                        <div className="text-sm font-bold">{formatDate(project.target_end_date).split(" ")[0]}</div>
                        <div className="text-xl font-bold">{formatDate(project.target_end_date).split(" ")[1]}</div>
                      </div>
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          {project.days_remaining > 0 ? `${project.days_remaining} days remaining` : "Due today"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming milestones found</p>
              <Button variant="outline" className="mt-2 hover:bg-gray-100" asChild>
                <Link href="/dashboard/projects">Add Project</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
