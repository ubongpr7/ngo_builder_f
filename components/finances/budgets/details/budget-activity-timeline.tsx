"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, DollarSign, FileText, CheckCircle, Plus } from "lucide-react"
import type { Budget } from "@/types/finance"
import { formatRelativeTime } from "@/lib/utils"

interface BudgetActivityTimelineProps {
  budget: Budget
}

export function BudgetActivityTimeline({ budget }: BudgetActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "expense_added":
        return <DollarSign className="h-4 w-4" />
      case "funding_allocated":
        return <Plus className="h-4 w-4" />
      case "item_updated":
        return <FileText className="h-4 w-4" />
      case "approval_granted":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "expense_added":
        return "bg-red-100 text-red-600"
      case "funding_allocated":
        return "bg-green-100 text-green-600"
      case "item_updated":
        return "bg-blue-100 text-blue-600"
      case "approval_granted":
        return "bg-purple-100 text-purple-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {budget.recent_activity && budget.recent_activity.length > 0 ? (
          <div className="space-y-4">
            {budget.recent_activity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">{getUserInitials(activity.user)}</AvatarFallback>
                      </Avatar>
                      <span>{activity.user}</span>
                    </div>

                    <span>{formatRelativeTime(activity.timestamp)}</span>

                    {activity.amount && <span className="font-medium">{activity.amount}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
