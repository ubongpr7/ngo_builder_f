import { apiSlice } from "../../services/apiSlice"
import type { BudgetItem, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const budgetItemsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBudgetItems: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/budget-items/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get budget item by ID
    getBudgetItemById: builder.query<BudgetItem, number>({
      query: (id) => `/${backend}/budget-items/${id}/`,
    }),

    // Create budget item
    createBudgetItem: builder.mutation<
      BudgetItem,
      Partial<BudgetItem> & {
        budget_id: number
        responsible_person_id?: number
      }
    >({
      query: (budgetItem) => ({
        url: `/${backend}/budget-items/`,
        method: "POST",
        body: budgetItem,
      }),
    }),

    // Update budget item
    updateBudgetItem: builder.mutation<
      BudgetItem,
      {
        id: number
        data: Partial<BudgetItem> & {
          responsible_person_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/budget-items/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete budget item
    deleteBudgetItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/budget-items/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetBudgetItemsQuery,
  useGetBudgetItemByIdQuery,
  useCreateBudgetItemMutation,
  useUpdateBudgetItemMutation,
  useDeleteBudgetItemMutation,
} = budgetItemsApiSlice
