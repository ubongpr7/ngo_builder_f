import { apiSlice } from "../../services/apiSlice"
import type { Project } from "@/types/project"

export interface UserProjectRole extends Project {
  user_role: "manager" | "official" | "creator" | "team_member"

}

export const userProjectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProjects: builder.query<UserProjectRole[], string>({
      query: (filters = "") => `/project_api/user-projects/${filters ? `?${filters}` : ""}`,
      
    }),

    // Get projects by role
    getProjectsByRole: builder.query<UserProjectRole[], string>({
      query: (role) => `/project_api/user-projects/?role=${role}`,
    }),
  }),
})

export const { useGetUserProjectsQuery, useGetProjectsByRoleQuery } = userProjectsApiSlice
