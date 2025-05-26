import { apiSlice } from "../../services/apiSlice"
import type { AccountTransaction, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const accountTransactionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all account transactions
    getAccountTransactions: builder.query<
      PaginatedResponse<AccountTransaction>,
      {
        account?: number
        transaction_type?: string
        status?: string
        original_currency?: number
        is_reconciled?: boolean
        start_date?: string
        end_date?: string
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
        return `/${backend}/account-transactions/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get account transaction by ID
    getAccountTransactionById: builder.query<AccountTransaction, number>({
      query: (id) => `/${backend}/account-transactions/${id}/`,
    }),

    // Get unreconciled transactions
    getUnreconciledTransactions: builder.query<AccountTransaction[], void>({
      query: () => `/${backend}/account-transactions/unreconciled/`,
    }),

    // Create account transaction
    createAccountTransaction: builder.mutation<
      AccountTransaction,
      Partial<AccountTransaction> & {
        account_id: number
        authorized_by_id: number
        original_currency_id?: number
        donation_id?: number
        grant_id?: number
        expense_id?: number
        transfer_to_account_id?: number
        reconciled_by_id?: number
      }
    >({
      query: (transaction) => ({
        url: `/${backend}/account-transactions/`,
        method: "POST",
        body: transaction,
      }),
    }),

    // Update account transaction
    updateAccountTransaction: builder.mutation<
      AccountTransaction,
      {
        id: number
        data: Partial<AccountTransaction> & {
          account_id?: number
          authorized_by_id?: number
          original_currency_id?: number
          donation_id?: number
          grant_id?: number
          expense_id?: number
          transfer_to_account_id?: number
          reconciled_by_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/account-transactions/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete account transaction
    deleteAccountTransaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/account-transactions/${id}/`,
        method: "DELETE",
      }),
    }),

    // Reconcile transaction
    reconcileTransaction: builder.mutation<AccountTransaction, number>({
      query: (id) => ({
        url: `/${backend}/account-transactions/${id}/reconcile/`,
        method: "POST",
      }),
    }),
  }),
})

export const {
  useGetAccountTransactionsQuery,
  useGetAccountTransactionByIdQuery,
  useGetUnreconciledTransactionsQuery,
  useCreateAccountTransactionMutation,
  useUpdateAccountTransactionMutation,
  useDeleteAccountTransactionMutation,
  useReconcileTransactionMutation,
} = accountTransactionsApiSlice
