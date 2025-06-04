import type { Project } from "@/types/project"

// Your existing function
export function statusToChartData(statusCounts: Record<string, number> = {}) {
  const labels = []
  const data = []
  const colors = []

  const colorMap: Record<string, string> = {
    active: "#10B981",       // green
    planning: "#3B82F6",     // blue
    planned: "#3B82F6",      // blue
    in_progress: "#6366F1",  // indigo
    on_hold: "#F59E0B",      // amber
    completed: "#6B7280",    // gray
    cancelled: "#EF4444",    // red
    submitted: "#8B5CF6",    // purple
  }

  const statusOrder = ["submitted", "planning", "planned", "active", "in_progress", "on_hold", "completed", "cancelled"]

  const statusLabels: Record<string, string> = {
    active: "Active",
    planning: "Planning",
    planned: "Planned",
    in_progress: "In Progress",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    submitted: "Submitted",
  }

  statusOrder.forEach((status) => {
    if (status in statusCounts) {
      labels.push(statusLabels[status] || status.replace(/_/g, " "))
      data.push(statusCounts[status])
      colors.push(colorMap[status] || "#CBD5E1") // Default to slate-300
    }
  })

  return { labels, data, colors }
}

// 🆕 Convert array format to expected object
export function transformStatusCounts(arrayData: { status: string; count: number }[]) {
  const transformed: Record<string, number> = {}
  arrayData.forEach(({ status, count }) => {
    transformed[status] = count
  })
  return statusToChartData(transformed)
}

// Convert type counts to chart data
export function typeToChartData(typeCounts: Record<string, number> = {}) {
  const labels = []
  const data = []
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1"]

  // Format type labels for display
  const typeLabels: Record<string, string> = {
    profit: "Profit",
    non_profit: "Non-Profit",
    community: "Community",
    internal: "Internal",
  }

  Object.entries(typeCounts).forEach(([type, count], index) => {
    labels.push(typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "))
    data.push(count)
  })

  return { labels, data, colors }
}

// Convert category counts to chart data
export function categoryToChartData(categoryCounts: Record<string, number> = {}) {
  const labels = []
  const data = []
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#6366F1",
    "#EC4899",
    "#8B5CF6",
    "#14B8A6",
    "#F43F5E",
    "#0EA5E9",
    "#84CC16",
    "#A855F7",
    "#06B6D4",
  ]

  Object.entries(categoryCounts).forEach(([category, count], index) => {
    // Handle null category
    const label = category === "null" || !category ? "Uncategorized" : category
    labels.push(label)
    data.push(count)
  })

  return { labels, data, colors: colors.slice(0, labels?.length) }
}

// Convert timeline stats to chart data
export function timelineToChartData(timelineStats: any = {}) {
  return {
    labels: ["On Time", "Delayed"],
    data: [
      timelineStats.completed_on_time || 0,
      (timelineStats.delayed_projects || 0) + (timelineStats.completed_late || 0),
    ],
    colors: ["#10B981", "#EF4444"],
  }
}

// Rank projects by milestone completion

export function rankProjectsByMilestones(projects: Project[] = []): Project[] {
  if (!projects?.length) return []

  return [...projects]
    .filter(p => {
      const milestonesCount = Number(p.milestones_count || 0)
      const completedCount = Number(p.milestones_completed_count || 0)
      return milestonesCount > 0 && completedCount >= 0
    })
    .sort((a, b) => {
      const aTotal = Number(a.milestones_count || 0)
      const aCompleted = Number(a.milestones_completed_count || 0)
      const bTotal = Number(b.milestones_count || 0)
      const bCompleted = Number(b.milestones_completed_count || 0)

      // Calculate completion percentages safely
      const aPercentage = aTotal > 0 ? (aCompleted / aTotal) : 0
      const bPercentage = bTotal > 0 ? (bCompleted / bTotal) : 0

      // Primary sort by percentage completion (descending)
      if (bPercentage !== aPercentage) {
        return bPercentage - aPercentage
      }
      
      // Secondary sort by total completed milestones (descending)
      return bCompleted - aCompleted
    })
    .slice(0, 10)
}


// Format budget data for chart
export function formatBudgetData(budgetStats: any = {}) {
  return {
    labels: ["Allocated", "Spent", "Remaining"],
    data: [
      Number(budgetStats.total_allocated || 0),
      Number(budgetStats.total_spent || 0),
      Number(budgetStats.total_budget || 0) - Number(budgetStats.total_spent || 0),
    ],
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
  }
}

// Format currency with K/M/B suffixes
export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}
