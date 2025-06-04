import type { Project } from "@/types/project"

export function statusToChartData(statusCounts: Record<string, number> = {}) {
  const labels: string[] = []
  const data: number[] = []
  const colors: string[] = []

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

  statusOrder.forEach(status => {
    if (status in statusCounts) {
      labels.push(statusLabels[status] || status.replace(/_/g, " "))
      data.push(statusCounts[status])
      colors.push(colorMap[status] || "#CBD5E1") // default slate-300
    }
  })

  return { labels, data, colors }
}

// Convert type counts to chart data
export function typeToChartData(typeCounts: Record<string, number> = {}) {
  const labels: string[] = []
  const data: number[] = []
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1"]

  const typeLabels: Record<string, string> = {
    profit: "Profit",
    non_profit: "Non-Profit",
    community: "Community",
    internal: "Internal",
  }

  Object.entries(typeCounts).forEach(([type, count]) => {
    labels.push(typeLabels[type] || type.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase()))
    data.push(count)
  })

  return { labels, data, colors }
}

// Convert category counts to chart data
export function categoryToChartData(categoryCounts: Record<string, number> = {}) {
  const labels: string[] = []
  const data: number[] = []
  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#6366F1", "#EC4899", "#8B5CF6",
    "#14B8A6", "#F43F5E", "#0EA5E9", "#84CC16", "#A855F7", "#06B6D4",
  ]

  Object.entries(categoryCounts).forEach(([category, count]) => {
    const label = !category || category.toLowerCase() === "null" ? "Uncategorized" : category
    labels.push(label)
    data.push(count)
  })

  return { labels, data, colors: colors.slice(0, labels.length) }
}

// Convert timeline stats to chart data
export function timelineToChartData(timelineStats: Record<string, number> = {}) {
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
  if (!projects.length) return []

  return [...projects]
    .filter(p => {
      const total = Number(p.milestones_count || 0)
      const completed = Number(p.milestones_completed_count || 0)
      return total > 0 && completed >= 0
    })
    .sort((a, b) => {
      const aTotal = Number(a.milestones_count || 0)
      const aCompleted = Number(a.milestones_completed_count || 0)
      const bTotal = Number(b.milestones_count || 0)
      const bCompleted = Number(b.milestones_completed_count || 0)

      const aPct = aTotal > 0 ? aCompleted / aTotal : 0
      const bPct = bTotal > 0 ? bCompleted / bTotal : 0

      if (bPct !== aPct) return bPct - aPct
      return bCompleted - aCompleted
    })
    .slice(0, 10)
}

// Format budget stats to chart data
export function formatBudgetData(budgetStats: Record<string, number> = {}) {
  const allocated = Number(budgetStats.total_allocated || 0)
  const spent = Number(budgetStats.total_spent || 0)
  const total = Number(budgetStats.total_budget || 0)
  const remaining = total - spent

  return {
    labels: ["Allocated", "Spent", "Remaining"],
    data: [allocated, spent, remaining],
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
  }
}

// Format currency into K/M/B suffix
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

// Interfaces
interface DataItem {
  [key: string]: string | number | null
}

interface DataTransformerInterface {
  arrayData: DataItem[]
  interest: string
}

const interestKeyMap: Record<string, string> = {
  status: "status",
  type: "type",
  category: "category_name",
  timeline: "timeline", // or adapt if needed
}

// Main transformation function
export function transformChartData({ arrayData, interest }: DataTransformerInterface) {
  const transformed: Record<string, number> = {}
  const keyName = interestKeyMap[interest]

  if (!keyName) {
    throw new Error(`Unsupported interest type: ${interest}`)
  }

  arrayData.forEach(item => {
    const key = item[keyName]
    const count = item["count"]

    if (typeof key === "string" && typeof count === "number") {
      transformed[key] = count
    }
  })

  switch (interest) {
    case "status":
      return statusToChartData(transformed)
    case "type":
      return typeToChartData(transformed)
    case "category":
      return categoryToChartData(transformed)
    case "timeline":
      return timelineToChartData(transformed)
    default:
      throw new Error(`Unknown interest: ${interest}`)
  }
}
