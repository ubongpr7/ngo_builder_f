import { apiSlice } from "../../services/apiSlice"
import type { RecurringDonation, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const recurringDonationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all recurring donations
    getRecurringDonations: builder.query<
      PaginatedResponse<RecurringDonation>,
      {
        status?: string
        frequency?: string
        currency?: number
        campaign?: number
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
        return `/${backend}/recurring-donations/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get recurring donation by ID
    getRecurringDonationById: builder.query<RecurringDonation, number>({
      query: (id) => `/${backend}/recurring-donations/${id}/`,
    }),

    // Get due payments
    getDueRecurringPayments: builder.query<RecurringDonation[], void>({
      query: () => `/${backend}/recurring-donations/due_payments/`,
    }),

    // Create recurring donation
    createRecurringDonation: builder.mutation<
      RecurringDonation,
      Partial<RecurringDonation> & {
        currency_id: number
        campaign_id?: number
        project_id?: number
      }
    >({
      query: (recurringDonation) => ({
        url: `/${backend}/recurring-donations/`,
        method: "POST",
        body: recurringDonation,
      }),
    }),

    // Update recurring donation
    updateRecurringDonation: builder.mutation<
      RecurringDonation,
      {
        id: number
        data: Partial<RecurringDonation> & {
          currency_id?: number
          campaign_id?: number
          project_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/recurring-donations/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete recurring donation
    deleteRecurringDonation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/recurring-donations/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetRecurringDonationsQuery,
  useGetRecurringDonationByIdQuery,
  useGetDueRecurringPaymentsQuery,
  useCreateRecurringDonationMutation,
  useUpdateRecurringDonationMutation,
  useDeleteRecurringDonationMutation,
} = recurringDonationsApiSlice
