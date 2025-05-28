import { apiSlice } from "../../services/apiSlice"
import type { FundingSource, PaginatedResponse } from "../../../types/finance"
import { get } from "http"

const backend = "finance_api"

export const fundingSourcesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all funding sources
    getFundingSources: builder.query<
      PaginatedResponse<FundingSource>,
      {
        funding_type?: string
        currency?: number
        is_active?: boolean
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
        return `/${backend}/funding-sources/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get funding source by ID
    getFundingSourceById: builder.query<FundingSource, number>({
      query: (id) => `/${backend}/funding-sources/${id}/`,
    }),

    // Create funding source
    createFundingSource: builder.mutation<
      FundingSource,
      Partial<FundingSource> & {
        currency_id: number
        donation_id?: number
        campaign_id?: number
        grant_id?: number
      }
    >({
      query: (fundingSource) => ({
        url: `/${backend}/funding-sources/`,
        method: "POST",
        body: fundingSource,
      }),
    }),

    // Update funding source
    updateFundingSource: builder.mutation<
      FundingSource,
      {
        id: number
        data: Partial<FundingSource> & {
          currency_id?: number
          donation_id?: number
          campaign_id?: number
          grant_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/funding-sources/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete funding source
    deleteFundingSource: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/funding-sources/${id}/`,
        method: "DELETE",
      }),
    }),
    getFundingSourceAllocationHistory: builder.query({
      query: (id) => ({
        url: `/${backend}/funding-sources/${id}/allocation-history/`,
        method: "GET",
      }),
    })
  }),
})

export const {
  useGetFundingSourcesQuery,
  useGetFundingSourceByIdQuery,
  useCreateFundingSourceMutation,
  useUpdateFundingSourceMutation,
  useDeleteFundingSourceMutation,
  useGetFundingSourceAllocationHistoryQuery
} = fundingSourcesApiSlice
