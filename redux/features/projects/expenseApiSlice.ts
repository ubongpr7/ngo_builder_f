import { apiSlice } from "../../services/apiSlice"
import type { ProjectExpense, ExpenseStatistics } from "../../../types/project"

export const expenseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<ProjectExpense[], void>({
      query: () => "/expenses/",
    }),

    getExpenseById: builder.query<ProjectExpense, number>({
      query: (id) => `/expenses/${id}/`,
    }),

    getExpensesByProject: builder.query<ProjectExpense[], number>({
      query: (projectId) => `/projects/${projectId}/expenses/`,
    }),

    getExpensesByUser: builder.query<ProjectExpense[], number | void>({
      query: (userId) => (userId ? `/expenses/by_user/?user_id=${userId}` : "/expenses/by_user/"),
    }),

    getPendingExpenses: builder.query<ProjectExpense[], number | void>({
      query: (projectId) =>
        projectId ? `/expenses/pending_approval/?project_id=${projectId}` : "/expenses/pending_approval/",
    }),

    getExpenseStatistics: builder.query<ExpenseStatistics, number | void>({
      query: (projectId) => (projectId ? `/expenses/statistics/?project_id=${projectId}` : "/expenses/statistics/"),
    }),

    addExpense: builder.mutation<ProjectExpense, Partial<ProjectExpense>>({
      query: (expense) => ({
        url: "/expenses/",
        method: "POST",
        body: expense,
      }),
    }),

    updateExpense: builder.mutation<ProjectExpense, { id: number; expense: Partial<ProjectExpense> }>({
      query: ({ id, expense }) => ({
        url: `/expenses/${id}/`,
        method: "PATCH",
        body: expense,
      }),
    }),

    deleteExpense: builder.mutation<void, number>({
      query: (id) => ({
        url: `/expenses/${id}/`,
        method: "DELETE",
      }),
    }),

    approveExpense: builder.mutation<ProjectExpense, { id: number; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/expenses/${id}/approve/`,
        method: "POST",
        body: { notes },
      }),
    }),

    rejectExpense: builder.mutation<ProjectExpense, { id: number; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/expenses/${id}/reject/`,
        method: "POST",
        body: { notes },
      }),
    }),

    reimburseExpense: builder.mutation<ProjectExpense, { id: number; notes?: string; reimbursement_date?: string }>({
      query: ({ id, notes, reimbursement_date }) => ({
        url: `/expenses/${id}/reimburse/`,
        method: "POST",
        body: { notes, reimbursement_date },
      }),
    }),
  }),
})

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useGetExpensesByProjectQuery,
  useGetExpensesByUserQuery,
  useGetPendingExpensesQuery,
  useGetExpenseStatisticsQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
  useReimburseExpenseMutation,
} = expenseApiSlice
