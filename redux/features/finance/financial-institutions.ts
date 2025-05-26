import { apiSlice } from "../../services/apiSlice"
import type { FinancialInstitution, PaginatedResponse } from "@/types/finance"

const backend = "finance_api"

export const financialInstitutionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all financial institutions
    getFinancialInstitutions: builder.query<
      PaginatedResponse<FinancialInstitution>,
      {
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
        return `/${backend}/financial-institutions/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get financial institution by ID
    getFinancialInstitutionById: builder.query<FinancialInstitution, number>({
      query: (id) => `/${backend}/financial-institutions/${id}/`,
    }),

    // Get active financial institutions
    getActiveFinancialInstitutions: builder.query<FinancialInstitution[], void>({
      query: () => `/${backend}/financial-institutions/?is_active=true`,
    }),

    // Create financial institution
    createFinancialInstitution: builder.mutation<FinancialInstitution, Partial<FinancialInstitution>>({
      query: (institution) => ({
        url: `/${backend}/financial-institutions/`,
        method: "POST",
        body: institution,
      }),
    }),

    // Update financial institution
    updateFinancialInstitution: builder.mutation<
      FinancialInstitution,
      {
        id: number
        data: Partial<FinancialInstitution>
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/financial-institutions/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete financial institution
    deleteFinancialInstitution: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/financial-institutions/${id}/`,
        method: "DELETE",
      }),
    }),

    // Activate financial institution
    activateFinancialInstitution: builder.mutation<{ message: string; status: string }, number>({
      query: (id) => ({
        url: `/${backend}/financial-institutions/${id}/activate/`,
        method: "POST",
      }),
    }),

    // Deactivate financial institution
    deactivateFinancialInstitution: builder.mutation<{ message: string; status: string }, number>({
      query: (id) => ({
        url: `/${backend}/financial-institutions/${id}/deactivate/`,
        method: "POST",
      }),
    }),
  }),
})

export const {
  useGetFinancialInstitutionsQuery,
  useGetFinancialInstitutionByIdQuery,
  useGetActiveFinancialInstitutionsQuery,
  useCreateFinancialInstitutionMutation,
  useUpdateFinancialInstitutionMutation,
  useDeleteFinancialInstitutionMutation,
  useActivateFinancialInstitutionMutation,
  useDeactivateFinancialInstitutionMutation,
} = financialInstitutionsApiSlice
