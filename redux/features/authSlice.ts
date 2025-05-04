import { createSlice } from "@reduxjs/toolkit"
import { setCookie, getCookie, deleteCookie } from "cookies-next"
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  theme: "light" | "dark"
}

const initialState = {
  isAuthenticated: false,
  isLoading: true,
} as AuthState

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isAuthenticated = true
    },
    login: (state) => {
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.isAuthenticated = false
      deleteCookie("accessToken")
      deleteCookie("refreshToken")
      // deleteCookie("user")
      // deleteCookie("user_id")
    },
    finishedInitialLoad: (state) => {
      state.isLoading = false
    },
  },
})

export const { login, logout, finishedInitialLoad, setAuth } = authSlice.actions
export default authSlice.reducer
