import { apiSlice } from "../../services/apiSlice"

const team_api = "project_api"

export const teamMemberApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTeamMembers: builder.query({
      query: () => `/${team_api}/team-members/`,
    }),

    getTeamMemberById: builder.query({
      query: (id) => `/${team_api}/team-members/${id}/`,
    }),

    getProjectTeam: builder.query({
      query: (projectId) => `/${team_api}/team-members/by_project/?project_id=${projectId}`,
    }),

    getUserProjectRoles: builder.query({
      query: (userId) =>
        userId ? `/${team_api}/team-members/by_user/?user_id=${userId}` : `/${team_api}/team-members/by_user/`,
    }),

    getTeamMembersByRole: builder.query({
      query: (role) => `/${team_api}/team-members/by_role/?role=${role}`,
    }),

    getActiveTeamMembers: builder.query({
      query: (projectId) =>
        projectId
          ? `/${team_api}/team-members/active_members/?project_id=${projectId}`
          : `/${team_api}/team-members/active_members/`,
    }),

    createTeamMember: builder.mutation({
      query: (data) => ({
        url: `/${team_api}/team-members/`,
        method: "POST",
        body: data,
      }),
    }),

    updateTeamMember: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${team_api}/team-members/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteTeamMember: builder.mutation({
      query: (id) => ({
        url: `/${team_api}/team-members/${id}/`,
        method: "DELETE",
      }),
    }),

    extendTeamMembership: builder.mutation({
      query: ({ id, endDate }) => ({
        url: `/${team_api}/team-members/${id}/extend_membership/`,
        method: "POST",
        body: { end_date: endDate },
      }),
    }),

    changeTeamMemberRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/${team_api}/team-members/${id}/change_role/`,
        method: "POST",
        body: { role },
      }),
    }),
  }),
})

export const {
  useGetAllTeamMembersQuery,
  useGetTeamMemberByIdQuery,
  useGetProjectTeamQuery,
  useGetUserProjectRolesQuery,
  useGetTeamMembersByRoleQuery,
  useGetActiveTeamMembersQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useExtendTeamMembershipMutation,
  useChangeTeamMemberRoleMutation,
} = teamMemberApiSlice
