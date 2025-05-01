import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { setAuth, logout } from "../features/authSlice"
import { Mutex } from "async-mutex"
import { setCookie, getCookie, deleteCookie } from "cookies-next"
import env from "../../env_file"

const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl: env.BACKEND_HOST_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint, forced, type, ...rest }) => {
    const token = getCookie("accessToken")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    // Check if the request body is FormData
    // We can determine this by checking if the meta object has a formData flag
    const isFormData = (rest as { meta?: { formData?: boolean } }).meta?.formData === true

    // Only set Content-Type for non-FormData requests
    // For FormData, the browser will automatically set the correct Content-Type with boundary
    if (!isFormData) {
      headers.set("Content-Type", "application/json")
    }

    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock()

  // Check if we're dealing with FormData
  const isFormData =
    args instanceof FormData ||
    (typeof args === "object" && args !== null && "body" in args && args.body instanceof FormData)

  // Add formData flag to meta if needed
  const argsWithMeta = isFormData
  ? {
      ...(typeof args === "object" && args !== null ? args : {}),
      meta: {
        ...((args as FetchArgs & { meta?: Record<string, unknown> }).meta || {}),
        formData: true,
      },
    }
  : args

  if (typeof argsWithMeta === "object" && argsWithMeta !== null && !argsWithMeta.url) {
    throw new Error("The 'url' property is required in FetchArgs.")
  }
  let result = await baseQuery(argsWithMeta as FetchArgs, api, extraOptions)

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
            if (typeof argsWithMeta === "object" && argsWithMeta !== null && argsWithMeta.url) {
                result = await baseQuery(argsWithMeta as FetchArgs, api, extraOptions)
            } else {
                throw new Error("The 'url' property is required in FetchArgs.")
            }
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
      if (typeof argsWithMeta === "object" && argsWithMeta !== null && argsWithMeta.url) {
        result = await baseQuery(argsWithMeta as FetchArgs, api, extraOptions)
      } else {
        throw new Error("The 'url' property is required in FetchArgs.")
      }
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
})
