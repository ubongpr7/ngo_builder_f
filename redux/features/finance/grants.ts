import { apiSlice } from "../../services/apiSlice"
import type { Grant, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const grantsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all grants
    getGrants: builder.query<
      PaginatedResponse<Grant>,
      {
        status?: string
        grantor_type?: string
        currency?: number
        project?: number
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
        return `/${backend}/grants/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get grant by ID
    getGrantById: builder.query<Grant, number>({
      query: (id) => `/${backend}/grants/${id}/`,
    }),

    // Create grant
    createGrant: builder.mutation<
      Grant,
      Partial<Grant> & {
        currency_id: number
        project_id?: number
        designated_account_id?: number
        managed_by_id?: number
      }
    >({
      query: (grant) => ({
        url: `/${backend}/grants/`,
        method: "POST",
        body: grant,
      }),
    }),

    // Update grant
    updateGrant: builder.mutation<
      Grant,
      {
        id: number
        data: Partial<Grant> & {
          currency_id?: number
          project_id?: number
          designated_account_id?: number
          managed_by_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/grants/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete grant
    deleteGrant: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/grants/${id}/`,
        method: "DELETE",
      }),
    }),

    // Submit application
    submitGrantApplication: builder.mutation<
      {
        message: string
        status: string
        submission_date: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/grants/${id}/submit_application/`,
        method: "POST",
      }),
    }),

    // Mark under review
    markGrantUnderReview: builder.mutation<
      {
        message: string
        status: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/grants/${id}/mark_under_review/`,
        method: "POST",
      }),
    }),

    // Approve grant
    approveGrant: builder.mutation<
      {
        message: string
        status: string
        approval_date: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/grants/${id}/approve_grant/`,
        method: "POST",
      }),
    }),

    // Reject grant
    rejectGrant: builder.mutation<
      {
        message: string
        status: string
        reason: string
      },
      {
        id: number
        reason?: string
      }
    >({
      query: ({ id, reason }) => ({
        url: `/${backend}/grants/${id}/reject_grant/`,
        method: "POST",
        body: { reason },
      }),
    }),

    // Activate grant
    activateGrant: builder.mutation<
      {
        message: string
        status: string
        start_date: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/grants/${id}/activate_grant/`,
        method: "POST",
      }),
    }),

    // Record disbursement
    recordGrantDisbursement: builder.mutation<
      {
        message: string
        amount_received: string
        remaining_amount: string
        status: string
      },
      {
        id: number
        amount: string
        account_id?: number
        reference?: string
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/${backend}/grants/${id}/record_disbursement/`,
        method: "POST",
        body: data,
      }),
    }),

    // Get grant statistics
    getGrantStatistics: builder.query<
      {
        total_grants: number
        total_amount: number
        total_received: number
        active_grants: number
        pending_grants: number
        by_type: Array<{
          grantor_type: string
          count: number
          total_amount: number
        }>
        by_status: Array<{
          status: string
          count: number
          total_amount: number
        }>
      },
      void
    >({
      query: () => `/${backend}/grants/statistics/`,
    }),
  }),
})

export const {
  useGetGrantsQuery,
  useGetGrantByIdQuery,
  useCreateGrantMutation,
  useUpdateGrantMutation,
  useDeleteGrantMutation,
  useSubmitGrantApplicationMutation,
  useMarkGrantUnderReviewMutation,
  useApproveGrantMutation,
  useRejectGrantMutation,
  useActivateGrantMutation,
  useRecordGrantDisbursementMutation,
  useGetGrantStatisticsQuery,
} = grantsApiSlice
