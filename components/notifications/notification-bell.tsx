"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  useGetRecentNotificationsQuery,
  useMarkAsReadMutation,
} from "@/redux/features/notifications/notificationsApiSlice"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const { data, isLoading, refetch } = useGetRecentNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()
  const [open, setOpen] = useState(false)

  // Refetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await markAsRead(id).unwrap()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const getNotificationIcon = (icon: string) => {
    // You can map icon names to Lucide icons here
    // For simplicity, we'll just use the Bell icon for all
    return <Bell className="h-4 w-4" />
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {data?.unread_count ? (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {data.unread_count > 99 ? "99+" : data.unread_count}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {data?.unread_count ? (
            <Badge variant="secondary" className="ml-2">
              {data.unread_count} unread
            </Badge>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[calc(70vh-8rem)] overflow-y-auto">
          {isLoading ? (
            // Loading skeletons
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="p-3 border-b">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
          ) : data?.notifications?.length ? (
            data.notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild className="p-0 focus:bg-transparent">
                <Link
                  href={notification.action_url || "/notifications"}
                  className={cn(
                    "block w-full p-3 border-b hover:bg-gray-50 transition-colors",
                    !notification.is_read && "bg-blue-50 hover:bg-blue-100",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h4 className={cn("text-sm font-medium", !notification.is_read && "font-semibold")}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">{notification.time_ago}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.body}</p>

                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 text-xs"
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                    >
                      Mark as read
                    </Button>
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          )}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
