"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Check, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGetUnreadNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "@/redux/features/notifications/notificationsApiSlice"
import { NotificationItem } from "./notification-item"
import { useRouter } from "next/navigation"
import { Loader2 } from 'lucide-react'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const { data: notifications, isLoading, refetch } = useGetUnreadNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation()
  
  const unreadCount = notifications?.length || 0
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  // Refetch notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [refetch])
  
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap()
      refetch()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }
  
  const handleNotificationClick = async (id: number, actionUrl: string) => {
    try {
      await markAsRead(id).unwrap()
      setIsOpen(false)
      if (actionUrl) {
        router.push(actionUrl)
      }
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }
  
  const handleSettingsClick = () => {
    setIsOpen(false)
    router.push("/settings/notifications")
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={handleSettingsClick}
                title="Notification Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAllRead}
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading notifications...</span>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No new notifications</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t text-center">
            <Button 
              variant="link" 
              className="text-xs"
              onClick={() => {
                setIsOpen(false)
                router.push("/notifications")
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
