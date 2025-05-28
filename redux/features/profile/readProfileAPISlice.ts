import { UserProfileRoles } from '@/components/permissionHander';
import { apiSlice } from '../../services/apiSlice';
const management_api='profile_api'

export const userProfileReading = apiSlice.injectEndpoints({
  endpoints: builder => ({    
    getUserProfileDetails: builder.query({
      query: (id) => `/${management_api}/users/${id}/`,
    }),
    getUserLoggedInProfileDetails: builder.query({
        query: () => `/${management_api}/users/me/`,
      }),
    getListOfProfiles: builder.query({
      query: (id) => `/${management_api}/users/`,
    }),
  getLoggedInProfileRoles: builder.query<UserProfileRoles, void>({
    query: () => `/${management_api}/profile-roles/`,
  }),
  
  getAdminUsers: builder.query<UserProfileRoles, void>({
    query: () => `/project_api/admin-users/`,
  }),

  
  getPreviewInProfileRoles: builder.query({
    query: (reference) => `/${management_api}/preview-profiles/${reference}/`,
  }),
  getDepartments: builder.query({
    query: () => `/${management_api}/departments/`,
  }),

}),

});

export const {
  useGetDepartmentsQuery,
  
    useGetUserProfileDetailsQuery,
    useGetListOfProfilesQuery,
    useGetUserLoggedInProfileDetailsQuery,
  useGetLoggedInProfileRolesQuery,
  useGetPreviewInProfileRolesQuery,
  useGetAdminUsersQuery,
} = userProfileReading;
