import { MilestoneMedia } from "@/types/media";
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

        if (queryParams?.length > 0) {
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

        if (queryParams?.length > 0) {
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

        if (queryParams?.length > 0) {
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
    getUserMilestones: builder.query<ProjectMilestone[], void>({
      query: () => "/project_api/milestones/user-milestones/",
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

  useGetUserMilestonesQuery,
} = milestoneApiSlice


const backend = "project_api"

export const milestoneMediaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all milestone media
    getMilestoneMedia: builder.query<MilestoneMedia[], void>({
      query: () => `/${backend}/milestone-media/`,
    }),

    // Get milestone media by ID
    getMilestoneMediaById: builder.query<MilestoneMedia, number>({
      query: (id) => `/${backend}/milestone-media/${id}/`,
    }),

    // Get media by milestone
    getMediaByMilestone: builder.query<MilestoneMedia[], number>({
      query: (milestoneId) => `/${backend}/milestone-media/by_milestone/?milestone_id=${milestoneId}`,
    }),

    // Get media by project (across all milestones)
    getMilestoneMediaByProject: builder.query<MilestoneMedia[], number>({
      query: (projectId) => `/${backend}/milestone-media/by_project/?project_id=${projectId}`,
    }),

    // Get deliverable media
    getDeliverableMedia: builder.query<MilestoneMedia[], number>({
      query: (milestoneId) => `/${backend}/milestone-media/deliverables/?milestone_id=${milestoneId}`,
    }),

    // Get media by type
    getMilestoneMediaByType: builder.query<MilestoneMedia[], { milestoneId: number; mediaType: string }>({
      query: ({ milestoneId, mediaType }) =>
        `/${backend}/milestone-media/by_media_type/?milestone_id=${milestoneId}&media_type=${mediaType}`,
    }),

    // Get images
    getMilestoneImages: builder.query<MilestoneMedia[], { projectId?: number; milestoneId?: number }>({
      query: (params) => {
        let url = `/${backend}/milestone-media/images/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.milestoneId) {
          queryParams.push(`milestone_id=${params.milestoneId}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Get videos
    getMilestoneVideos: builder.query<MilestoneMedia[], { projectId?: number; milestoneId?: number }>({
      query: (params) => {
        let url = `/${backend}/milestone-media/videos/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.milestoneId) {
          queryParams.push(`milestone_id=${params.milestoneId}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Get documents
    getMilestoneDocuments: builder.query<MilestoneMedia[], { projectId?: number; milestoneId?: number }>({
      query: (params) => {
        let url = `/${backend}/milestone-media/documents/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.milestoneId) {
          queryParams.push(`milestone_id=${params.milestoneId}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Add milestone media
    addMilestoneMedia: builder.mutation<MilestoneMedia, FormData>({
      query: (media) => ({
        url: `/${backend}/milestone-media/`,
        method: "POST",
        body: media,
      }),
    }),

    // Update milestone media
    updateMilestoneMedia: builder.mutation({
      query: ({ id, media }) => ({
        url: `/${backend}/milestone-media/${id}/`,
        method: "PATCH",
        body: media,
      }),
    }),

    // Toggle deliverable status
    toggleDeliverable: builder.mutation<MilestoneMedia, number>({
      query: (id) => ({
        url: `/${backend}/milestone-media/${id}/toggle_deliverable/`,
        method: "POST",
      }),
    }),

    // Delete milestone media
    deleteMilestoneMedia: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/milestone-media/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetMilestoneMediaQuery,
  useGetMilestoneMediaByIdQuery,
  useGetMediaByMilestoneQuery,
  useGetMilestoneMediaByProjectQuery,
  useGetDeliverableMediaQuery,
  useGetMilestoneMediaByTypeQuery,
  useGetMilestoneImagesQuery,
  useGetMilestoneVideosQuery,
  useGetMilestoneDocumentsQuery,
  useAddMilestoneMediaMutation,
  useUpdateMilestoneMediaMutation,
  useToggleDeliverableMutation,
  useDeleteMilestoneMediaMutation,
} = milestoneMediaApiSlice
