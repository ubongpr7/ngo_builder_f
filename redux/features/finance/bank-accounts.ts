import { apiSlice } from "../../services/apiSlice"
import type { BankAccount, AccountTransaction, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const bankAccountsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all bank accounts
    getBankAccounts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/bank-accounts/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get bank account by ID
    getBankAccountById: builder.query<BankAccount, number>({
      query: (id) => `/${backend}/bank-accounts/${id}/`,
    }),

    // Get active bank accounts
    getActiveBankAccounts: builder.query<BankAccount[], void>({
      query: () => `/${backend}/bank-accounts/?is_active=true`,
    }),

    // Create bank account
    createBankAccount: builder.mutation<
      BankAccount,
      Partial<BankAccount> & {
        financial_institution_id: number
        currency_id: number
        primary_signatory_id: number
        secondary_signatory_ids?: number[]
      }
    >({
      query: (account) => ({
        url: `/${backend}/bank-accounts/`,
        method: "POST",
        body: account,
      }),
    }),

    // Update bank account
    updateBankAccount: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${backend}/bank-accounts/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete bank account
    deleteBankAccount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/bank-accounts/${id}/`,
        method: "DELETE",
      }),
    }),

    // Get account transactions
    getAccountTransactions: builder.query({
      query: ({ accountId, ...params }) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/bank-accounts/${accountId}/transactions/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get balance history
    getBalanceHistory: builder.query<
      Array<{
        date: string
        balance: number
        formatted_balance: string
      }>,
      {
        accountId: number
        days?: number
      }
    >({
      query: ({ accountId, days = 30 }) => `/${backend}/bank-accounts/${accountId}/balance_history/?days=${days}`,
    }),

    // Check low balance
    checkLowBalance: builder.mutation<
      {
        alert: boolean
        message: string
        balance: string
        threshold: string
      },
      {
        accountId: number
        threshold?: string
      }
    >({
      query: ({ accountId, threshold }) => ({
        url: `/${backend}/bank-accounts/${accountId}/check_low_balance/`,
        method: "POST",
        body: threshold ? { threshold } : {},
      }),
    }),

    // Freeze account
    freezeBankAccount: builder.mutation<{ message: string; status: string }, number>({
      query: (id) => ({
        url: `/${backend}/bank-accounts/${id}/freeze/`,
        method: "POST",
      }),
    }),

    // Unfreeze account
    unfreezeBankAccount: builder.mutation<{ message: string; status: string }, number>({
      query: (id) => ({
        url: `/${backend}/bank-accounts/${id}/unfreeze/`,
        method: "POST",
      }),
    }),
  }),
})

export const {
  useGetBankAccountsQuery,
  useGetBankAccountByIdQuery,
  useGetActiveBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetAccountTransactionsQuery,
  useGetBalanceHistoryQuery,
  useCheckLowBalanceMutation,
  useFreezeBankAccountMutation,
  useUnfreezeBankAccountMutation,
} = bankAccountsApiSlice
