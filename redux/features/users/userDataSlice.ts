// src/redux/features/user/userDataSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { apiSlice } from '../../services/apiSlice'
import { RootState } from '../../app/store'

// Define the user data interface
export interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  picture: {
    url: string | null
  }
  phone_number: string | null
  bio: string | null
  role: string | null
  is_verified: boolean
  is_active: boolean
  last_login: string | null
  date_joined: string
  membership_status: string | null
  membership_type: number | null
  organization: string | null
  position: string | null
  industry: number | null
  // Add any other fields you need
}

// Initial state
const initialState: {
  userData: UserData | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
} = {
  userData: null,
  status: 'idle',
  error: null
}

// Create the user data slice
export const userDataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload
      state.status = 'succeeded'
    },
    updateUserData: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload }
      }
    },
    clearUserData: (state) => {
      state.userData = null
      state.status = 'idle'
    },
    setUserDataLoading: (state) => {
      state.status = 'loading'
    },
    setUserDataError: (state, action: PayloadAction<string>) => {
      state.status = 'failed'
      state.error = action.payload
    }
  }
})

// Export actions
export const {
  setUserData,
  updateUserData,
  clearUserData,
  setUserDataLoading,
  setUserDataError
} = userDataSlice.actions

// Create API endpoints for user data
export const userDataApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user data
    getCurrentUser: builder.query<UserData, void>({
      query: () => 'users/me/',
      transformResponse: (response: UserData) => {
        // You can transform the response here if needed
        return response
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          dispatch(setUserDataLoading())
          const { data } = await queryFulfilled
          dispatch(setUserData(data))
        } catch (error) {
          dispatch(setUserDataError('Failed to fetch user data'))
        }
      },
      providesTags: ['UserData']
    }),
    
    // Update user data
    updateUser: builder.mutation<UserData, Partial<UserData> & { id: string }>({
      query: ({ id, ...data }) => ({
        url: `users/${id}/`,
        method: 'PATCH',
        body: data
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          userDataApiSlice.util.updateQueryData('getCurrentUser', undefined, (draft) => {
            Object.assign(draft, patch)
          })
        )
        
        try {
          const { data } = await queryFulfilled
          // Update the user data in the state
          dispatch(updateUserData(data))
        } catch {
          // If the update fails, revert the optimistic update
          patchResult.undo()
          dispatch(setUserDataError('Failed to update user data'))
        }
      },
      invalidatesTags: ['UserData']
    })
  })
})

// Export hooks for the API endpoints
export const {
  useGetCurrentUserQuery,
  useUpdateUserMutation
} = userDataApiSlice

// Selectors
export const selectUserData = (state: RootState) => state.userData.userData
export const selectUserStatus = (state: RootState) => state.userData.status
export const selectUserError = (state: RootState) => state.userData.error

// Derived selectors
export const selectFullName = (state: RootState) => {
  const userData = state.userData.userData
  if (!userData) return ''
  return `${userData.first_name} ${userData.last_name}`.trim()
}

export const selectInitials = (state: RootState) => {
  const userData = state.userData.userData
  if (!userData) return ''
  return `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`.toUpperCase()
}

export const selectProfilePicture = (state: RootState) => {
  const userData = state.userData.userData
  return userData?.picture?.url || null
}

export const selectMembershipStatus = (state: RootState) => {
  return state.userData.userData?.membership_status || null
}

export default userDataSlice.reducer