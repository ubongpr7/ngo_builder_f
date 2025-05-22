"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { NotificationItem } from "./notification-item"

export function NotificationBell() {
  const { data, isLoading, refetch } = useGetRecentNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()
  const [open, setOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Set up polling interval (every 1 minute)
  useEffect(() => {
    // Initial fetch
    refetch()

    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      refetch()
    }, 60000) // 60000 ms = 1 minute

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refetch])

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
      refetch()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative flex items-center justify-center">
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
      <DropdownMenuContent align="end" className="w-[400px] max-h-[80vh] p-0">
        <DropdownMenuLabel className="flex justify-between items-center px-4 py-3 border-b">
          <span className="font-semibold">Notifications</span>
          {data?.unread_count ? (
            <Badge variant="secondary" className="ml-2">
              {data.unread_count} unread
            </Badge>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto">
          {isLoading ? (
            // Loading skeletons
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="p-4 border-b">
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ))
          ) : data?.notifications?.length ? (
            data.notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild className="p-0 focus:bg-transparent">
                <Link href={notification.action_url || "/notifications"}>
                  <NotificationItem
                    notification={notification}
                    showActions={!notification.is_read}
                    onMarkAsRead={(e) => handleMarkAsRead(notification.id, e)}
                  />
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          )}
        </div>

        <div className="p-3 text-center border-t">
          <Link href="/notifications" className="text-sm text-green-700 hover:underline">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
