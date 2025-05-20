import { apiSlice } from "../../services/apiSlice"
import type { ProjectUpdate, UpdateStatistics, ProjectMedia } from "../../../types/project"

const backend = "project_api"

export const updateApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUpdates: builder.query<ProjectUpdate[], void>({
      query: () => `/${backend}/updates/`,
    }),

    getUpdateById: builder.query<ProjectUpdate, number>({
      query: (id) => `/${backend}/updates/${id}/`,
    }),

    getUpdatesByProject: builder.query<ProjectUpdate[], number>({
      query: (projectId) => `/${backend}/updates/by_project/?project_id=${projectId}`,
    }),

    getUpdatesByUser: builder.query<ProjectUpdate[], number | void>({
      query: (userId) => (userId ? `/${backend}/updates/by_user/?user_id=${userId}` : `/${backend}/updates/by_user/`),
    }),

    getRecentUpdates: builder.query<ProjectUpdate[], number | void>({
      query: (projectId) =>
        projectId ? `/${backend}/updates/recent/?project_id=${projectId}` : `/${backend}/updates/recent/`,
    }),

    getTodayUpdates: builder.query<ProjectUpdate[], number | void>({
      query: (projectId) =>
        projectId ? `/${backend}/updates/today/?project_id=${projectId}` : `/${backend}/updates/today/`,
    }),

    getUpdateStatistics: builder.query<UpdateStatistics, number | void>({
      query: (projectId) =>
        projectId ? `/${backend}/updates/statistics/?project_id=${projectId}` : `/${backend}/updates/statistics/`,
    }),

    createUpdate: builder.mutation<ProjectUpdate, Partial<ProjectUpdate>>({
      query: (update) => ({
        url: `/${backend}/updates/`,
        method: "POST",
        body: update,
      }),
    }),

    updateUpdate: builder.mutation({
      query: ({ id, update }) => ({
        url: `/${backend}/updates/${id}/`,
        method: "PATCH",
        body: update,
      }),
    }),

    deleteUpdate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/updates/${id}/`,
        method: "DELETE",
      }),
    }),

    // Media endpoints
    getMediaByUpdate: builder.query<ProjectMedia[], number>({
      query: (updateId) => `/${backend}/media/by_update/?update_id=${updateId}`,
    }),

    getMediaByProject: builder.query<ProjectMedia[], number>({
      query: (projectId) => `/${backend}/media/by_project/?project_id=${projectId}`,
    }),

    getImages: builder.query<ProjectMedia[], { projectId?: number; updateId?: number }>({
      query: (params) => {
        let url = `/${backend}/media/images/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.updateId) {
          queryParams.push(`update_id=${params.updateId}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    getVideos: builder.query<ProjectMedia[], { projectId?: number; updateId?: number }>({
      query: (params) => {
        let url = `/${backend}/media/videos/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.updateId) {
          queryParams.push(`update_id=${params.updateId}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    getDocuments: builder.query<ProjectMedia[], { projectId?: number; updateId?: number }>({
      query: (params) => {
        let url = `/${backend}/media/documents/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params.updateId) {
          queryParams.push(`update_id=${params.updateId}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    addMedia: builder.mutation<ProjectMedia, FormData>({
      query: (media) => ({
        url: `/${backend}/media/`,
        method: "POST",
        body: media,
      }),
    }),

    updateMedia: builder.mutation({
      query: ({ id, media }) => ({
        url: `/${backend}/media/${id}/`,
        method: "PATCH",
        body: media,
      }),
    }),

    deleteMedia: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/media/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetUpdatesQuery,
  useGetUpdateByIdQuery,
  useGetUpdatesByProjectQuery,
  useGetUpdatesByUserQuery,
  useGetRecentUpdatesQuery,
  useGetTodayUpdatesQuery,
  useGetUpdateStatisticsQuery,
  useCreateUpdateMutation,
  useUpdateUpdateMutation,
  useDeleteUpdateMutation,
  useGetMediaByUpdateQuery,
  useGetMediaByProjectQuery,
  useGetImagesQuery,
  useGetVideosQuery,
  useGetDocumentsQuery,
  useAddMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = updateApiSlice
