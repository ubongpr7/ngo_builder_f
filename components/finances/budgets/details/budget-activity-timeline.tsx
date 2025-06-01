import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  Plus,
  AlertTriangle,
  Users,
  Calendar,
  Activity,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Eye,
} from "lucide-react"
import type { Budget } from "@/types/finance"
import { formatRelativeTime, formatDate } from "@/lib/utils"

interface BudgetActivityTimelineEnhancedProps {
  budget: Budget
}

interface ActivityItem {
  id: string
  type: string
  description: string
  user: string
  timestamp: string
  amount?: string
  category?: string
  status?: string
  metadata?: Record<string, any>
}

// Safe date formatting
const safeFormatRelativeTime = (timestamp: string | null | undefined): string => {
  if (!timestamp) return "Unknown time"
  try {
    return formatRelativeTime(timestamp)
  } catch {
    return "Invalid time"
  }
}

const safeFormatDate = (timestamp: string | null | undefined): string => {
  if (!timestamp) return "Unknown date"
  try {
    return formatDate(timestamp)
  } catch {
    return "Invalid date"
  }
}

export function BudgetActivityTimeline({ budget }: BudgetActivityTimelineEnhancedProps) {
  // Process and enhance activity data
  const processedActivities = processActivities(budget.recent_activity || [])
  const activityStats = calculateActivityStats(processedActivities)
  const groupedActivities = groupActivitiesByDate(processedActivities)

  const getActivityIcon = (type: string) => {
    const iconMap = {
      expense_added: DollarSign,
      funding_allocated: Plus,
      item_updated: FileText,
      approval_granted: CheckCircle,
      budget_created: Calendar,
      user_assigned: Users,
      status_changed: Activity,
      alert_triggered: AlertTriangle,
      report_generated: Download,
      default: Clock,
    }
    const IconComponent = iconMap[type as keyof typeof iconMap] || iconMap.default
    return <IconComponent className="h-4 w-4" />
  }

  const getActivityColor = (type: string) => {
    const colorMap = {
      expense_added: "bg-red-100 text-red-600 border-red-200",
      funding_allocated: "bg-green-100 text-green-600 border-green-200",
      item_updated: "bg-blue-100 text-blue-600 border-blue-200",
      approval_granted: "bg-purple-100 text-purple-600 border-purple-200",
      budget_created: "bg-indigo-100 text-indigo-600 border-indigo-200",
      user_assigned: "bg-orange-100 text-orange-600 border-orange-200",
      status_changed: "bg-yellow-100 text-yellow-600 border-yellow-200",
      alert_triggered: "bg-red-100 text-red-600 border-red-200",
      report_generated: "bg-gray-100 text-gray-600 border-gray-200",
      default: "bg-gray-100 text-gray-600 border-gray-200",
    }
    return colorMap[type as keyof typeof colorMap] || colorMap.default
  }

  const getActivityPriority = (type: string) => {
    const priorityMap = {
      alert_triggered: "high",
      approval_granted: "high",
      expense_added: "medium",
      funding_allocated: "medium",
      item_updated: "low",
      budget_created: "low",
      user_assigned: "low",
      status_changed: "low",
      report_generated: "low",
    }
    return priorityMap[type as keyof typeof priorityMap] || "low"
  }

  const getUserInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getImpactIndicator = (activity: ActivityItem) => {
    if (activity.amount) {
      const amount = Number.parseFloat(activity.amount.replace(/[^0-9.-]+/g, ""))
      if (amount > 10000) return <TrendingUp className="h-3 w-3 text-red-500" />
      if (amount > 1000) return <TrendingUp className="h-3 w-3 text-orange-500" />
      return <TrendingUp className="h-3 w-3 text-green-500" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Activity Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Recent budget activities and changes • {processedActivities.length} total activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Activities",
            value: activityStats.total,
            icon: Activity,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "High Priority",
            value: activityStats.highPriority,
            icon: AlertTriangle,
            color: "bg-red-100 text-red-600",
          },
          {
            label: "Financial Impact",
            value: activityStats.withAmount,
            icon: DollarSign,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Recent (24h)",
            value: activityStats.recent24h,
            icon: Clock,
            color: "bg-purple-100 text-purple-600",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Timeline */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="grouped">Grouped by Date</TabsTrigger>
          <TabsTrigger value="summary">Activity Summary</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedActivities.length > 0 ? (
                <div className="space-y-4">
                  {processedActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* Activity Icon */}
                      <div className={`p-2 rounded-full border ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            {activity.category && (
                              <p className="text-xs text-muted-foreground">Category: {activity.category}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getImpactIndicator(activity)}
                            <Badge
                              variant={
                                getActivityPriority(activity.type) === "high"
                                  ? "destructive"
                                  : getActivityPriority(activity.type) === "medium"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {activity.type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        {/* Activity Metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">{getUserInitials(activity.user)}</AvatarFallback>
                            </Avatar>
                            <span>{activity.user}</span>
                          </div>

                          <span>{safeFormatRelativeTime(activity.timestamp)}</span>

                          {activity.amount && <span className="font-medium text-green-600">{activity.amount}</span>}

                          {activity.status && (
                            <Badge variant="outline" className="text-xs">
                              {activity.status}
                            </Badge>
                          )}
                        </div>

                        {/* Additional Details */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="pt-2 border-t">
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No recent activity</p>
                  <p className="text-sm">Budget activities will appear here as they occur</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grouped by Date View */}
        <TabsContent value="grouped" className="space-y-4">
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  {date}
                  <Badge variant="secondary" className="ml-auto">
                    {activities.length} activities
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`p-1.5 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{safeFormatRelativeTime(activity.timestamp)}</span>
                          {activity.amount && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-green-600">{activity.amount}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Activity Summary */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Types Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Activity Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getActivityTypeSummary(processedActivities).map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getActivityColor(type.type)}`}>
                          {getActivityIcon(type.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{type.count}</p>
                        <p className="text-xs text-muted-foreground">{type.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUserActivitySummary(processedActivities).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">{getUserInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">Last active {user.lastActive}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{user.activityCount}</p>
                        <p className="text-xs text-muted-foreground">activities</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function processActivities(activities: any[]): ActivityItem[] {
  return activities.map((activity, index) => ({
    id: activity.id || `activity-${index}`,
    type: activity.type || "default",
    description: activity.description || "No description available",
    user: activity.user || "Unknown User",
    timestamp: activity.timestamp || new Date().toISOString(),
    amount: activity.amount,
    category: activity.category,
    status: activity.status,
    metadata: activity.metadata || {},
  }))
}

function calculateActivityStats(activities: ActivityItem[]) {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return {
    total: activities.length,
    highPriority: activities.filter((a) => ["alert_triggered", "approval_granted"].includes(a.type)).length,
    withAmount: activities.filter((a) => a.amount).length,
    recent24h: activities.filter((a) => {
      try {
        return new Date(a.timestamp) > yesterday
      } catch {
        return false
      }
    }).length,
  }
}

function groupActivitiesByDate(activities: ActivityItem[]) {
  return activities.reduce((groups: Record<string, ActivityItem[]>, activity) => {
    const date = safeFormatDate(activity.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {})
}

function getActivityTypeSummary(activities: ActivityItem[]) {
  const typeCounts = activities.reduce((counts: Record<string, number>, activity) => {
    counts[activity.type] = (counts[activity.type] || 0) + 1
    return counts
  }, {})

  const total = activities.length || 1

  return Object.entries(typeCounts).map(([type, count]) => ({
    type,
    label: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    description: getActivityTypeDescription(type),
    count,
    percentage: Math.round((count / total) * 100),
  }))
}

function getUserActivitySummary(activities: ActivityItem[]) {
  const userCounts = activities.reduce((counts: Record<string, { count: number; lastActive: string }>, activity) => {
    if (!counts[activity.user]) {
      counts[activity.user] = { count: 0, lastActive: activity.timestamp }
    }
    counts[activity.user].count++
    if (new Date(activity.timestamp) > new Date(counts[activity.user].lastActive)) {
      counts[activity.user].lastActive = activity.timestamp
    }
    return counts
  }, {})

  return Object.entries(userCounts).map(([name, data]) => ({
    name,
    activityCount: data.count,
    lastActive: safeFormatRelativeTime(data.lastActive),
  }))
}

function getActivityTypeDescription(type: string): string {
  const descriptions = {
    expense_added: "New expenses recorded",
    funding_allocated: "Funding sources assigned",
    item_updated: "Budget items modified",
    approval_granted: "Approvals processed",
    budget_created: "Budget initialization",
    user_assigned: "User assignments",
    status_changed: "Status updates",
    alert_triggered: "System alerts",
    report_generated: "Reports created",
  }
  return descriptions[type as keyof typeof descriptions] || "General activity"
}
