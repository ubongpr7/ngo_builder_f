"use client"

import { useState } from "react"
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "@/redux/features/notifications/notificationsApiSlice"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2, Bell, Filter } from 'lucide-react'
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  
  const { data: notifications, isLoading, refetch } = useGetNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation()
  
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap()
      toast.success("All notifications marked as read")
      refetch()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
      toast.error("Failed to mark all notifications as read")
    }
  }
  
  const handleNotificationClick = async (id: number, actionUrl: string) => {
    try {
      await markAsRead(id).unwrap()
      if (actionUrl) {
        router.push(actionUrl)
      }
      refetch()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }
  
  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (!notifications) return []
    
    if (activeTab === "all") return notifications
    if (activeTab === "unread") return notifications.filter(n => !n.is_read)
    
    // Filter by category
    return notifications.filter(n => n.notification_type_category.toLowerCase() === activeTab)
  }
  
  // Get unique categories from notifications
  const getCategories = () => {
    if (!notifications) return []
    
    const categories = new Set<string>()
    notifications.forEach(n => {
      if (n.notification_type_category) {
        categories.add(n.notification_type_category.toLowerCase())
      }
    })
    
    return Array.from(categories)
  }
  
  const filteredNotifications = getFilteredNotifications()
  const categories = getCategories()
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Mark all as read
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => router.push("/settings/notifications")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "all" ? "All Notifications" : 
               activeTab === "unread" ? "Unread Notifications" :
               `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Notifications`}
            </CardTitle>
            <CardDescription>
              {activeTab === "all" ? "View all your notifications" : 
               activeTab === "unread" ? "View your unread notifications" :
               `View notifications related to ${activeTab}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                    showActions
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">No notifications</h3>
                <p className="text-gray-500">
                  {activeTab === "all" ? "You don't have any notifications yet." : 
                   activeTab === "unread" ? "You don't have any unread notifications." :
                   `You don't have any ${activeTab} notifications.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
