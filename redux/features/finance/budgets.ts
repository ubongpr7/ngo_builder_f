import { apiSlice } from "../../services/apiSlice"
import type { Budget, BudgetUtilization, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const budgetsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all budgets
    getBudgets: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/budgets/${queryString ? `?${queryString}` : ""}`
      },
    }),
    getDepartmentalBreakdown: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/budgets/departmental_breakdown/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get budget by ID
    getBudgetById: builder.query<Budget, number>({
      query: (id) => `/${backend}/budgets/${id}/`,
    }),

    // Create budget
    createBudget: builder.mutation({
      query: (budget) => ({
        url: `/${backend}/budgets/`,
        method: "POST",
        body: budget,
      }),
    }),

    // Update budget
    updateBudget: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${backend}/budgets/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete budget
    deleteBudget: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/`,
        method: "DELETE",
      }),
    }),

    // Submit for approval
    submitBudgetForApproval: builder.mutation<
      {
        message: string
        status: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/submit_for_approval/`,
        method: "POST",
      }),
    }),

    // Approve budget
    approveBudget: builder.mutation<Budget, number>({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/approve/`,
        method: "POST",
      }),
    }),

    // Activate budget
    activateBudget: builder.mutation<
      {
        message: string
        status: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/activate/`,
        method: "POST",
      }),
    }),

    // Check utilization
    checkBudgetUtilization: builder.mutation<
      {
        spent_percentage: number
        alerts_sent: string[]
        remaining_amount: string
        status: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/check_utilization/`,
        method: "POST",
      }),
    }),

    // Add funding
    addBudgetFunding: builder.mutation({
      query: ( data ) => ({
        url: `/${backend}/budget-funding/`,
        method: "POST",
        body: data,
      }),
    }),
    upateBudgetFunding: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${backend}/budget-funding/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Get budget utilization
    getBudgetUtilization: builder.query<BudgetUtilization, number>({
      query: (id) => `/${backend}/budgets/${id}/utilization/`,
    }),

    // Get budget statistics
    getBudgetStatistics: builder.query({
      query: () => `/${backend}/budgets/statistics/`,
    }),
  }),
})

export const {
  useGetBudgetsQuery,
  useGetDepartmentalBreakdownQuery,
  useGetBudgetByIdQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useSubmitBudgetForApprovalMutation,
  useApproveBudgetMutation,
  useActivateBudgetMutation,
  useCheckBudgetUtilizationMutation,
  useAddBudgetFundingMutation,
  useGetBudgetUtilizationQuery,
  useGetBudgetStatisticsQuery,
  useUpateBudgetFundingMutation,
} = budgetsApiSlice
