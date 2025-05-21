import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCircle, AlertCircle, Clock, FileText, User, CreditCard, Briefcase, Flag, CheckSquare, PenToolIcon as Tool, RefreshCw, XCircle, UserCheck, Star } from 'lucide-react'
import type { Notification } from "@/redux/features/notifications/notificationsApiSlice"

interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
  showActions?: boolean
}

export function NotificationItem({ notification, onClick, showActions = false }: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Get icon based on notification icon name or category
  const getIcon = () => {
    const iconName = notification.icon || "bell"
    const iconSize = "h-5 w-5"
    const iconMap: Record<string, JSX.Element> = {
      "bell": <Bell className={iconSize} />,
      "check-circle": <CheckCircle className={iconSize} />,
      "alert-circle": <AlertCircle className={iconSize} />,
      "clock": <Clock className={iconSize} />,
      "file-text": <FileText className={iconSize} />,
      "user": <User className={iconSize} />,
      "credit-card": <CreditCard className={iconSize} />,
      "briefcase": <Briefcase className={iconSize} />,
      "flag": <Flag className={iconSize} />,
      "check-square": <CheckSquare className={iconSize} />,
      "tool": <Tool className={iconSize} />,
      "refresh-cw": <RefreshCw className={iconSize} />,
      "x-circle": <XCircle className={iconSize} />,
      "user-check": <UserCheck className={iconSize} />,
      "star": <Star className={iconSize} />
    }
    
    return iconMap[iconName] || <Bell className={iconSize} />
  }
  
  // Get color based on notification color or priority
  const getColor = () => {
    const color = notification.color || "primary"
    const priorityColorMap: Record<string, string> = {
      "low": "bg-gray-100 text-gray-600",
      "normal": "bg-blue-100 text-blue-600",
      "high": "bg-orange-100 text-orange-600",
      "urgent": "bg-red-100 text-red-600"
    }
    
    const colorMap: Record<string, string> = {
      "primary": "bg-blue-100 text-blue-600",
      "secondary": "bg-gray-100 text-gray-600",
      "success": "bg-green-100 text-green-600",
      "danger": "bg-red-100 text-red-600",
      "warning": "bg-yellow-100 text-yellow-600",
      "info": "bg-cyan-100 text-cyan-600",
      "blue": "bg-blue-100 text-blue-600",
      "green": "bg-green-100 text-green-600",
      "red": "bg-red-100 text-red-600",
      "yellow": "bg-yellow-100 text-yellow-600",
      "purple": "bg-purple-100 text-purple-600",
      "orange": "bg-orange-100 text-orange-600"
    }
    
    return colorMap[color] || priorityColorMap[notification.priority] || "bg-gray-100 text-gray-600"
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
      className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${notification.is_read ? 'opacity-70' : ''}`}
      onClick={() => {
        if (onClick) onClick()
        else setIsExpanded(!isExpanded)
      }}
    >
      <div className="flex items-start">
        <div className={`rounded-full p-2 mr-3 ${getColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm mb-1 pr-2">{notification.title}</h4>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {notification.time_ago || formatDate(notification.created_at)}
            </span>
          </div>
          
          <p className={`text-sm text-gray-600 dark:text-gray-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {notification.body}
          </p>
          
          {(notification.notification_type_category || notification.priority === 'high' || notification.priority === 'urgent') && (
            <div className="flex items-center mt-1 space-x-2">
              {notification.notification_type_category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {notification.notification_type_category}
                </span>
              )}
              
              {(notification.priority === 'high' || notification.priority === 'urgent') && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  notification.priority === 'urgent' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                </span>
              )}
            </div>
          )}
          
          {showActions && (
            <div className="mt-2 flex items-center space-x-2">
              {notification.action_url && (
                <button 
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onClick) onClick()
                  }}
                >
                  View Details
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
