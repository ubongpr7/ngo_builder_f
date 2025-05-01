import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs as OriginalFetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"

// Extend FetchArgs to include a meta property
interface FetchArgs extends OriginalFetchArgs {
  meta?: {
    isFileUpload?: boolean
  }
}
import { setAuth, logout } from "../features/authSlice"
import { Mutex } from "async-mutex"
import { setCookie, getCookie, deleteCookie } from "cookies-next"
import env from "../../env_file"

const mutex = new Mutex()

// Base query for regular JSON requests
const baseQuery = fetchBaseQuery({
  baseUrl: env.BACKEND_HOST_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getCookie("accessToken")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    headers.set("Content-Type", "application/json")
    return headers
  },
})

// Base query for file uploads - doesn't set Content-Type
const fileUploadBaseQuery = fetchBaseQuery({
  baseUrl: env.BACKEND_HOST_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getCookie("accessToken")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    // Don't set Content-Type - browser will set it automatically with boundary for FormData
    return headers
  },
})

// Helper function to determine if the request is a file upload
const isFileUpload = (args: string | FetchArgs): boolean => {
  if (typeof args === 'string') return false
  
  // Check if body is FormData
  if (args.body instanceof FormData) return true
  
  // Check if there's a meta flag indicating file upload
  return args.meta?.isFileUpload === true
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock()
  
  // Choose the appropriate base query based on whether it's a file upload
  const appropriateBaseQuery = isFileUpload(args) ? fileUploadBaseQuery : baseQuery
  
  let result = await appropriateBaseQuery(args, api, extraOptions)

  if (result?.data && ((args as FetchArgs).url === "/jwt/create/" || (args as FetchArgs).url === "/jwt/refresh/")) {
    const response = result.data as { access: string; refresh: string; access_token: string; id: string }
    setCookie("accessToken", response.access, { maxAge: 72 * 60 * 60, path: "/" })
    setCookie("refreshToken", response.refresh, { maxAge: 60 * 60 * 24 * 7, path: "/" })
    setCookie("userID", response.id, { maxAge: 60 * 60 * 24 * 7, path: "/" })

    api.dispatch(setAuth())
  } else if (result?.data && (args as FetchArgs).url === "/api/v1/accounts/logout/") {
    deleteCookie("accessToken")
    deleteCookie("refreshToken")
    deleteCookie("userID")
    console.log("refreshToken deleted")
  }

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refreshToken = getCookie("refreshToken")
        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: "/jwt/refresh/",
              method: "POST",
              body: { refresh: refreshToken },
            },
            api,
            extraOptions,
          )

          if (refreshResult.data) {
            const newAccessToken = (refreshResult.data as { access: string }).access
            setCookie("accessToken", newAccessToken, { maxAge: 72 * 60 * 60, path: "/" })

            api.dispatch(setAuth())
            // Use the appropriate base query for the retry as well
            result = await appropriateBaseQuery(args, api, extraOptions)
          } else {
            deleteCookie("accessToken")
            deleteCookie("refreshToken")
            api.dispatch(logout())
          }
        } else {
          api.dispatch(logout())
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      // Use the appropriate base query here too
      result = await appropriateBaseQuery(args, api, extraOptions)
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
})

// Helper function to create file upload requests
export const createFileUploadRequest = (
  url: string, 
  formData: FormData, 
  method: 'POST' | 'PATCH' | 'PUT' = 'POST'
): FetchArgs => {
  return {
    url,
    method,
    body: formData,
    // This flag is optional but can be useful for debugging
    meta: { isFileUpload: true }
  }
}