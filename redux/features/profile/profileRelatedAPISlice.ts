import { apiSlice } from '../../services/apiSlice';

const management_api='profile_api'
export const profileRelatedApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getIndustry: builder.query({
      query: () => `${management_api}/industries`,
    }),
    getMembership: builder.query({
      query: () => `${management_api}/membership`,
    }),
    getExpertiseAreas: builder.query({
      query: () => `${management_api}/membership`,
    }),
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${management_api}/update/${id}/`,
        method: 'PATCH',
        body: data
      }),
    }),
  }),
});

export const {
     useGetIndustryQuery,
     useGetMembershipQuery,
     useGetExpertiseAreasQuery,
     useUpdateUserMutation,

 } = profileRelatedApiSlice;