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
import { cn } from "@/lib/utils"

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
      className={cn(
        "group flex items-start gap-3 p-4 transition-colors",
        "hover:bg-accent/50 cursor-pointer",
        "border-b border-border/60 last:border-b-0",
        !notification.is_read && "bg-accent/30 hover:bg-accent/50",
        isExpanded && "bg-accent/50"
      )}
      onClick={() => {
        onClick?.() || setIsExpanded(!isExpanded)
      }}
    >
      {/* Icon Container */}
      <div className="shrink-0 mt-1">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center",
          "bg-background border-2 border-border",
          "group-hover:border-primary/20 transition-colors",
          !notification.is_read && "border-primary/30"
        )}>
          {getIcon()}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-sm font-medium text-foreground whitespace-nowrap">
            {notification.title}
          </h4>
          <div className="flex items-center gap-2">
            
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary/80" />
            )}
          </div>
        </div>

        {/* Body Text */}
        <p className={cn(
          "text-sm text-muted-foreground",
          "transition-[line-clamp] duration-200 whitespace-nowrap",
          isExpanded ? "line-clamp-none" : "line-clamp-2"
        )}>
          {notification.body.slice(0, 40) + (isExpanded ? "" : "...")}
        </p>

        {/* Priority and Actions */}
        <div className="flex items-center justify-between gap-2">
          

          {notification.priority && (
            <Badge
              variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
              className="px-1.5 py-0.5 text-xs font-medium"
            >
              {notification.priority === 'high' ? 'Important' : 'Urgent'}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
              {notification.time_ago || formatDate(notification.created_at)}
        </span>

          {showActions && !notification.is_read && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead?.(e)
                }}
              >
                Mark read
              </Button>
              {notification.action_url && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  View
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}