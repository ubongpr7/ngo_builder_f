import { ProjectMedia } from "@/types/media"
import { apiSlice } from "../../services/apiSlice"
import type { 
  Project, 
  ProjectUpdate, 
  ProjectCategory, 
  ProjectStatistics, 
  UpdateStatistics 
} from "@/types/project"

interface GetProjectsParams {
  status?: string
  limit?: number
  page?: number
  search?: string
  category?: string
  manager?: string
}
const projects_api = "project_api"

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getManagerCeo: builder.query({
      query: (searchTerm) => {
        let url = `/${projects_api}/ceos/`;
        
        if (searchTerm && searchTerm.trim() !== '') {
          url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        return url;
      },
      keepUnusedDataFor: 300, 
    }),
    getAllUsers: builder.query({
      query: (searchTerm) => {
        let url = `/${projects_api}/all-users/`;
        
        if (searchTerm && searchTerm.trim() !== '') {
          url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        return url;
      },
      keepUnusedDataFor: 300, 
    }),
    getAllProjects: builder.query({
      query: () => `/${projects_api}/projects/`,
    }),
    getProjects: builder.query<Project[], GetProjectsParams>({
      query: (params) => {
        // Build query string from params
        const queryParams = new URLSearchParams()

        if (params.status) queryParams.append("status", params.status)
        if (params.limit) queryParams.append("limit", params.limit.toString())
        if (params.page) queryParams.append("page", params.page.toString())
        if (params.search) queryParams.append("search", params.search)
        if (params.category) queryParams.append("category", params.category)
        if (params.manager) queryParams.append("manager", params.manager)

        const queryString = queryParams.toString()
        return {
          url: `/${projects_api}/projects/${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        }
      },
      
    }),

    getProjectById: builder.query<Project, number>({
      query: (id) => `/${projects_api}/projects/${id}/`,
    }),


    getCreatedProjects: builder.query<Project[], void>({
      query: () => `/${projects_api}/projects/created/`,
    }),

    getProjectsCategories: builder.query<ProjectCategory[], void>({
      query: () => `/${projects_api}/project-categories/`,
    }),

    getManagedProjects: builder.query<Project[], void>({
      query: () => `/${projects_api}/projects/managed/`,
    }),

    createProject: builder.mutation({
      query: (data) => ({
        url: `/${projects_api}/projects/`,
        method: "POST",
        body: data,
      }),
    }),

    updateProject: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/projects/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/${projects_api}/projects/${id}/`,
        method: "DELETE",
      }),
    }),

    // Project status, budget, dates endpoints
    updateProjectStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/projects/${id}/update_status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    updateProjectBudget: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/projects/${id}/update_budget/`,
        method: "PATCH",
        body: data,
      }),
    }),

    updateProjectDates: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/projects/${id}/update_dates/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Project officials endpoints
    addProjectOfficial: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/projects/${id}/add_official/`,
        method: "POST",
        body: data,
      }),
    }),

    removeProjectOfficial: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/projects/${id}/remove_official/`,
        method: "POST",
        body: data,
      }),
    }),

    // Project statistics
    getProjectStatistics: builder.query<ProjectStatistics, void>({
      query: () => `/${projects_api}/projects/statistics/`,
    }),

    // Daily project update endpoints
    getProjectUpdates: builder.query<ProjectUpdate[], void>({
      query: () => `/${projects_api}/updates/`,
    }),

    getProjectUpdateById: builder.query<ProjectUpdate, number>({
      query: (id) => `/${projects_api}/updates/${id}/`,
    }),



    deleteProjectUpdate: builder.mutation({
      query: (id) => ({
        url: `/${projects_api}/updates/${id}/`,
        method: "DELETE",
      }),
    }),

    // Custom update endpoints
    getMyProjectUpdates: builder.query<ProjectUpdate[], void>({
      query: () => `/${projects_api}/updates/my_updates/`,
    }),

    getRecentProjectUpdates: builder.query<ProjectUpdate[], void>({
      query: () => `/${projects_api}/updates/recent/`,
    }),

    getProjectUpdatesByProject: builder.query<ProjectUpdate[], void>({
      query: () => `/${projects_api}/updates/by_project/`,
    }),

    getProjectUpdateSummary: builder.query<UpdateStatistics, void>({
      query: () => `/${projects_api}/updates/summary/`,
    }),



    

  }),
})

export const {
  useGetManagerCeoQuery, 
  useGetAllUsersQuery,
  // Project queries
  useGetAllProjectsQuery,
  useGetProjectByIdQuery,
  useGetCreatedProjectsQuery,
  useGetManagedProjectsQuery,
  useGetProjectsCategoriesQuery,
  useGetProjectStatisticsQuery,
  useGetProjectsQuery, 
  // Project mutations
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectStatusMutation,
  useUpdateProjectBudgetMutation,
  useUpdateProjectDatesMutation,
  useAddProjectOfficialMutation,
  useRemoveProjectOfficialMutation,
  
  // Project update queries
  useGetProjectUpdatesQuery,
  useGetProjectUpdateByIdQuery,
  useGetMyProjectUpdatesQuery,
  useGetRecentProjectUpdatesQuery,
  useGetProjectUpdatesByProjectQuery,
  useGetProjectUpdateSummaryQuery,
  
  // Project update mutations
  useDeleteProjectUpdateMutation,
  

} = projectsApiSlice

export const projectMediaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all project media
    getProjectMedia: builder.query<ProjectMedia[], void>({
      query: () => `/${projects_api}/project-media/`,
    }),

    // Get project media by ID
    getProjectMediaById: builder.query<ProjectMedia, number>({
      query: (id) => `/${projects_api}/project-media/${id}/`,
    }),

    // Get media by project
    getMediaByProject: builder.query<ProjectMedia[], number>({
      query: (projectId) => `/${projects_api}/project-media/by_project/?project_id=${projectId}`,
    }),

    // Get featured media
    getFeaturedMedia: builder.query<ProjectMedia[], number>({
      query: (projectId) => `/${projects_api}/project-media/featured/?project_id=${projectId}`,
    }),

    // Get media by type
    getProjectMediaByType: builder.query<ProjectMedia[], { projectId: number; mediaType: string }>({
      query: ({ projectId, mediaType }) =>
        `/${projects_api}/project-media/by_media_type/?project_id=${projectId}&media_type=${mediaType}`,
    }),

    // Get images
    getProjectImages: builder.query<ProjectMedia[], number | void>({
      query: (projectId) =>
        projectId ? `/${projects_api}/project-media/images/?project_id=${projectId}` : `/${projects_api}/project-media/images/`,
    }),

    // Get videos
    getProjectVideos: builder.query<ProjectMedia[], number | void>({
      query: (projectId) =>
        projectId ? `/${projects_api}/project-media/videos/?project_id=${projectId}` : `/${projects_api}/project-media/videos/`,
    }),

    // Get documents
    getProjectDocuments: builder.query<ProjectMedia[], number | void>({
      query: (projectId) =>
        projectId
          ? `/${projects_api}/project-media/documents/?project_id=${projectId}`
          : `/${projects_api}/project-media/documents/`,
    }),

    // Add project media
    addProjectMedia: builder.mutation<ProjectMedia, FormData>({
      query: (media) => ({
        url: `/${projects_api}/project-media/`,
        method: "POST",
        body: media,
      }),
    }),

    // Update project media
    updateProjectMedia: builder.mutation({
      query: ({ id, media }) => ({
        url: `/${projects_api}/project-media/${id}/`,
        method: "PATCH",
        body: media,
      }),
    }),

    // Toggle featured status
    toggleFeatured: builder.mutation<ProjectMedia, number>({
      query: (id) => ({
        url: `/${projects_api}/project-media/${id}/toggle_featured/`,
        method: "POST",
      }),
    }),

    // Delete project media
    deleteProjectMedia: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${projects_api}/project-media/${id}/`,
        method: "DELETE",
      }),
    }),

  downloadProjectMedia: builder.mutation({
      query: (id) => ({
        url: `/${projects_api}/project-media/${id}/download/`,
        method: "GET",
        responseHandler: (response) => {
          // Handle the file download
          return response.blob().then((blob) => {
            // Get the filename from the Content-Disposition header if available
            const contentDisposition = response.headers.get("Content-Disposition")
            let filename = "download"

            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/)
              if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
              }
            }

            // Create a download link and trigger the download
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          })
        },
      }),



 
    }),

    }),
})

export const {
  useGetProjectMediaQuery,
  useGetProjectMediaByIdQuery,
  useGetMediaByProjectQuery,
  useGetFeaturedMediaQuery,
  useGetProjectMediaByTypeQuery,
  useGetProjectImagesQuery,
  useGetProjectVideosQuery,
  useGetProjectDocumentsQuery,
  useAddProjectMediaMutation,
  useUpdateProjectMediaMutation,
  useToggleFeaturedMutation,
  useDeleteProjectMediaMutation,
  useDownloadProjectMediaMutation,
} = projectMediaApiSlice
