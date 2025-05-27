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

    // Get budget by ID
    getBudgetById: builder.query<Budget, number>({
      query: (id) => `/${backend}/budgets/${id}/`,
    }),

    // Create budget
    createBudget: builder.mutation<
      Budget,
      Partial<Budget> & {
        currency_id: number
        project_id?: number
        department_id?: number
        approved_by_id?: number
      }
    >({
      query: (budget) => ({
        url: `/${backend}/budgets/`,
        method: "POST",
        body: budget,
      }),
    }),

    // Update budget
    updateBudget: builder.mutation<
      Budget,
      {
        id: number
        data: Partial<Budget> & {
          currency_id?: number
          project_id?: number
          department_id?: number
          approved_by_id?: number
        }
      }
    >({
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
    addBudgetFunding: builder.mutation<
      {
        message: string
        total_funding: string
      },
      {
        id: number
        funding_source_id: number
        amount: string
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/${backend}/budgets/${id}/add_funding/`,
        method: "POST",
        body: data,
      }),
    }),

    // Get budget utilization
    getBudgetUtilization: builder.query<BudgetUtilization, number>({
      query: (id) => `/${backend}/budgets/${id}/utilization/`,
    }),

    // Get budget statistics
    getBudgetStatistics: builder.query<
      {
        total_budgets: number
        total_allocated: number
        total_spent: number
        by_type: Array<{
          budget_type: string
          count: number
          total_amount: number
          spent_amount: number
        }>
        by_status: Array<{
          status: string
          count: number
          total_amount: number
          spent_amount: number
        }>
        utilization_summary: BudgetUtilization[]
      },
      void
    >({
      query: () => `/${backend}/budgets/statistics/`,
    }),
  }),
})

export const {
  useGetBudgetsQuery,
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
} = budgetsApiSlice
