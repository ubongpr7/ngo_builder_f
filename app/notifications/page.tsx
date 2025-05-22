"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useGetNotificationsQuery,
  useGetNotificationCategoriesQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationsMutation,
} from "@/redux/features/notifications/notificationsApiSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/ui/pagination"
import { Bell, Search, CheckCircle2, Trash2, ExternalLink, Clock, AlertCircle, CheckCheck, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse query parameters
  const currentPage = Number(searchParams?.get("page") || "1")
  const currentCategory = searchParams?.get("category") || "all"
  const currentSearch = searchParams?.get("search") || ""
  const currentFilter = searchParams?.get("filter") || "all"

  // State for selected notifications (for bulk actions)
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState(currentSearch)

  // Queries and mutations
  const { data: categories } = useGetNotificationCategoriesQuery()
  const { data, isLoading, isFetching } = useGetNotificationsQuery({
    page: currentPage,
    pageSize: 20,
    category: currentCategory !== "all" ? currentCategory : undefined,
    isRead: currentFilter === "read" ? true : currentFilter === "unread" ? false : undefined,
    search: currentSearch || undefined,
  })
  const [markAsRead] = useMarkAsReadMutation()
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation()
  const [deleteNotifications, { isLoading: isDeleting }] = useDeleteNotificationsMutation()

  // Reset selected notifications when data changes
  useEffect(() => {
    setSelectedNotifications([])
  }, [data])

  // Update URL with filters
  const updateFilters = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams?.toString())

    // Set page to 1 if filters change
    if (!params.hasOwnProperty("page")) {
      newParams.set("page", "1")
    }

    // Update params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    router.push(`/notifications?${newParams.toString()}`)
  }

  // Handle search
  const handleSearch = () => {
    updateFilters({ search: searchValue })
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    updateFilters({ category })
  }

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    updateFilters({ filter })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  // Handle mark as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap()
      toast.success("Notification marked as read")
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const category = currentCategory !== "all" ? currentCategory : undefined
      await markAllAsRead(category).unwrap()
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all notifications as read")
    }
  }

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (!selectedNotifications.length) return

    try {
      await deleteNotifications(selectedNotifications).unwrap()
      toast.success(`${selectedNotifications.length} notifications deleted`)
      setSelectedNotifications([])
    } catch (error) {
      toast.error("Failed to delete notifications")
    }
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === data?.results.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(data?.results.map((n) => n.id) || [])
    }
  }

  // Handle select notification
  const handleSelectNotification = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter((nId) => nId !== id))
    } else {
      setSelectedNotifications([...selectedNotifications, id])
    }
  }

  // Get notification icon based on category and priority
  const getNotificationIcon = (notification: any) => {
    const { priority, notification_type_category } = notification

    if (priority === "urgent") {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }

    if (priority === "high") {
      return <AlertCircle className="h-5 w-5 text-orange-500" />
    }

    switch (notification_type_category) {
      case "project":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "task":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "milestone":
        return <Clock className="h-5 w-5 text-purple-500" />
      case "expense":
        return <Bell className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Notifications</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              placeholder="Search notifications..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pr-8"
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Select value={currentFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={currentCategory} onValueChange={handleCategoryChange}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories?.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>
                {currentCategory === "all"
                  ? "All Notifications"
                  : `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Notifications`}
              </CardTitle>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead || !data?.results.length}
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  Mark All Read
                </Button>

                {selectedNotifications.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete ({selectedNotifications.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-start p-4 border rounded-md animate-pulse">
                      <div className="w-5 h-5 bg-gray-200 rounded-full mr-3 mt-1"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
              </div>
            ) : data?.results.length ? (
              <div>
                <div className="flex items-center mb-4 px-4">
                  <Checkbox
                    id="select-all"
                    checked={selectedNotifications.length === data.results.length && data.results.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                    Select All
                  </label>
                </div>

                <div className="space-y-2">
                  {data.results.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start p-4 border rounded-md ${!notification.is_read ? "bg-blue-50" : ""} ${
                        selectedNotifications.includes(notification.id) ? "border-primary" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={() => handleSelectNotification(notification.id)}
                        className="mr-3 mt-1"
                      />

                      <div className="mr-3 mt-1">{getNotificationIcon(notification)}</div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`text-sm font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500">{notification.time_ago}</span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">{notification.body}</p>

                        <div className="flex mt-2 gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Mark as read
                            </Button>
                          )}

                          {notification.action_url && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                              <a href={notification.action_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View details
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data.count > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(data.count / 20)}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                <p className="text-gray-500 mt-1">
                  {currentSearch
                    ? `No results found for "${currentSearch}"`
                    : currentFilter !== "all"
                      ? `No ${currentFilter} notifications found`
                      : "You don't have any notifications yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
