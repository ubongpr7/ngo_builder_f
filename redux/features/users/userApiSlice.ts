import { apiSlice } from '../../services/apiSlice';

export interface UserData {
    id: number;
    email: string;
    phone?: string | null;
    picture?: string | null;
    first_name: string;
    last_name: string;
    sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    is_verified: boolean;
    is_staff: boolean;
    is_subscriber: boolean;
    is_worker: boolean;
    is_main: boolean;
    date_of_birth?: Date | string | null;
    profile?: number | null;
    date_joined: Date | string;
    last_login?: Date | string | null;
    password:string;
  }
  


const user_api='api/v1/accounts'
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${user_api}/update/${id}/`,
        method: 'PATCH',
        body: data
      }),
    }),
    getAUser: builder.query({
      query: (id ) => ({
        url: `/${user_api}/users/${id}/`,
      }),
    }),
    getLoggedInUser: builder.query({
      query: () => `/${user_api}/user/`,
    }),
  
    getCompanyUsers: builder.query<UserData[], void>({
      query: () => `/profile_api/users/`,
    }),
  
    getProjectTeamMembers: builder.query({
      query: (projectId) => `/project-team-members/?project_id=${projectId}`,
    }),
  }),

});

export const { 
  useUpdateUserMutation,
  useGetAUserQuery,
  useGetLoggedInUserQuery,
  useGetCompanyUsersQuery,
  useGetProjectTeamMembersQuery,
  
} = userApiSlice;