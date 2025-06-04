// ProjectDashboard.tsx
"use client"

import { DashboardCard } from "@/components/ui/dashboard-card"
import { FileText, DollarSign, CheckCircle, ClipboardCheck, RefreshCw } from "lucide-react"
import { useGetAllProjectsQuery, useGetProjectStatisticsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetMilestoneStatisticsQuery } from "@/redux/features/projects/milestoneApiSlice"
import { useGetExpenseStatisticsQuery } from "@/redux/features/projects/expenseApiSlice"
import { useGetRecentUpdatesQuery } from "@/redux/features/projects/updateApiSlice"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency-utils" // Updated import
import { useState, useEffect, useMemo } from "react"
import type { Project } from "@/types/project"
import { usePermissions } from "@/components/permissionHander"
import { AnalyticsSection } from "@/components/dashboard/analytics-section"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface ProjectDashboardProps {
  userRoles?: any
  className?: string
}

export function ProjectDashboard({ userRoles, className }: ProjectDashboardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
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

  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  const projects = projectsData as Project[]
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get available currencies
  const availableCurrencies = useMemo(() => {
    if (!projectStatistics?.currencies) return [];
    return Object.values(projectStatistics.currencies).map(c => ({
      code: c.summary.currency_code,
      name: c.summary.currency_name
    }));
  }, [projectStatistics]);

  // Auto-select first currency if none selected
  useEffect(() => {
    if (availableCurrencies.length > 0 && !availableCurrencies.some(c => c.code === selectedCurrency)) {
      setSelectedCurrency(availableCurrencies[0].code);
    }
  }, [availableCurrencies, selectedCurrency]);

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
    if (projects && projectStatistics) {
      const active = projects.filter(
        (p) => p.status === "planned" || p.status === "in_progress" || p.status === "active" || p.status === "planning",
      )?.length;
      
      const completed = projects.filter((p) => p.status === "completed")?.length;
      const submitted = projects.filter((p) => p.status === "submitted")?.length;
      const overbudget = projects.filter((p) => p.is_overbudget)?.length;
      
      // Find the selected currency stats
      const currencyStats = Object.values(projectStatistics.currencies).find(
        c => c.summary.currency_code === selectedCurrency
      );
      
      const totalBudget = currencyStats?.summary.total_budget || 0;
      const totalSpent = currencyStats?.summary.total_spent || 0;

      setProjectStats({
        total: projects?.length,
        active,
        completed,
        submitted,
        overbudget,
        totalBudget,
        totalSpent,
        averageBudget: currencyStats?.summary.avg_budget || 0,
      })
    }
  }, [projects, projectStatistics, selectedCurrency])

  const budgetUtilization = projectStats.totalBudget > 0 
    ? (projectStats.totalSpent / projectStats.totalBudget) * 100 
    : 0;

  // Function to refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshStats(), refreshProjects(), refreshMilestones(), refreshExpenses(), refreshUpdates()])
    setIsRefreshing(false)
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
        <div className="flex items-center gap-2">
          {/* Currency selector */}
          {availableCurrencies.length > 0 && (
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
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
          value={projectsLoading ? "—" : formatCurrency(selectedCurrency, projectStats.totalBudget)}
          description={`${formatCurrency(selectedCurrency, projectStats.totalSpent)} spent`}
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
        selectedCurrency={selectedCurrency}
        projects={projects || []}
        isLoading={statsLoading || projectsLoading}
        isRefreshing={isRefreshingStats || isRefreshingProjects}
        onRefresh={refreshAllData}
      />
    </div>
  )
}