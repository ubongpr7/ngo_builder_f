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


 const profileAddressApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAddresses: builder.query({
      query: (userProfileId) => `${management_api}/profiles/${userProfileId}/addresses/`,
      
    }),
 
    getAddressById: builder.query({
      query: ({ userProfileId, addressId }) => 
        `${management_api}/profiles/${userProfileId}/addresses/${addressId}/`,
      
    }),
    addAddress: builder.mutation({
      query: ({ userProfileId, address }) => ({
        url: `${management_api}/profiles/${userProfileId}/addresses/`,
        method: 'POST',
        body: address,
      }),
    }),
    updateAddress: builder.mutation({
      query: ({ userProfileId, addressId, ...address }) => ({ 
        url: `${management_api}/profiles/${userProfileId}/addresses/${addressId}/`,
        method: 'PUT',
        body: address,
      }),
    }),
    patchAddress: builder.mutation({
      query: ({ userProfileId, addressId, ...address }) => ({ 
        url: `${management_api}/profiles/${userProfileId}/addresses/${addressId}/`,
        method: 'PATCH',
        body: address,
      }),
      
    }),
    deleteAddress: builder.mutation({
      query: ({ userProfileId, addressId }) => ({
        url: `${management_api}/profiles/${userProfileId}/addresses/${addressId}/`,
        method: 'DELETE',
      }),
      
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  usePatchAddressMutation,
  useDeleteAddressMutation,
} = profileAddressApiSlice;