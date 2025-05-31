import { apiSlice } from "../../services/apiSlice"
import type { OrganizationalExpense, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const organizationalExpensesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all organizational expenses
    getOrganizationalExpenses: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/organizational-expenses/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get organizational expense by ID
    getOrganizationalExpenseById: builder.query<OrganizationalExpense, number>({
      query: (id) => `/${backend}/organizational-expenses/${id}/`,
    }),

    // Get pending expenses
    getPendingOrganizationalExpenses: builder.query<OrganizationalExpense[], void>({
      query: () => `/${backend}/organizational-expenses/pending_approvals/`,
    }),

    // Create organizational expense
    createOrganizationalExpense: builder.mutation({
      query: (expense) => ({
        url: `/${backend}/organizational-expenses/`,
        method: "POST",
        body: expense,
      }),
    }),

    // Update organizational expense
    updateOrganizationalExpense: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${backend}/organizational-expenses/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete organizational expense
    deleteOrganizationalExpense: builder.mutation({
      query: (id) => ({
        url: `/${backend}/organizational-expenses/${id}/`,
        method: "DELETE",
      }),
    }),

    // Approve expense
    approveOrganizationalExpense: builder.mutation({
      query: (id) => ({
        url: `/${backend}/organizational-expenses/${id}/approve/`,
        method: "POST",
      }),
    }),

    // Reject expense
    rejectOrganizationalExpense: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/${backend}/organizational-expenses/${id}/reject/`,
        method: "POST",
        body: { reason },
      }),
    }),

    // Mark as paid
    markOrganizationalExpensePaid: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${backend}/organizational-expenses/${id}/mark_paid/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useGetOrganizationalExpensesQuery,
  useGetOrganizationalExpenseByIdQuery,
  useGetPendingOrganizationalExpensesQuery,
  useCreateOrganizationalExpenseMutation,
  useUpdateOrganizationalExpenseMutation,
  useDeleteOrganizationalExpenseMutation,
  useApproveOrganizationalExpenseMutation,
  useRejectOrganizationalExpenseMutation,
  useMarkOrganizationalExpensePaidMutation,
} = organizationalExpensesApiSlice
