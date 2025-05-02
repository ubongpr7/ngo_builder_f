import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs as OriginalFetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { setAuth, logout } from "../features/authSlice"
import { Mutex } from "async-mutex"
import { setCookie, getCookie, deleteCookie } from "cookies-next"
import env from "../../env_file"

// Extend FetchArgs to include a meta property
interface FetchArgs extends OriginalFetchArgs {
  meta?: {
    isFileUpload?: boolean
  }
}

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
    // Content-Type is not set here
    return headers
  },
})

// Improved check for file upload requests
const isFileUpload = (args: string | FetchArgs): boolean => {
  if (typeof args === 'string') return false
  return args.meta?.isFileUpload === true || args.body instanceof FormData
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock()
  
  // Determine the appropriate base query
  const appropriateBaseQuery = isFileUpload(args) ? fileUploadBaseQuery : baseQuery
  
  let result = await appropriateBaseQuery(args, api, extraOptions)

  if (result?.data) {
    const url = (args as FetchArgs).url
    if (url === "/jwt/create/" || url === "/jwt/refresh/") {
      const response = result.data as { access: string; refresh: string; id: string }
      setCookie("accessToken", response.access, { maxAge: 72 * 60 * 60, path: "/" })
      setCookie("refreshToken", response.refresh, { maxAge: 60 * 60 * 24 * 7, path: "/" })
      setCookie("userID", response.id, { maxAge: 60 * 60 * 24 * 7, path: "/" })
      api.dispatch(setAuth())
    } else if (url === "/api/v1/accounts/logout/") {
      deleteCookie("accessToken")
      deleteCookie("refreshToken")
      deleteCookie("userID")
    }
  }

  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refreshToken = getCookie("refreshToken")
        const refreshResult = await baseQuery(
          { url: "/jwt/refresh/", method: "POST", body: { refresh: refreshToken } },
          api,
          extraOptions,
        )

        if (refreshResult.data) {
          const newAccessToken = (refreshResult.data as { access: string }).access
          setCookie("accessToken", newAccessToken, { maxAge: 72 * 60 * 60, path: "/" })
          api.dispatch(setAuth())
          result = await appropriateBaseQuery(args, api, extraOptions) // Retry with original base query
        } else {
          deleteCookie("accessToken")
          deleteCookie("refreshToken")
          api.dispatch(logout())
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await appropriateBaseQuery(args, api, extraOptions)
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
})

// Helper for file upload requests
export const createFileUploadRequest = (
  url: string,
  formData: FormData,
  method: 'POST' | 'PATCH' | 'PUT' = 'POST'
): FetchArgs => ({
  url,
  method,
  body: formData,
  meta: { isFileUpload: true } // Explicitly mark as file upload
})