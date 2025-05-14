import { apiSlice } from "../../services/apiSlice"
import type { Project } from "@/types/project"

// Extend the Project type to include user_role
interface UserProject extends Project {
  user_role: "manager" | "official" | "creator" | "team_member"
}

export const userProjectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProjects: builder.query<UserProject[], void>({
      query: () => "/project_api/user-projects/",
    }),

    // Add role-specific queries if needed
    getUserManagedProjects: builder.query<UserProject[], void>({
      query: () => "/project_api/user-projects/?role=manager",
    }),

    getUserOfficialProjects: builder.query<UserProject[], void>({
      query: () => "/project_api/user-projects/?role=official",
    }),

    getUserCreatedProjects: builder.query<UserProject[], void>({
      query: () => "/project_api/user-projects/?role=creator",
    }),

    getUserTeamProjects: builder.query<UserProject[], void>({
      query: () => "/project_api/user-projects/?role=team_member",
    }),
  }),
})

export const {
  useGetUserProjectsQuery,
  useGetUserManagedProjectsQuery,
  useGetUserOfficialProjectsQuery,
  useGetUserCreatedProjectsQuery,
  useGetUserTeamProjectsQuery,
} = userProjectsApiSlice
