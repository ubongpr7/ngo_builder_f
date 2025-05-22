import { apiSlice } from "../../services/apiSlice"

const backend = "notification_api"

export interface Notification {
  id: number
  recipient: number
  recipient_name: string
  notification_type: number
  notification_type_name: string
  notification_type_category: string
  title: string
  body: string
  priority: string
  icon: string
  color: string
  action_url: string
  related_object_type: string | null
  related_object_id: number | null
  data: Record<string, any>
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
  time_ago: string
}

export interface NotificationType {
  id: number
  name: string
  description: string
  category: string
  title_template: string
  body_template: string
  icon: string
  color: string
  default_priority: string
  send_email: boolean
  send_sms: boolean
  send_push: boolean
  is_active: boolean
  can_disable: boolean
}

export interface NotificationPreference {
  id: number
  user: number
  notification_type: number
  notification_type_name: string
  notification_type_category: string
  receive_in_app: boolean
  receive_email: boolean
  receive_sms: boolean
  receive_push: boolean
}

export interface NotificationStats {
  total: number
  unread: number
  by_category: Array<{
    notification_type__category: string
    count: number
    unread: number
  }>
  by_priority: Array<{
    priority: string
    count: number
    unread: number
  }>
}

export interface CreateNotificationRequest {
  recipients: number[]
  notification_type: string
  context_data?: Record<string, any>
  related_object_type?: string
  related_object_id?: number
  action_url?: string
  priority?: string
  icon?: string
  color?: string
  send_email?: boolean
  send_sms?: boolean
  send_push?: boolean
}

export interface ScheduleNotificationRequest {
  recipient: number
  notification_type: string
  scheduled_time: string
  context_data?: Record<string, any>
  is_recurring?: boolean
  recurrence_pattern?: string
}

export interface UpdatePreferencesRequest {
  preferences: Partial<NotificationPreference>[]
}

export interface NotificationCategory {
  value: string
  label: string
}

export interface RecentNotificationsResponse {
  notifications: Notification[]
  unread_count: number
}

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated notifications
    getNotifications: builder.query<
      {
        results: Notification[]
        count: number
        next: string | null
        previous: string | null
      },
      {
        page?: number
        pageSize?: number
        category?: string
        isRead?: boolean
        priority?: string
        search?: string
        startDate?: string
        endDate?: string
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append("page", params.page.toString())
        if (params.pageSize) queryParams.append("page_size", params.pageSize.toString())
        if (params.category) queryParams.append("category", params.category)
        if (params.isRead !== undefined) queryParams.append("is_read", params.isRead.toString())
        if (params.priority) queryParams.append("priority", params.priority)
        if (params.search) queryParams.append("search", params.search)
        if (params.startDate) queryParams.append("start_date", params.startDate)
        if (params.endDate) queryParams.append("end_date", params.endDate)

        return `/${backend}/notifications/?${queryParams.toString()}`
      },

          }),

    // Get recent notifications for notification bell
    getRecentNotifications: builder.query<RecentNotificationsResponse, number | void>({
      query: (limit = 12) => `/${backend}/notifications/recent/?limit=${limit}`,
    }),

    // Get unread notifications for current user
    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => `/${backend}/notifications/unread/`,
    }),

    // Get notification statistics
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => `/${backend}/notifications/stats/`,
    }),

    // Get notifications by category
    getNotificationsByCategory: builder.query<Notification[], string>({
      query: (category) => `/${backend}/notifications/?category=${category}`,
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/notifications/${id}/mark_read/`,
        method: "POST",
      }),
      
    }),

    // Mark notification as unread
    markAsUnread: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/notifications/${id}/mark_unread/`,
        method: "POST",
      }),
      
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ status: string; count: number }, string | void>({
      query: (category) => ({
        url: `/${backend}/notifications/mark_all_read/`,
        method: "POST",
        body: category ? { category } : {},
      }),
      
    }),

    // Delete multiple notifications
    deleteNotifications: builder.mutation<{ status: string; count: number }, number[]>({
      query: (ids) => ({
        url: `/${backend}/notifications/delete_multiple/`,
        method: "DELETE",
        body: { ids },
      }),
      
    }),

    // Create a notification
    createNotification: builder.mutation<
      { status: string; count: number; notifications: Notification[] },
      CreateNotificationRequest
    >({
      query: (data) => ({
        url: `/${backend}/notifications/create_notification/`,
        method: "POST",
        body: data,
      }),
    }),

    // Schedule a notification
    scheduleNotification: builder.mutation<{ status: string; scheduled: any }, ScheduleNotificationRequest>({
      query: (data) => ({
        url: `/${backend}/notifications/schedule_notification/`,
        method: "POST",
        body: data,
      }),
    }),

    // Get all notification types
    getNotificationTypes: builder.query<NotificationType[], void>({
      query: () => `/${backend}/notification-types/`,
    }),

    // Get notification categories
    getNotificationCategories: builder.query<NotificationCategory[], void>({
      query: () => `/${backend}/notification-types/categories/`,
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<NotificationPreference[], void>({
      query: () => `/${backend}/notification-preferences/`,
    }),

    // Get all notification types with user preferences
    getAllPreferences: builder.query<Record<string, any[]>, void>({
      query: () => `/${backend}/notification-preferences/get_all/`,
    }),

    // Update notification preferences
    updatePreferences: builder.mutation<
      { status: string; count: number; preferences: NotificationPreference[] },
      UpdatePreferencesRequest
    >({
      query: (data) => ({
        url: `/${backend}/notification-preferences/update_preferences/`,
        method: "POST",
        body: data,
      }),
      
    }),

    // Reset preferences to default
    resetPreferencesToDefault: builder.mutation<{ status: string; message: string; count: number }, void>({
      query: () => ({
        url: `/${backend}/notification-preferences/reset_to_default/`,
        method: "GET",
      }),
      
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetRecentNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetNotificationStatsQuery,
  useGetNotificationsByCategoryQuery,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationsMutation,
  useCreateNotificationMutation,
  useScheduleNotificationMutation,
  useGetNotificationTypesQuery,
  useGetNotificationCategoriesQuery,
  useGetNotificationPreferencesQuery,
  useGetAllPreferencesQuery,
  useUpdatePreferencesMutation,
  useResetPreferencesToDefaultMutation,
} = notificationsApiSlice
