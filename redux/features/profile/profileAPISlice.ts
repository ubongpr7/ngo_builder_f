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
      query: (id) => `/${management_api}/profile/detail/${id}/`,
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

// export const ContactPersonApiSlice = apiSlice.injectEndpoints({
//   endpoints: builder => ({
//     createContactPerson: builder.mutation({
//       query: (AddressDataInterface: Partial<ContactPersonInterface>) => ({
//         url: `/${management_api}/profile-contacts/`,
//         method: 'POST',
//         body: AddressDataInterface
//       }),
//     }),
    
//     updateContactPerson: builder.mutation({
//       query: ({ id, data }) => ({
//         url: `/${management_api}/profile-contacts/${id}/`,
//         method: 'PATCH',
//         body: data
//       }),
//     }),
    
//     getContactPerson: builder.query({
//       query: (profile_id) => `/${management_api}/profile-contacts/?profile_id=${profile_id}`,
//     }),
  
//   }),

// });

// export const {
//   useCreateContactPersonMutation,
//   useUpdateContactPersonMutation,
//   useGetContactPersonQuery
// } = ContactPersonApiSlice;