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
  
  }),

});

export const {
    useGetUserProfileDetailsQuery,
    useGetListOfProfilesQuery,
    useGetUserLoggedInProfileDetailsQuery,

} = userProfileReading;
