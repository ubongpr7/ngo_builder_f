import { apiSlice } from "../../services/apiSlice"
import type { ProjectExpense, ExpenseStatistics } from "../../../types/project"
const  backend='project_api'
export const expenseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<ProjectExpense[], void>({
      query: () => `${backend}/expenses/`,
    }),

    getExpenseById: builder.query<ProjectExpense, number>({
      query: (id) => `/${backend}/expenses/${id}/`,
    }),

    getExpensesByProject: builder.query<ProjectExpense[], number>({
      query: (projectId) => `/${backend}/expenses/${projectId}/expenses/`,
    }),

    getExpensesByUser: builder.query<ProjectExpense[], number | void>({
      query: (userId) => (userId ? `/${backend}/expenses/by_user/?user_id=${userId}` : `/${backend}/expenses/by_user/`),
    }),

    getPendingExpenses: builder.query<ProjectExpense[], number | void>({
      query: (projectId) =>
        projectId ? `/${backend}/expenses/pending_approval/?project_id=${projectId}` : `/${backend}/expenses/pending_approval/`,
    }),

    getExpenseStatistics: builder.query<ExpenseStatistics, number | void>({
      query: (projectId) => (projectId ? `/${backend}/expenses/statistics/?project_id=${projectId}` : `/${backend}/expenses/statistics/`),
    }),

    addExpense: builder.mutation<ProjectExpense, Partial<ProjectExpense>>({
      query: (expense) => ({
        url: `/${backend}/expenses/`,
        method: "POST",
        body: expense,
      }),
    }),

    updateExpense: builder.mutation<ProjectExpense, { id: number; expense: Partial<ProjectExpense> }>({
      query: ({ id, expense }) => ({
        url: `/${backend}/expenses/${id}/`,
        method: "PATCH",
        body: expense,
      }),
    }),

    deleteExpense: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/expenses/${id}/`,
        method: "DELETE",
      }),
    }),

    approveExpense: builder.mutation<ProjectExpense, { id: number; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/${backend}/expenses/${id}/approve/`,
        method: "POST",
        body: { notes },
      }),
    }),

    rejectExpense: builder.mutation<ProjectExpense, { id: number; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/${backend}/expenses/${id}/reject/`,
        method: "POST",
        body: { notes },
      }),
    }),

    reimburseExpense: builder.mutation<ProjectExpense, { id: number; notes?: string; reimbursement_date?: string }>({
      query: ({ id, notes, reimbursement_date }) => ({
        url: `/${backend}/expenses/${id}/reimburse/`,
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
