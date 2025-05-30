import { apiSlice } from "../../services/apiSlice"
import type { DonationCampaign, Donation, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const donationCampaignsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

    // Get campaign by ID
    getDonationCampaignById: builder.query<DonationCampaign, number>({
      query: (id) => `/${backend}/donation-campaigns/${id}/`,
    }),

    // Get active campaigns
    getActiveDonationCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/donation-campaigns/?is_active=true`,
    }),

    // Get featured campaigns
    getFeaturedDonationCampaigns: builder.query<DonationCampaign[], void>({
      query: () => `/${backend}/donation-campaigns/?is_featured=true`,
    }),

    // Create campaign
    createDonationCampaign: builder.mutation({
      query: (campaign) => ({
        url: `/${backend}/donation-campaigns/`,
        method: "POST",
        body: campaign,
      }),
    }),

    // Update campaign
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

    // Delete campaign
    deleteDonationCampaign: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/donation-campaigns/${id}/`,
        method: "DELETE",
      }),
    }),

    // Get campaign donations
    getCampaignDonations: builder.query<
      PaginatedResponse<Donation>,
      {
        campaignId: number
        start_date?: string
        end_date?: string
        min_amount?: number
        max_amount?: number
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

    // Get detailed campaign statistics
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

    // Check campaign milestones
    checkCampaignMilestones: builder.mutation<
      {
        progress_percentage: number
        milestones_reached: number[]
        notifications_sent: number
      },
      number
    >({
      query: (id) => ({
        url: `/${backend}/donation-campaigns/${id}/check_milestones/`,
        method: "POST",
      }),
    }),

    // Extend campaign deadline
    extendCampaignDeadline: builder.mutation<
      {
        message: string
        old_end_date: string
        new_end_date: string
      },
      {
        id: number
        new_end_date: string
      }
    >({
      query: ({ id, new_end_date }) => ({
        url: `/${backend}/donation-campaigns/${id}/extend_deadline/`,
        method: "POST",
        body: { new_end_date },
      }),
    }),
  }),
})

export const {
  useGetDonationCampaignsQuery,
  useGetDonationCampaignByIdQuery,
  useGetActiveDonationCampaignsQuery,
  useGetFeaturedDonationCampaignsQuery,
  useCreateDonationCampaignMutation,
  useUpdateDonationCampaignMutation,
  useDeleteDonationCampaignMutation,
  useGetCampaignDonationsQuery,
  useGetCampaignDetailedStatisticsQuery,
  useCheckCampaignMilestonesMutation,
  useExtendCampaignDeadlineMutation,
} = donationCampaignsApiSlice
