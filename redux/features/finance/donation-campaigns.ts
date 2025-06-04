import { apiSlice } from "../../services/apiSlice"
import type { DonationCampaign, Donation, PaginatedResponse, BankAccount } from "../../../types/finance"

const backend = "finance_api"

export const donationCampaignsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Campaign List and Detail Endpoints
    getDonationCampaigns: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/donation-campaigns/${queryString ? `?${queryString}` : ""}`
      },
    }),

    getDonationCampaignById: builder.query<DonationCampaign, number>({
      query: (id) => `/${backend}/donation-campaigns/${id}/`,
    }),

    getActiveDonationCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/donation-campaigns/?is_active=true`,
    }),

    getFeaturedDonationCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/donation-campaigns/?is_featured=true`,
    }),

    createDonationCampaign: builder.mutation({
      query: (campaign) => ({
        url: `/${backend}/donation-campaigns/`,
        method: "POST",
        body: campaign,
      }),
    }),

    updateDonationCampaign: builder.mutation<
      DonationCampaign,
      {
        id: number
        data: Partial<DonationCampaign> & {
          target_currency_id?: number
          project_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/donation-campaigns/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteDonationCampaign: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/donation-campaigns/${id}/`,
        method: "DELETE",
      }),
    }),

   getCampaignDonations: builder.query<
      {
        results: Array<{
          id: number
          type: "regular" | "recurring" | "in_kind"
          donor: {
            id: number | null
            name: string
            email: string | null
          }
          amount: number
          currency: {
            code: string
            symbol: string
          }
          status: string
          donation_date: string | null
          payment_method: string | null
          is_anonymous: boolean
          message: string
          frequency?: string
          next_payment_date?: string | null
          description?: string
          item_type?: string
          quantity?: number
          created_at: string | null
        }>
        count: number
        next: boolean
        previous: boolean
        page: number
        page_size: number
        total_pages: number
        summary: {
          total_donations: number
          regular_donations: {
            count: number
            total: number
          }
          recurring_donations: {
            count: number
            total: number
          }
          in_kind_donations: {
            count: number
            total: number
          }
        }
        filters_applied: {
          type: string
          start_date: string | null
          end_date: string | null
          min_amount: number | null
          max_amount: number | null
          status: string | null
        }
      },
      {
        campaignId: number
        type?: "all" | "regular" | "recurring" | "in_kind"
        start_date?: string
        end_date?: string
        min_amount?: number
        max_amount?: number
        status?: string
        page?: number
        page_size?: number
      }
    >({
      query: ({ campaignId, ...params }) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/donation-campaigns/${campaignId}/donations/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Dashboard Statistics
    getDashboardStats: builder.query<
      {
        summary: {
          total_campaigns: number
          active_campaigns: number
          completed_campaigns: number
        }
        health_distribution: Record<string, number>
        status_distribution: Record<string, number>
        top_performing: DonationCampaign[]
        recent_campaigns: DonationCampaign[]
      },
      void
    >({
      query: () => `/${backend}/donation-campaigns/dashboard_stats/`,
    }),

    // Comprehensive Analytics
    getCampaignComprehensiveAnalytics: builder.query<
      {
        campaign_info: {
          id: number
          title: string
          campaign_type: string
          target_amount: number
          currency: string
          campaign_status: string
          fundraising_health: string
          is_active: boolean
          can_receive_donations: boolean
        }
        financial_metrics: {
          current_amount: number
          total_donations_amount: number
          total_recurring_amount: number
          total_in_kind_amount: number
          net_donations_amount: number
          progress_percentage: number
          minimum_goal_percentage: number
          amount_remaining: number
          amount_over_target: number
          is_target_reached: boolean
          is_minimum_reached: boolean
        }
        donor_metrics: {
          total_donors_count: number
          total_donations_count: number
          average_donation_amount: number
          largest_donation_amount: number
        }
        time_metrics: {
          days_remaining: number
          days_elapsed: number
          total_campaign_days: number
          time_progress_percentage: number
          daily_fundraising_rate: number
          projected_final_amount: number
        }
        breakdown: any
        performance: any
        formatted_amounts: {
          target: string
          current: string
          remaining: string
          minimum_goal: string
        }
        performance_indicators: {
          monetary_progress: number
          is_on_track: boolean
          donor_retention: number
          payment_method_efficiency: number
          recurring_donor_value: any
        }
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/comprehensive_analytics/`,
    }),

    // Donation Trends
    getCampaignDonationTrends: builder.query<
      {
        daily_trends: Array<{
          day: string
          count: number
          total: number
          avg: number
        }>
        weekly_trends: Array<{
          week_start: string
          week_end: string
          count: number
          total: number
          avg: number
        }>
        period_summary: {
          start_date: string
          end_date: string
          total_days: number
        }
      },
      { id: number; period?: number }
    >({
      query: ({ id, period = 30 }) => `/${backend}/donation-campaigns/${id}/donation_trends/?period=${period}`,
    }),

    // Donor Analysis
    getCampaignDonorAnalysis: builder.query<
      {
        segments: {
          micro: { count: number; total: number; avg: number; unique_donors: number }
          small: { count: number; total: number; avg: number; unique_donors: number }
          medium: { count: number; total: number; avg: number; unique_donors: number }
          large: { count: number; total: number; avg: number; unique_donors: number }
          major: { count: number; total: number; avg: number; unique_donors: number }
        }
        repeat_donors: Array<{
          donor: number
          donation_count: number
          total_donated: number
        }>
        donor_retention: {
          total_donors: number
          repeat_donors_count: number
          first_time_donors_count: number
          retention_rate: number
        }
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/donor_analysis/`,
    }),

    // Payment Analysis
    getCampaignPaymentAnalysis: builder.query<
      {
        payment_methods: Array<{
          payment_method: string
          count: number
          total: number
          avg: number
          total_fees: number
        }>
        processing_efficiency: {
          total_gross: number
          total_fees: number
          total_net: number
          avg_fee_percentage: number
        }
        status_breakdown: Array<{
          status: string
          count: number
          total: number
        }>
        fee_analysis: {
          total_fees: number
          fee_percentage: number
          net_efficiency: number
        }
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/payment_analysis/`,
    }),

    // Bank Account Management
    getBankAccountsForCampaign: builder.query<
      {
        campaign_title: string
        total_accounts: number
        accounts: BankAccount[]
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/bank_accounts/`,
    }),

    addBankAccountToCampaign: builder.mutation<
      BankAccount,
      {
        campaignId: number
        bank_account_id: number
        is_primary?: boolean
        priority_order?: number
        notes?: string
      }
    >({
      query: ({ campaignId, ...data }) => ({
        url: `/${backend}/donation-campaigns/${campaignId}/add_bank_account/`,
        method: "POST",
        body: data,
      }),
    }),

    setPrimaryBankAccount: builder.mutation<
      { message: string; primary_account: string },
      { campaignId: number; bank_account_id: number }
    >({
      query: ({ campaignId, bank_account_id }) => ({
        url: `/${backend}/donation-campaigns/${campaignId}/set_primary_bank_account/`,
        method: "POST",
        body: { bank_account_id },
      }),
    }),

    // Donation Options for Public Display
    getCampaignDonationOptions: builder.query<
      {
        campaign_title: string
        campaign_description: string
        target_amount: number
        current_amount: number
        progress_percentage: number
        currency: string
        primary_account: any
        accounts_by_currency: Record<string, any[]>
        total_accounts: number
        campaign_status: {
          is_active: boolean
          days_remaining: number
          end_date: string
        }
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/donation_options/`,
    }),

    // Update Monetary Fields
    updateCampaignMonetaryFields: builder.mutation<
      {
        message: string
        current_amount: number
        progress_percentage: number
        campaign_status: string
        fundraising_health: string
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/donation-campaigns/${id}/update_monetary_fields/`,
        method: "POST",
      }),
    }),

    // Check Campaign Milestones
    checkCampaignMilestones: builder.mutation<
      {
        progress_percentage: number
        milestones_reached: number[]
        notifications_sent: number
        next_milestone: number | null
        campaign_status: string
        fundraising_health: string
        is_target_reached: boolean
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/donation-campaigns/${id}/check_milestones/`,
        method: "POST",
      }),
    }),

    // Extend Campaign Deadline
    extendCampaignDeadline: builder.mutation<
      {
        message: string
        old_end_date: string
        new_end_date: string
        reason: string
        new_days_remaining: number
        campaign_status: string
      },
      {
        id: number
        new_end_date: string
        reason?: string
      }
    >({
      query: ({ id, new_end_date, reason }) => ({
        url: `/${backend}/donation-campaigns/${id}/extend_deadline/`,
        method: "POST",
        body: { new_end_date, reason },
      }),
    }),

    // Export Campaign Data
    exportCampaignData: builder.mutation<Blob, { id: number; format?: string }>({
      query: ({ id, format = "csv" }) => ({
        url: `/${backend}/donation-campaigns/${id}/export_data/?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Legacy endpoint for backward compatibility
    getCampaignDetailedStatistics: builder.query<
      {
        campaign_info: any
        financial_summary: any
        donation_summary: any
        donor_segments: any
        payment_methods: any[]
        daily_trends: any[]
        milestones: any
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/detailed_statistics/`,
    }),

    // Enhanced detail endpoint with comprehensive data
    getDonationCampaignDetail: builder.query<DonationCampaign, number>({
      query: (id) => `/${backend}/donation-campaigns/${id}/detail/`,
    }),

    // Analytics endpoint (legacy)
    getCampaignAnalytics: builder.query<
      {
        financial_metrics: {
          current_amount: number
          total_donations_amount: number
          total_recurring_amount: number
          total_in_kind_amount: number
          net_donations_amount: number
          progress_percentage: number
          amount_remaining: number
          daily_fundraising_rate: number
          projected_final_amount: number
        }
        donor_metrics: {
          total_donors_count: number
          total_donations_count: number
          average_donation_amount: number
          largest_donation_amount: number
        }
        time_metrics: {
          days_remaining: number
          days_elapsed: number
          time_progress_percentage: number
          campaign_status: string
          fundraising_health: string
        }
        breakdown: any
        performance: any
      },
      number
    >({
      query: (id) => `/${backend}/donation-campaigns/${id}/analytics/`,
    }),
  }),
})

export const {
  // Campaign List and Detail Endpoints
  useGetDonationCampaignsQuery,
  useGetDonationCampaignByIdQuery,
  useGetActiveDonationCampaignsQuery,
  useGetFeaturedDonationCampaignsQuery,
  useCreateDonationCampaignMutation,
  useUpdateDonationCampaignMutation,
  useDeleteDonationCampaignMutation,

  // Campaign Donations
  useGetCampaignDonationsQuery,

  // Dashboard Statistics
  useGetDashboardStatsQuery,

  // Comprehensive Analytics
  useGetCampaignComprehensiveAnalyticsQuery,

  // Donation Trends
  useGetCampaignDonationTrendsQuery,

  // Donor Analysis
  useGetCampaignDonorAnalysisQuery,

  // Payment Analysis
  useGetCampaignPaymentAnalysisQuery,

  // Bank Account Management
  useGetBankAccountsForCampaignQuery,
  useAddBankAccountToCampaignMutation,
  useSetPrimaryBankAccountMutation,

  // Donation Options for Public Display
  useGetCampaignDonationOptionsQuery,

  // Update Monetary Fields
  useUpdateCampaignMonetaryFieldsMutation,

  // Check Campaign Milestones
  useCheckCampaignMilestonesMutation,

  // Extend Campaign Deadline
  useExtendCampaignDeadlineMutation,

  // Export Campaign Data
  useExportCampaignDataMutation,

  // Legacy endpoints
  useGetCampaignDetailedStatisticsQuery,
  useGetDonationCampaignDetailQuery,
  useGetCampaignAnalyticsQuery,
} = donationCampaignsApiSlice
