import { apiSlice } from "../../services/apiSlice"
import type { ProjectMilestone, MilestoneStatistics } from "@/types/project"

const project_api = "project_api"

export const milestoneApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Basic CRUD operations
    getAllMilestones: builder.query<ProjectMilestone[], void>({
      query: () => `/${project_api}/milestones/`,
    }),

    getMilestoneById: builder.query<ProjectMilestone, number>({
      query: (id) => `/${project_api}/milestones/${id}/`,
    }),

    createMilestone: builder.mutation({
      query: (data) => ({
        url: `/${project_api}/milestones/`,
        method: "POST",
        body: data,
      }),
    }),

    updateMilestone: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${project_api}/milestones/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteMilestone: builder.mutation({
      query: (id) => ({
        url: `/${project_api}/milestones/${id}/`,
        method: "DELETE",
      }),
    }),

    // Filtered queries
    getMilestonesByProject: builder.query<ProjectMilestone[], number>({
      query: (projectId) => `/${project_api}/milestones/by_project/?project_id=${projectId}`,
    }),

    getMilestonesByUser: builder.query<ProjectMilestone[], number | void>({
      query: (userId) =>
        userId ? `/${project_api}/milestones/by_user/?user_id=${userId}` : `/${project_api}/milestones/by_user/`,
    }),

    getUpcomingMilestones: builder.query<ProjectMilestone[], { projectId?: number; userId?: number }>({
      query: (params) => {
        let url = `/${project_api}/milestones/upcoming/`
        const queryParams = []

        if (params?.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params?.userId) {
          queryParams.push(`user_id=${params.userId}`)
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    getOverdueMilestones: builder.query<ProjectMilestone[], { projectId?: number; userId?: number }>({
      query: (params) => {
        let url = `/${project_api}/milestones/overdue/`
        const queryParams = []

        if (params?.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params?.userId) {
          queryParams.push(`user_id=${params.userId}`)
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Advanced filtering
    getFilteredMilestones: builder.query<
      ProjectMilestone[],
      {
        projectId?: number
        status?: string
        priority?: string
        userId?: number
        dueDateStart?: string
        dueDateEnd?: string
        isOverdue?: boolean
      }
    >({
      query: (params) => {
        let url = `/${project_api}/milestones/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.status) {
          queryParams.push(`status=${params.status}`)
        }

        if (params.priority) {
          queryParams.push(`priority=${params.priority}`)
        }

        if (params.userId) {
          queryParams.push(`user_id=${params.userId}`)
        }

        if (params.dueDateStart) {
          queryParams.push(`due_date_start=${params.dueDateStart}`)
        }

        if (params.dueDateEnd) {
          queryParams.push(`due_date_end=${params.dueDateEnd}`)
        }

        if (params.isOverdue !== undefined) {
          queryParams.push(`is_overdue=${params.isOverdue}`)
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Custom actions
    completeMilestone: builder.mutation({
      query: ({ id, completionDate }) => ({
        url: `/${project_api}/milestones/${id}/complete/`,
        method: "POST",
        body: { completion_date: completionDate },
      }),
    }),

    updateMilestoneStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${project_api}/milestones/${id}/update_status/`,
        method: "POST",
        body: { status },
      }),
    }),

    updateMilestonePercentage: builder.mutation({
      query: ({ id, completionPercentage }) => ({
        url: `/${project_api}/milestones/${id}/update_percentage/`,
        method: "POST",
        body: { completion_percentage: completionPercentage },
      }),
    }),

    assignUsersToMilestone: builder.mutation({
      query: ({ id, userIds }) => ({
        url: `/${project_api}/milestones/${id}/assign_users/`,
        method: "POST",
        body: { user_ids: userIds },
      }),
    }),

    // Statistics
    getMilestoneStatistics: builder.query<MilestoneStatistics, number | void>({
      query: (projectId) =>
        projectId
          ? `/${project_api}/milestones/statistics/?project_id=${projectId}`
          : `/${project_api}/milestones/statistics/`,
    }),
  }),
})

export const {
  // Basic CRUD
  useGetAllMilestonesQuery,
  useGetMilestoneByIdQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,

  // Filtered queries
  useGetMilestonesByProjectQuery,
  useGetMilestonesByUserQuery,
  useGetUpcomingMilestonesQuery,
  useGetOverdueMilestonesQuery,
  useGetFilteredMilestonesQuery,

  // Custom actions
  useCompleteMilestoneMutation,
  useUpdateMilestoneStatusMutation,
  useUpdateMilestonePercentageMutation,
  useAssignUsersToMilestoneMutation,

  // Statistics
  useGetMilestoneStatisticsQuery,
} = milestoneApiSlice
