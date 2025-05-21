
import { apiSlice } from "../../services/apiSlice"
import type { ProjectExpense, ExpenseStatistics } from "../../../types/project"
import { create } from "domain";
const  backend='notification_api'

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
export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getNotifications: builder.query<Notification[], void>({
      query: () => `/${backend}/notifications/`,
    }),

    // Get unread notifications for current user
    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => `/${backend}/notifications/unread/`,
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
    markAllAsRead: builder.mutation<{ status: string; count: number }, void>({
      query: () => ({
        url: `/${backend}/notifications/mark_all_read/`,
        method: "POST",
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
    scheduleNotification: builder.mutation<
      { status: string; scheduled: any },
      ScheduleNotificationRequest
    >({
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
      { preferences: Partial<NotificationPreference>[] }
    >({
      query: (data) => ({
        url: `/${backend}/notification-preferences/update_preferences/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetNotificationsByCategoryQuery,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useMarkAllAsReadMutation,
  useCreateNotificationMutation,
  useScheduleNotificationMutation,
  useGetNotificationTypesQuery,
  useGetNotificationPreferencesQuery,
  useGetAllPreferencesQuery,
  useUpdatePreferencesMutation,
} = notificationsApiSlice
