import { apiSlice } from "../../services/apiSlice"
import type { Donation, DonationFilters, DonationStats, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const donationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all donations with comprehensive filtering
    getDonations: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/donations/${queryString ? `?${queryString}` : ""}`
      },
    }),
    getMyDonations: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/donations/my_donations/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get donation by ID
    getDonationById: builder.query<Donation, number>({
      query: (id) => `/${backend}/donations/${id}/`,
    }),

    // Get recent donations
    getRecentDonations: builder.query<Donation[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => `/${backend}/donations/?ordering=-donation_date&page_size=${limit}`,
    }),

    // Create donation
    createDonation: builder.mutation({
      query: (donation) => ({
        url: `/${backend}/donations/`,
        method: "POST",
        body: donation,
      }),
    }),

    // Create public donation (for public donation forms)
    createPublicDonation: builder.mutation<
      Donation,
      Partial<Donation> & {
        currency_id: number
        campaign_id?: number
        project_id?: number
      }
    >({
      query: (donation) => ({
        url: `/${backend}/donations/public/`,
        method: "POST",
        body: donation,
      }),
    }),

    // Update donation
    updateDonation: builder.mutation<
      Donation,
      {
        id: number
        data: Partial<Donation> & {
          currency_id?: number
          campaign_id?: number
          project_id?: number
          donor_id?: number
          converted_currency_id?: number
          processor_fee_currency_id?: number
          deposited_to_account_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/donations/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete donation
    deleteDonation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/donations/${id}/`,
        method: "DELETE",
      }),
    }),

    // Process payment
    processDonationPayment: builder.mutation<{ message: string; status: string }, number>({
      query: (id) => ({
        url: `/${backend}/donations/${id}/process_payment/`,
        method: "POST",
      }),
    }),

    // Complete donation
    completeDonation: builder.mutation<
      Donation,
      {
        id: number
        deposited_to_account_id?: number
        bank_reference?: string
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/${backend}/donations/${id}/complete_donation/`,
        method: "POST",
        body: data,
      }),
    }),

    // Refund donation
    refundDonation: builder.mutation<
      {
        message: string
        status: string
        refund_reason: string
      },
      {
        id: number
        reason?: string
      }
    >({
      query: ({ id, reason }) => ({
        url: `/${backend}/donations/${id}/refund_donation/`,
        method: "POST",
        body: { reason },
      }),
    }),

    // Send receipt
    sendDonationReceipt: builder.mutation<
      {
        message: string
        receipt_number: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/donations/${id}/send_receipt/`,
        method: "POST",
      }),
    }),

    // Get donation statistics
    getDonationStatistics: builder.query<
      DonationStats,
      {
        period?: "day" | "week" | "month" | "year"
        start_date?: string
        end_date?: string
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
        return `/${backend}/donations/statistics/${queryString ? `?${queryString}` : ""}`
      },
    }),
  }),
})

export const {
  useGetDonationsQuery,
  useGetMyDonationsQuery,
  useGetDonationByIdQuery,
  useGetRecentDonationsQuery,
  useCreateDonationMutation,
  useCreatePublicDonationMutation,
  useUpdateDonationMutation,
  useDeleteDonationMutation,
  useProcessDonationPaymentMutation,
  useCompleteDonationMutation,
  useRefundDonationMutation,
  useSendDonationReceiptMutation,
  useGetDonationStatisticsQuery,
} = donationsApiSlice
