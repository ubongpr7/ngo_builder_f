import { apiSlice } from "../../services/apiSlice"
import type { Project, ProjectUpdate } from "@/types/project"

const projects_api = "api/v1/projects"

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProjects: builder.query<Project[], void>({
      query: () => `/${projects_api}/`,
    }),

    getProjectById: builder.query<Project, number>({
      query: (id) => `/${projects_api}/${id}/`,
    }),

    getUserProjects: builder.query<Project[], void>({
      query: () => `/${projects_api}/assigned/`,
    }),

    getCreatedProjects: builder.query<Project[], void>({
      query: () => `/${projects_api}/created/`,
    }),

    getManagedProjects: builder.query<Project[], void>({
      query: () => `/${projects_api}/managed/`,
    }),

    createProject: builder.mutation({
      query: (data) => ({
        url: `/${projects_api}/`,
        method: "POST",
        body: data,
      }),
    }),

    updateProject: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${projects_api}/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/${projects_api}/${id}/`,
        method: "DELETE",
      }),
    }),

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
  }),
})

export const {
  useGetAllProjectsQuery,
  useGetProjectByIdQuery,
  useGetUserProjectsQuery,
  useGetCreatedProjectsQuery,
  useGetManagedProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectUpdatesQuery,
  useGetProjectUpdateByIdQuery,
  useCreateProjectUpdateMutation,
} = projectsApiSlice
