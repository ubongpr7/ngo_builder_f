import { apiSlice } from "../../services/apiSlice"
import type {
  DonationCampaign,
  Donation,
  RecurringDonation,
  InKindDonation,
  Grant,
  GrantReport,
  Budget,
  BudgetItem,
  OrganizationalExpense,
  FinanceSummary,
  DonationStats,
} from "../../../types/finance"
import { ProjectUser } from "@/types/project";

const backend = "finance_api"

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Donation Campaigns
    getCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/campaigns/`,
    }),

    getCampaignById: builder.query<DonationCampaign, number>({
      query: (id) => `/${backend}/campaigns/${id}/`,
    }),

    getActiveCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/campaigns/active/`,
    }),

    getFeaturedCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/campaigns/featured/`,
    }),

    getCampaignDonations: builder.query<Donation[], number>({
      query: (campaignId) => `/${backend}/campaigns/${campaignId}/donations/`,
    }),

    getCampaignStatistics: builder.query<any, number>({
      query: (campaignId) => `/${backend}/campaigns/${campaignId}/statistics/`,
    }),

    createCampaign: builder.mutation<DonationCampaign, Partial<DonationCampaign>>({
      query: (campaign) => ({
        url: `/${backend}/campaigns/`,
        method: "POST",
        body: campaign,
      }),
    }),

    updateCampaign: builder.mutation({
      query: ({ id, campaign }) => ({
        url: `/${backend}/campaigns/${id}/`,
        method: "PATCH",
        body: campaign,
      }),
    }),

    deleteCampaign: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/campaigns/${id}/`,
        method: "DELETE",
      }),
    }),

    // Donations
    getDonations: builder.query<Donation[], void>({
      query: () => `/${backend}/donations/`,
    }),

    getDonationById: builder.query<Donation, number>({
      query: (id) => `/${backend}/donations/${id}/`,
    }),

    getRecentDonations: builder.query<Donation[], void>({
      query: () => `/${backend}/donations/recent/`,
    }),

    getDonationStatistics: builder.query<DonationStats, { start_date?: string; end_date?: string }>({
      query: (params) => {
        let url = `/${backend}/donations/statistics/`
        const queryParams = []

        if (params?.start_date) {
          queryParams?.push(`start_date=${params?.start_date}`)
        }

        if (params?.end_date) {
          queryParams?.push(`end_date=${params?.end_date}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams?.join("&")}`
        }

        return url
      },
    }),

    createDonation: builder.mutation<Donation, Partial<Donation>>({
      query: (donation) => ({
        url: `/${backend}/donations/`,
        method: "POST",
        body: donation,
      }),
    }),

    updateDonation: builder.mutation({
      query: ({ id, donation }) => ({
        url: `/${backend}/donations/${id}/`,
        method: "PATCH",
        body: donation,
      }),
    }),

    deleteDonation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/donations/${id}/`,
        method: "DELETE",
      }),
    }),

    // Recurring Donations
    getRecurringDonations: builder.query<RecurringDonation[], void>({
      query: () => `/${backend}/recurring-donations/`,
    }),

    getRecurringDonationById: builder.query<RecurringDonation, number>({
      query: (id) => `/${backend}/recurring-donations/${id}/`,
    }),

    getActiveRecurringDonations: builder.query<RecurringDonation[], void>({
      query: () => `/${backend}/recurring-donations/active/`,
    }),

    createRecurringDonation: builder.mutation<RecurringDonation, Partial<RecurringDonation>>({
      query: (recurringDonation) => ({
        url: `/${backend}/recurring-donations/`,
        method: "POST",
        body: recurringDonation,
      }),
    }),

    updateRecurringDonation: builder.mutation({
      query: ({ id, recurringDonation }) => ({
        url: `/${backend}/recurring-donations/${id}/`,
        method: "PATCH",
        body: recurringDonation,
      }),
    }),

    pauseRecurringDonation: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/recurring-donations/${id}/pause/`,
        method: "POST",
      }),
    }),

    resumeRecurringDonation: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/recurring-donations/${id}/resume/`,
        method: "POST",
      }),
    }),

    deleteRecurringDonation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/recurring-donations/${id}/`,
        method: "DELETE",
      }),
    }),

    // In-Kind Donations
    getInKindDonations: builder.query<InKindDonation[], void>({
      query: () => `/${backend}/in-kind-donations/`,
    }),

    getInKindDonationById: builder.query<InKindDonation, number>({
      query: (id) => `/${backend}/in-kind-donations/${id}/`,
    }),

    createInKindDonation: builder.mutation<InKindDonation, Partial<InKindDonation>>({
      query: (inKindDonation) => ({
        url: `/${backend}/in-kind-donations/`,
        method: "POST",
        body: inKindDonation,
      }),
    }),

    updateInKindDonation: builder.mutation({
      query: ({ id, inKindDonation }) => ({
        url: `/${backend}/in-kind-donations/${id}/`,
        method: "PATCH",
        body: inKindDonation,
      }),
    }),

    markInKindDonationReceived: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/in-kind-donations/${id}/mark_received/`,
        method: "POST",
      }),
    }),

    deleteInKindDonation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/in-kind-donations/${id}/`,
        method: "DELETE",
      }),
    }),

    // Grants
    getGrants: builder.query<Grant[], void>({
      query: () => `/${backend}/grants/`,
    }),

    getGrantById: builder.query<Grant, number>({
      query: (id) => `/${backend}/grants/${id}/`,
    }),

    getActiveGrants: builder.query<Grant[], void>({
      query: () => `/${backend}/grants/active/`,
    }),

    getPendingGrants: builder.query<Grant[], void>({
      query: () => `/${backend}/grants/pending/`,
    }),

    getGrantReports: builder.query<GrantReport[], number>({
      query: (grantId) => `/${backend}/grants/${grantId}/reports/`,
    }),

    createGrant: builder.mutation<Grant, Partial<Grant>>({
      query: (grant) => ({
        url: `/${backend}/grants/`,
        method: "POST",
        body: grant,
      }),
    }),

    updateGrant: builder.mutation({
      query: ({ id, grant }) => ({
        url: `/${backend}/grants/${id}/`,
        method: "PATCH",
        body: grant,
      }),
    }),

    deleteGrant: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/grants/${id}/`,
        method: "DELETE",
      }),
    }),

    // Grant Reports
    getAllGrantReports: builder.query<GrantReport[], void>({
      query: () => `/${backend}/grant-reports/`,
    }),

    getGrantReportById: builder.query<GrantReport, number>({
      query: (id) => `/${backend}/grant-reports/${id}/`,
    }),

    getOverdueGrantReports: builder.query<GrantReport[], void>({
      query: () => `/${backend}/grant-reports/overdue/`,
    }),

    createGrantReport: builder.mutation<GrantReport, Partial<GrantReport>>({
      query: (grantReport) => ({
        url: `/${backend}/grant-reports/`,
        method: "POST",
        body: grantReport,
      }),
    }),

    updateGrantReport: builder.mutation({
      query: ({ id, grantReport }) => ({
        url: `/${backend}/grant-reports/${id}/`,
        method: "PATCH",
        body: grantReport,
      }),
    }),

    deleteGrantReport: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/grant-reports/${id}/`,
        method: "DELETE",
      }),
    }),

    // Budgets
    getBudgets: builder.query<Budget[], void>({
      query: () => `/${backend}/budgets/`,
    }),

    getBudgetById: builder.query<Budget, number>({
      query: (id) => `/${backend}/budgets/${id}/`,
    }),

    getActiveBudgets: builder.query<Budget[], void>({
      query: () => `/${backend}/budgets/active/`,
    }),

    createBudget: builder.mutation<Budget, Partial<Budget>>({
      query: (budget) => ({
        url: `/${backend}/budgets/`,
        method: "POST",
        body: budget,
      }),
    }),

    updateBudget: builder.mutation({
      query: ({ id, budget }) => ({
        url: `/${backend}/budgets/${id}/`,
        method: "PATCH",
        body: budget,
      }),
    }),

    approveBudget: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/approve/`,
        method: "POST",
      }),
    }),

    deleteBudget: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/budgets/${id}/`,
        method: "DELETE",
      }),
    }),

    // Budget Items
    getBudgetItems: builder.query<BudgetItem[], void>({
      query: () => `/${backend}/budget-items/`,
    }),

    getBudgetItemById: builder.query<BudgetItem, number>({
      query: (id) => `/${backend}/budget-items/${id}/`,
    }),

    getBudgetItemsByBudget: builder.query<BudgetItem[], number>({
      query: (budgetId) => `/${backend}/budget-items/by_budget/?budget_id=${budgetId}`,
    }),

    createBudgetItem: builder.mutation<BudgetItem, Partial<BudgetItem>>({
      query: (budgetItem) => ({
        url: `/${backend}/budget-items/`,
        method: "POST",
        body: budgetItem,
      }),
    }),

    updateBudgetItem: builder.mutation({
      query: ({ id, budgetItem }) => ({
        url: `/${backend}/budget-items/${id}/`,
        method: "PATCH",
        body: budgetItem,
      }),
    }),

    linkProjectExpenseToBudgetItem: builder.mutation<
      { status: string },
      { budgetItemId: number; projectExpenseId: number }
    >({
      query: ({ budgetItemId, projectExpenseId }) => ({
        url: `/${backend}/budget-items/${budgetItemId}/link_project_expense/`,
        method: "POST",
        body: { project_expense_id: projectExpenseId, budget_item_id: budgetItemId },
      }),
    }),

    deleteBudgetItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/budget-items/${id}/`,
        method: "DELETE",
      }),
    }),

    // Organizational Expenses
    getOrganizationalExpenses: builder.query<OrganizationalExpense[], void>({
      query: () => `/${backend}/organizational-expenses/`,
    }),

    getOrganizationalExpenseById: builder.query<OrganizationalExpense, number>({
      query: (id) => `/${backend}/organizational-expenses/${id}/`,
    }),

    getPendingOrganizationalExpenses: builder.query<OrganizationalExpense[], void>({
      query: () => `/${backend}/organizational-expenses/pending/`,
    }),

    createOrganizationalExpense: builder.mutation<OrganizationalExpense, Partial<OrganizationalExpense>>({
      query: (expense) => ({
        url: `/${backend}/organizational-expenses/`,
        method: "POST",
        body: expense,
      }),
    }),

    updateOrganizationalExpense: builder.mutation({
      query: ({ id, expense }) => ({
        url: `/${backend}/organizational-expenses/${id}/`,
        method: "PATCH",
        body: expense,
      }),
    }),

    approveOrganizationalExpense: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/organizational-expenses/${id}/approve/`,
        method: "POST",
      }),
    }),

    rejectOrganizationalExpense: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `/${backend}/organizational-expenses/${id}/reject/`,
        method: "POST",
      }),
    }),

    deleteOrganizationalExpense: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/organizational-expenses/${id}/`,
        method: "DELETE",
      }),
    }),

    // Dashboard
    getFinanceSummary: builder.query<FinanceSummary, { start_date?: string; end_date?: string }>({
      query: (params) => {
        let url = `/${backend}/dashboard/summary/`
        const queryParams = []

        if (params?.start_date) {
          queryParams?.push(`start_date=${params?.start_date}`)
        }

        if (params?.end_date) {
          queryParams?.push(`end_date=${params?.end_date}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams?.join("&")}`
        }

        return url
      },
    }),

    getFinanceCharts: builder.query<any, void>({
      query: () => `/${backend}/dashboard/charts/`,
    }),

    // Get all donors (for dropdown selections)
    getAllDonors: builder.query<ProjectUser[], void>({
      query: () => `project_api/all-users`,
    }),

    // Get all expenses (alias for organizational expenses)
    getAllExpenses: builder.query<OrganizationalExpense[], void>({
      query: () => `/${backend}/organizational-expenses/`,
    }),

    // Get all campaigns (alias for consistency)
    getAllCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/campaigns/`,
    }),

    // Get all budgets (alias for consistency)
    getAllBudgets: builder.query<Budget[], void>({
      query: () => `/${backend}/budgets/`,
    }),

    // Get all donations (alias for consistency)
    getAllDonations: builder.query<Donation[], void>({
      query: () => `/${backend}/donations/`,
    }),
createPublicDonation: builder.mutation({
      query: (donation) => ({
        url: `/${backend}/donations/public/`,
        method: "POST",
        body: donation,
      }),
      }),

    // Finance statistics query
    getFinanceStatistics: builder.query({
      query: (params) => {
        let url = `/${backend}/dashboard/statistics/`
        const queryParams = []

        if (params?.start_date) {
          queryParams?.push(`start_date=${params?.start_date}`)
        }

        if (params?.end_date) {
          queryParams?.push(`end_date=${params?.end_date}`)
        }

        if (queryParams?.length > 0) {
          url += `?${queryParams?.join("&")}`
        }

        return url
      },
    }),
  }),
})

export const {
  // Campaigns
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetActiveCampaignsQuery,
  useGetFeaturedCampaignsQuery,
  useGetCampaignDonationsQuery,
  useGetCampaignStatisticsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,

  // Donations
  useGetDonationsQuery,
  useGetDonationByIdQuery,
  useGetRecentDonationsQuery,
  useGetDonationStatisticsQuery,
  useCreateDonationMutation,
  useUpdateDonationMutation,
  useDeleteDonationMutation,
  useCreatePublicDonationMutation,

  // Recurring Donations
  useGetRecurringDonationsQuery,
  useGetRecurringDonationByIdQuery,
  useGetActiveRecurringDonationsQuery,
  useCreateRecurringDonationMutation,
  useUpdateRecurringDonationMutation,
  usePauseRecurringDonationMutation,
  useResumeRecurringDonationMutation,
  useDeleteRecurringDonationMutation,

  // In-Kind Donations
  useGetInKindDonationsQuery,
  useGetInKindDonationByIdQuery,
  useCreateInKindDonationMutation,
  useUpdateInKindDonationMutation,
  useMarkInKindDonationReceivedMutation,
  useDeleteInKindDonationMutation,

  // Grants
  useGetGrantsQuery,
  useGetGrantByIdQuery,
  useGetActiveGrantsQuery,
  useGetPendingGrantsQuery,
  useGetGrantReportsQuery,
  useCreateGrantMutation,
  useUpdateGrantMutation,
  useDeleteGrantMutation,

  // Grant Reports
  useGetAllGrantReportsQuery,
  useGetGrantReportByIdQuery,
  useGetOverdueGrantReportsQuery,
  useCreateGrantReportMutation,
  useUpdateGrantReportMutation,
  useDeleteGrantReportMutation,

  // Budgets
  useGetBudgetsQuery,
  useGetBudgetByIdQuery,
  useGetActiveBudgetsQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useApproveBudgetMutation,
  useDeleteBudgetMutation,

  // Budget Items
  useGetBudgetItemsQuery,
  useGetBudgetItemByIdQuery,
  useGetBudgetItemsByBudgetQuery,
  useCreateBudgetItemMutation,
  useUpdateBudgetItemMutation,
  useLinkProjectExpenseToBudgetItemMutation,
  useDeleteBudgetItemMutation,

  // Organizational Expenses
  useGetOrganizationalExpensesQuery,
  useGetOrganizationalExpenseByIdQuery,
  useGetPendingOrganizationalExpensesQuery,
  useCreateOrganizationalExpenseMutation,
  useUpdateOrganizationalExpenseMutation,
  useApproveOrganizationalExpenseMutation,
  useRejectOrganizationalExpenseMutation,
  useDeleteOrganizationalExpenseMutation,

  // Dashboard
  useGetFinanceSummaryQuery,
  useGetFinanceChartsQuery,

  useGetAllDonorsQuery,
  useGetAllExpensesQuery,
  useGetAllCampaignsQuery,
  useGetAllBudgetsQuery,
  useGetAllDonationsQuery,
  useGetFinanceStatisticsQuery,
} = financeApiSlice
