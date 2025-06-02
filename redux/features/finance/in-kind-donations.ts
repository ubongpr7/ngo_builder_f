import { apiSlice } from "../../services/apiSlice"
import type { InKindDonation, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const inKindDonationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all in-kind donations
    getInKindDonations: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/in-kind-donations/${queryString ? `?${queryString}` : ""}`
      },
    }),
    getMyInKindDonations: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/in-kind-donations/my_donations/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get in-kind donation by ID
    getInKindDonationById: builder.query<InKindDonation, number>({
      query: (id) => `/${backend}/in-kind-donations/${id}/`,
    }),

    // Create in-kind donation
    createInKindDonation: builder.mutation<
      InKindDonation,
      Partial<InKindDonation> & {
        valuation_currency_id: number
        campaign_id?: number
        project_id?: number
        donor_id?: number
        received_by_id?: number
      }
    >({
      query: (inKindDonation) => ({
        url: `/${backend}/in-kind-donations/`,
        method: "POST",
        body: inKindDonation,
      }),
    }),

    // Update in-kind donation
    updateInKindDonation: builder.mutation<
      InKindDonation,
      {
        id: number
        data: Partial<InKindDonation> & {
          valuation_currency_id?: number
          campaign_id?: number
          project_id?: number
          donor_id?: number
          received_by_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/in-kind-donations/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete in-kind donation
    deleteInKindDonation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/in-kind-donations/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetInKindDonationsQuery,
  useGetMyInKindDonationsQuery,
  useGetInKindDonationByIdQuery,
  useCreateInKindDonationMutation,
  useUpdateInKindDonationMutation,
  useDeleteInKindDonationMutation,
} = inKindDonationsApiSlice
