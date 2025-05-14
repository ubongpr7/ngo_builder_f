"use client"

import { DashboardCard } from "@/components/ui/dashboard-card"
import { FileText, DollarSign, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useGetAllProjectsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetMilestoneStatisticsQuery } from "@/redux/features/projects/milestoneApiSlice"
import { useGetExpenseStatisticsQuery } from "@/redux/features/projects/expenseApiSlice"
import { useGetRecentUpdatesQuery } from "@/redux/features/projects/updateApiSlice"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import type { Project } from "@/types/project"

export default function DashboardPage() {
  // Fetch data from our API endpoints
  const { data: projectsData, isLoading: projectsLoading } = useGetAllProjectsQuery("")
  const { data: milestoneStats, isLoading: milestonesLoading } = useGetMilestoneStatisticsQuery()
  const { data: expenseStats, isLoading: expensesLoading } = useGetExpenseStatisticsQuery()
  const { data: recentUpdates, isLoading: updatesLoading } = useGetRecentUpdatesQuery()
  const projects = projectsData as Project[]

  // Calculate project statistics
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    overbudget: 0,
    totalBudget: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    if (projects) {
      const active = projects.filter((p) => p.status === "planned" || p.status === "in_progress").length
      const completed = projects.filter((p) => p.status === "completed").length
      const overbudget = projects.filter((p) => p.is_overbudget).length
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
      const totalSpent = projects.reduce((sum, p) => sum + (p.funds_spent || 0), 0)

      setProjectStats({
        total: projects.length,
        active,
        completed,
        overbudget,
        totalBudget,
        totalSpent,
      })
    }
  }, [projects])

  const budgetUtilization =
    projectStats.totalBudget > 0 ? (projectStats.totalSpent / projectStats.totalBudget) * 100 : 0

  // Calculate the combined approved and reimbursed expenses percentage
  const calculateProcessedExpensesPercentage = () => {
    if (expensesLoading || !expenseStats?.total_expenses) return 0

    const approved = expenseStats.total_expenses.approved || 0
    const total = expenseStats.total_expenses.total || 1 
    return Math.round(((approved) / total) * 100)
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Project Management Dashboard</h1>

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
        />

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
        />

        {/* Budget Card */}
        <DashboardCard
          title="Budget"
          value={projectsLoading ? "—" : formatCurrency(projectStats.totalBudget)}
          description={`${formatCurrency(projectStats.totalSpent)} spent`}
          icon={<DollarSign className="h-4 w-4 text-black" />}
          trend={{
            value: budgetUtilization,
            isPositive: budgetUtilization <= 90,
            label: "utilization",
          }}
        />

        {/* Expenses Card */}
        <DashboardCard
          title="Expenses"
          value={expensesLoading ? "—" : expenseStats?.total_expenses?.total.toString() || "0"}
          description={`${expenseStats?.total_expenses?.pending || 0} pending approval`}
          icon={<AlertTriangle className="h-4 w-4 text-black" />}
          trend={{
            value: calculateProcessedExpensesPercentage(),
            isPositive: true,
            label: "processed",
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Project Updates */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Updates</h2>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              View all projects
            </Link>
          </div>

          {updatesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : recentUpdates && recentUpdates.length > 0 ? (
            <div className="space-y-4">
              {recentUpdates.slice(0, 3).map((update) => (
                <div key={update.id} className="border-b pb-4">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent updates found</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/dashboard/projects">Add Project Update</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Upcoming Milestones</h2>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              View all milestones
            </Link>
          </div>

          {milestonesLoading ? (
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
          ) : projects ? (
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                  <div className="flex gap-4 border-b pb-4 hover:bg-gray-50 transition-colors rounded p-2">
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
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/dashboard/projects">Add Project</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
