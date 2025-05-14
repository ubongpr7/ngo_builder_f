import { apiSlice } from "../../services/apiSlice"
import type { 
  Project, 
  ProjectUpdate, 
  ProjectCategory, 
  ProjectMedia, 
  ProjectStatistics, 
  UpdateStatistics 
} from "@/types/project"

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

    createProjectUpdate: builder.mutation({
      query: (data) => ({
        url: `/${projects_api}/updates/`,
        method: "POST",
        body: data,
      }),
    }),

    updateProjectUpdate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/updates/${id}/`,
        method: "PATCH",
        body: data,
      }),
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

    // Project media endpoints
    getAllProjectMedia: builder.query<ProjectMedia[], void>({
      query: () => `/${projects_api}/media/`,
    }),

    getProjectMediaById: builder.query<ProjectMedia, number>({
      query: (id) => `/${projects_api}/media/${id}/`,
    }),

    createProjectMedia: builder.mutation({
      query: (data) => ({
        url: `/${projects_api}/media/`,
        method: "POST",
        body: data,
      }),
    }),

    updateProjectMedia: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/media/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteProjectMedia: builder.mutation({
      query: (id) => ({
        url: `/${projects_api}/media/${id}/`,
        method: "DELETE",
      }),
    }),

    // Custom media endpoints
    getMediaByUpdate: builder.query<ProjectMedia[], number>({
      query: (updateId) => `/${projects_api}/media/by_update/?update_id=${updateId}`,
    }),

    getMediaByProject: builder.query<ProjectMedia[], number>({
      query: (projectId) => `/${projects_api}/media/by_project/?project_id=${projectId}`,
    }),

    getMediaByType: builder.query<ProjectMedia[], string>({
      query: (mediaType) => `/${projects_api}/media/by_type/?media_type=${mediaType}`,
    }),

    bulkUploadMedia: builder.mutation({
      query: (data) => ({
        url: `/${projects_api}/media/bulk_upload/`,
        method: "POST",
        body: data,
      }),
    }),


    
    getProjectExpenses: builder.query({
      query: (projectId) => `/projects/${projectId}/expenses`,
    }),
    getProjectAssets: builder.query({
      query: (projectId) => `/projects/${projectId}/assets`,
    }),
    getProjectComments: builder.query({
      query: (projectId) => `/projects/${projectId}/comments`,
    }),
    getProjectDocuments: builder.query<any[], string | string[]>({
      query: (projectId) => `/projects/${projectId}/documents`,
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
  useCreateProjectUpdateMutation,
  useUpdateProjectUpdateMutation,
  useDeleteProjectUpdateMutation,
  
  // Project media queries
  useGetAllProjectMediaQuery,
  useGetProjectMediaByIdQuery,
  useGetMediaByUpdateQuery,
  useGetMediaByProjectQuery,
  useGetMediaByTypeQuery,
  
  // Project media mutations
  useCreateProjectMediaMutation,
  useUpdateProjectMediaMutation,
  useDeleteProjectMediaMutation,
  useBulkUploadMediaMutation,

  // Project team, milestones, expenses, assets, comments, documents queries
  useGetProjectExpensesQuery,
  useGetProjectAssetsQuery,
  useGetProjectCommentsQuery,
  useGetProjectDocumentsQuery,
  
} = projectsApiSlice