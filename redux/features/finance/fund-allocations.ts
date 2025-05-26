import { apiSlice } from "../../services/apiSlice"
import type { FundAllocation, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const fundAllocationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all fund allocations
    getFundAllocations: builder.query<
      PaginatedResponse<FundAllocation>,
      {
        source_account?: number
        budget?: number
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
        return `/${backend}/fund-allocations/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get fund allocation by ID
    getFundAllocationById: builder.query<FundAllocation, number>({
      query: (id) => `/${backend}/fund-allocations/${id}/`,
    }),

    // Create fund allocation
    createFundAllocation: builder.mutation<
      FundAllocation,
      Partial<FundAllocation> & {
        source_account_id: number
        budget_id: number
        approved_by_id?: number
      }
    >({
      query: (fundAllocation) => ({
        url: `/${backend}/fund-allocations/`,
        method: "POST",
        body: fundAllocation,
      }),
    }),

    // Update fund allocation
    updateFundAllocation: builder.mutation<
      FundAllocation,
      {
        id: number
        data: Partial<FundAllocation> & {
          source_account_id?: number
          budget_id?: number
          approved_by_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/fund-allocations/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete fund allocation
    deleteFundAllocation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/fund-allocations/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetFundAllocationsQuery,
  useGetFundAllocationByIdQuery,
  useCreateFundAllocationMutation,
  useUpdateFundAllocationMutation,
  useDeleteFundAllocationMutation,
} = fundAllocationsApiSlice
