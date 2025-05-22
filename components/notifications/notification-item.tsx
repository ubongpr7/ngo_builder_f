"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  User,
  CreditCard,
  Briefcase,
  Flag,
  CheckSquare,
  PenToolIcon as Tool,
  RefreshCw,
  XCircle,
  UserCheck,
  Star,
} from "lucide-react"
import type { Notification } from "@/redux/features/notifications/notificationsApiSlice"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
  showActions?: boolean
  onMarkAsRead?: (e: React.MouseEvent) => void
}

export function NotificationItem({ notification, onClick, showActions = false, onMarkAsRead }: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get icon based on notification icon name or category
  const getIcon = () => {
    const iconName = notification.icon || "bell"
    const iconSize = "h-5 w-5"
    const iconMap: Record<string, JSX.Element> = {
      bell: <Bell className={iconSize} />,
      "check-circle": <CheckCircle className={iconSize} />,
      "alert-circle": <AlertCircle className={iconSize} />,
      clock: <Clock className={iconSize} />,
      "file-text": <FileText className={iconSize} />,
      user: <User className={iconSize} />,
      "credit-card": <CreditCard className={iconSize} />,
      briefcase: <Briefcase className={iconSize} />,
      flag: <Flag className={iconSize} />,
      "check-square": <CheckSquare className={iconSize} />,
      tool: <Tool className={iconSize} />,
      "refresh-cw": <RefreshCw className={iconSize} />,
      "x-circle": <XCircle className={iconSize} />,
      "user-check": <UserCheck className={iconSize} />,
      star: <Star className={iconSize} />,
    }

    return iconMap[iconName] || <Bell className={iconSize} />
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  return (
    <div
      className={`w-full px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.is_read ? "bg-blue-50/30" : ""
      }`}
      onClick={() => {
        if (onClick) onClick()
        else setIsExpanded(!isExpanded)
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h4 className="font-medium text-sm text-green-700">{notification.title}</h4>

              <p className={`text-sm text-gray-700 ${isExpanded ? "" : "line-clamp-2"}`}>{notification.body}</p>
            </div>

            <div className="flex flex-col items-end ml-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {notification.time_ago || formatDate(notification.created_at)}
              </span>

              {(notification.priority === "high" || notification.priority === "urgent") && (
                <Badge className="mt-1 bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">
                  {notification.priority === "high" ? "High" : "Urgent"} Priority
                </Badge>
              )}
            </div>
          </div>

          {showActions && !notification.is_read && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 p-0 mr-2"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onMarkAsRead) onMarkAsRead(e)
                }}
              >
                Mark as read
              </Button>

              {notification.action_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 p-0"
                >
                  View details
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
