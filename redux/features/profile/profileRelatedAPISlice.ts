import { apiSlice } from '../../services/apiSlice';

const management_api='profile_api'
export const profileRelatedApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getIndustry: builder.query({
      query: () => `${management_api}/industries/`,
    }),
    getMembership: builder.query({
      query: () => `${management_api}/membership/`,
    }),
    getExpertiseAreas: builder.query({
      query: () => `${management_api}/expertise/`,
    }),
    
  }),
});

export const {
     useGetIndustryQuery,
     useGetMembershipQuery,
     useGetExpertiseAreasQuery,

 } = profileRelatedApiSlice;