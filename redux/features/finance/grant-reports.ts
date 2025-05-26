import { apiSlice } from "../../services/apiSlice"
import type { GrantReport, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const grantReportsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all grant reports
    getGrantReports: builder.query<
      PaginatedResponse<GrantReport>,
      {
        status?: string
        report_type?: string
        grant?: number
        search?: string
        ordering?: string
        page?: number
        page_size?: number
      }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/grant-reports/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get grant report by ID
    getGrantReportById: builder.query<GrantReport, number>({
      query: (id) => `/${backend}/grant-reports/${id}/`,
    }),

    // Create grant report
    createGrantReport: builder.mutation<
      GrantReport,
      Partial<GrantReport> & {
        grant_id: number
      }
    >({
      query: (grantReport) => ({
        url: `/${backend}/grant-reports/`,
        method: "POST",
        body: grantReport,
      }),
    }),

    // Update grant report
    updateGrantReport: builder.mutation<
      GrantReport,
      {
        id: number
        data: Partial<GrantReport> & {
          grant_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/grant-reports/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete grant report
    deleteGrantReport: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/grant-reports/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetGrantReportsQuery,
  useGetGrantReportByIdQuery,
  useCreateGrantReportMutation,
  useUpdateGrantReportMutation,
  useDeleteGrantReportMutation,
} = grantReportsApiSlice
