import { apiSlice } from "../../services/apiSlice"
import type { FinancialSummary, CampaignPerformance, BudgetUtilization } from "../../../types/finance"

const backend = "finance_api"

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Financial Overview
    getFinancialOverview: builder.query<
      {
        period: string
        date_range: {
          start: string | null
          end: string
        }
        financial_summary: {
          total_donations: number
          total_grants_received: number
          total_expenses: number
          net_income: number
          total_account_balance: number
          total_budget_allocated: number
          total_budget_spent: number
          budget_utilization_percentage: number
        }
        activity_counts: {
          active_campaigns: number
          active_grants: number
          pending_expenses: number
          overdue_reports: number
          active_accounts: number
        }
        health_indicators: {
          financial_health: "good" | "concerning"
          budget_health: "good" | "warning" | "critical"
          liquidity_health: "good" | "warning" | "critical"
          liquidity_ratio: number
        }
      },
      {
        period?: "month" | "quarter" | "year" | "all"
      }
    >({
      query: ({ period = "month" } = {}) => `/${backend}/dashboard/financial_overview/?period=${period}`,
    }),

    // Donation Analytics
    getDonationAnalytics: builder.query<
      {
        period: string
        summary: {
          total_donations: number
          total_amount: number
          average_donation: number
          largest_donation: number
        }
        daily_trends: Array<{
          day: string
          count: number
          total: number
          avg: number
        }>
        payment_methods: Array<{
          payment_method: string
          count: number
          total: number
          percentage: number
        }>
        donor_stats: {
          total_donors: number
          anonymous_donations: number
          repeat_donors: number
        }
        amount_segments: {
          micro: number
          small: number
          medium: number
          large: number
          major: number
        }
        top_campaigns: Array<{
          campaign__title: string
          campaign__id: number
          total_raised: number
          donation_count: number
          avg_donation: number
        }>
      },
      {
        days?: number
      }
    >({
      query: ({ days = 30 } = {}) => `/${backend}/dashboard/donation_analytics/?days=${days}`,
    }),

    // Budget Performance
    getBudgetPerformance: builder.query<
      {
        summary: {
          total_budgets: number
          total_allocated: number
          total_spent: number
          overall_utilization: number
        }
        alerts: {
          over_budget_count: number
          near_limit_count: number
          total_alerts: number
        }
        by_type: Array<{
          budget_type: string
          count: number
          total_allocated: number
          total_spent: number
          avg_utilization: number
        }>
        by_department: Array<{
          department__name: string
          total_allocated: number
          total_spent: number
          utilization: number
        }>
        monthly_trends: Array<{
          month: string
          total: number
          count: number
        }>
      },
      {
        fiscal_year?: string
      }
    >({
      query: ({ fiscal_year } = {}) => {
        const params = fiscal_year ? `?fiscal_year=${fiscal_year}` : ""
        return `/${backend}/dashboard/budget_performance/${params}`
      },
    }),

    // Grant Pipeline
    getGrantPipeline: builder.query<
      {
        summary: {
          total_grants: number
          success_rate: number
          total_pipeline_value: number
          active_grants: number
        }
        pipeline_status: Array<{
          status: string
          count: number
          total_amount: number
          avg_amount: number
        }>
        disbursement_summary: {
          total_approved: number
          total_received: number
          pending_disbursement: number
        }
        top_grantors: Array<{
          grantor: string
          grantor_type: string
          grant_count: number
          total_amount: number
          avg_amount: number
        }>
        upcoming_deadlines: Array<{
          grant_title: string
          report_type: string
          due_date: string
          days_until_due: number
        }>
      },
      void
    >({
      query: () => `/${backend}/dashboard/grant_pipeline/`,
    }),

    // Cash Flow Forecast
    getCashFlowForecast: builder.query<
      {
        forecast_period_days: number
        current_balance: number
        projected_income: {
          recurring_donations: number
          expected_grants: number
          total: number
        }
        projected_expenses: {
          pending_approved: number
          estimated_recurring: number
          total: number
        }
        projected_balance: number
        cash_flow_health: "healthy" | "concerning" | "critical"
      },
      {
        days?: number
      }
    >({
      query: ({ days = 90 } = {}) => `/${backend}/dashboard/cash_flow_forecast/?days=${days}`,
    }),

    // Monthly Trends
    getMonthlyTrends: builder.query<
      Array<{
        month: string
        donations_total: number
        donations_count: number
        expenses_total: number
        expenses_count: number
        net_income: number
      }>,
      {
        months?: number
      }
    >({
      query: ({ months = 12 } = {}) => `/${backend}/dashboard/monthly_trends/?months=${months}`,
    }),

    // Campaign Performance
    getCampaignPerformance: builder.query<CampaignPerformance[], void>({
      query: () => `/${backend}/dashboard/campaign_performance/`,
    }),

    // Budget Utilization
    getBudgetUtilization: builder.query<BudgetUtilization[], void>({
      query: () => `/${backend}/dashboard/budget_utilization/`,
    }),

    // Financial Summary (legacy endpoint)
    getFinancialSummary: builder.query<
      FinancialSummary,
      {
        start_date?: string
        end_date?: string
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
        return `/${backend}/dashboard/financial_summary/${queryString ? `?${queryString}` : ""}`
      },
    }),
  }),
})

export const {
  useGetFinancialOverviewQuery,
  useGetDonationAnalyticsQuery,
  useGetBudgetPerformanceQuery,
  useGetGrantPipelineQuery,
  useGetCashFlowForecastQuery,
  useGetMonthlyTrendsQuery,
  useGetCampaignPerformanceQuery,
  useGetBudgetUtilizationQuery,
  useGetFinancialSummaryQuery,
} = dashboardApiSlice
