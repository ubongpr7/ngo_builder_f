"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info, XCircle, Bell, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AlertsPanelProps {
  data: any[]
  isLoading?: boolean
  onDismissAlert?: (alertId: string) => void
}

export function AlertsPanel({ data, isLoading, onDismissAlert }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "success":
        return "border-green-200 bg-green-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const criticalAlerts = data?.filter((alert) => alert.priority === "high") || []
  const totalAlerts = data?.length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              System Alerts
              {totalAlerts > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalAlerts}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Important notifications and system status updates</CardDescription>
          </div>
          {criticalAlerts.length > 0 && <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.slice(0, 6).map((alert, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${getAlertColor(alert.type)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{alert.message}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                {onDismissAlert && (
                  <Button variant="ghost" size="sm" onClick={() => onDismissAlert(alert.id)} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalAlerts === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <div className="text-sm">All systems operational</div>
            <div className="text-xs text-gray-400">No alerts at this time</div>
          </div>
        )}

        {totalAlerts > 6 && (
          <div className="mt-4 pt-4 border-t text-center">
            <Button variant="outline" size="sm">
              View All {totalAlerts} Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
