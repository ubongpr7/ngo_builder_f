// Finance-specific chart helper functions
export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

export function donationStatusToChartData(statusCounts: Record<string, number>) {
  const statusColors: Record<string, string> = {
    completed: "#10b981",
    pending: "#f59e0b",
    processing: "#3b82f6",
    failed: "#ef4444",
    refunded: "#6b7280",
    cancelled: "#9ca3af",
  }

  const labels = Object.keys(statusCounts)
  const data = Object.values(statusCounts)
  const colors = labels.map((status) => statusColors[status] || "#6b7280")

  return { labels, data, colors }
}

export function campaignTypeToChartData(typeCounts: Record<string, number>) {
  const typeColors: Record<string, string> = {
    fundraising: "#10b981",
    awareness: "#3b82f6",
    emergency: "#ef4444",
    project: "#f59e0b",
    general: "#6b7280",
  }

  const labels = Object.keys(typeCounts)
  const data = Object.values(typeCounts)
  const colors = labels.map((type) => typeColors[type] || "#6b7280")

  return { labels, data, colors }
}

export function grantStatusToChartData(statusCounts: Record<string, number>) {
  const statusColors: Record<string, string> = {
    active: "#10b981",
    pending: "#f59e0b",
    approved: "#3b82f6",
    completed: "#6b7280",
    rejected: "#ef4444",
    cancelled: "#9ca3af",
  }

  const labels = Object.keys(statusCounts)
  const data = Object.values(statusCounts)
  const colors = labels.map((status) => statusColors[status] || "#6b7280")

  return { labels, data, colors }
}

export function expenseTypeToChartData(typeCounts: Record<string, number>) {
  const typeColors: Record<string, string> = {
    operational: "#10b981",
    administrative: "#3b82f6",
    travel: "#f59e0b",
    equipment: "#8b5cf6",
    supplies: "#06b6d4",
    services: "#84cc16",
    utilities: "#f97316",
    rent: "#ec4899",
    insurance: "#6b7280",
    other: "#9ca3af",
  }

  const labels = Object.keys(typeCounts)
  const data = Object.values(typeCounts)
  const colors = labels.map((type) => typeColors[type] || "#6b7280")

  return { labels, data, colors }
}

export function budgetUtilizationData(budgetStats: any) {
  const totalBudget = Number(budgetStats?.total_budget || 0)
  const spentAmount = Number(budgetStats?.total_spent || 0)
  const remainingAmount = totalBudget - spentAmount

  return {
    labels: ["Spent", "Remaining"],
    data: [spentAmount, remainingAmount],
    colors: ["#ef4444", "#10b981"],
  }
}

export function rankCampaignsByProgress(campaigns: any[]) {
  return campaigns
    .filter((campaign) => campaign.is_active)
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 10)
}

export function calculateDonationGrowth(monthlyTrend: any[]) {
  if (monthlyTrend.length < 2) return 0

  const current = Number(monthlyTrend[monthlyTrend.length - 1]?.total_amount || 0)
  const previous = Number(monthlyTrend[monthlyTrend.length - 2]?.total_amount || 0)

  return previous > 0 ? ((current - previous) / previous) * 100 : 0
}
