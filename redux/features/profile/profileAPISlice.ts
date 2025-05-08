import { apiSlice } from '../../services/apiSlice';
import {  profileAddressDataInterface, profileDataInterface,  } from '@/components/interfaces/profile';
import exp from 'constants';
const management_api='profile_api'
export const profileApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createProfile: builder.mutation({
      query: (profileDataInterface: Partial<profileDataInterface>) => ({
        url: `/${management_api}/profile/`,
        method: 'POST',
        body: profileDataInterface
      }),
    }),

    
    updateProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${management_api}/profile/${id}/`,
        method: 'PATCH',
        body: data
      }),
    }),
    getProfile: builder.query({
      query: (id) => `/${management_api}/profile/${id}/`,
    }),
  
  
    getProfileData: builder.query({
      query: () => ({
        url: `/${management_api}/profile/`,
        method: 'GET',
      }),
    }),
  }),

});


export const { 
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useGetProfileQuery,
  useGetProfileDataQuery
} = profileApiSlice;



export const userAddressApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createAddress: builder.mutation({
      query: (AddressDataInterface: Partial<profileAddressDataInterface>) => ({
        url: `/${management_api}/addresses/`,
        method: 'POST',
        body: AddressDataInterface
      }),
    }),
    
    updateAddress: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${management_api}/addresses/${id}/`,
        method: 'PATCH',
        body: data
      }),
    }),
    
    getAddresses: builder.query({
      query: () => `/${management_api}/addresses/`,
    }),
  
  }),

});

export const {

} = userAddressApiSlice;
