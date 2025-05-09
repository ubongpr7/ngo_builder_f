import { apiSlice } from "../../services/apiSlice"

const management_api = "profile_api"

// Define interfaces for the API responses
export interface KYCProfile {
  id: number
  full_name: string
  email: string
  phone_number: string
  profile_image: string | null
  kyc_status: "pending" | "approved" | "rejected" | "flagged" | "scammer"
  kyc_submission_date: string
  kyc_verification_date: string | null
  kyc_rejection_reason: string | null
  organization: string | null
  position: string | null
  membership_type_name: string | null
  role_summary: string[]
}

export interface KYCStats {
  pending: number
  approved: number
  rejected: number
  flagged: number
  scammer: number
  total: number
}

export interface KYCDocuments {
  id: number
  user_full_name: string
  user_email: string
  id_document_type: string
  id_document_number: string
  id_document_image_front: string | null
  id_document_image_back: string | null
  selfie_image: string | null
  kyc_submission_date: string
  kyc_status: string
  kyc_verification_date: string | null
  kyc_rejection_reason: string | null
}

export interface KYCVerificationRequest {
  action: "approve" | "reject" | "flag" | "mark_scammer"
  reason?: string
}

export interface KYCVerificationResponse {
  message: string
  profile: KYCProfile
}

export interface KYCBulkVerificationRequest {
  profile_ids: number[]
  action: "approve" | "reject" | "flag" | "mark_scammer"
  reason?: string
}

export interface KYCBulkVerificationResponse {
  message: string
  updated_count: number
}

export const kycApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKYCStats: builder.query<KYCStats, void>({
      query: () => ({
        url: `/${management_api}/user-profiles/kyc_stats/`,
        method: "GET",
      }),
    }),

    // Get all KYC submissions grouped by status
    getAllKYCSubmissions: builder.query<Record<string, KYCProfile[]>, void>({
      query: () => ({
        url: `/${management_api}/user-profiles/kyc_all/`,
        method: "GET",
      }),
    }),

    // Get KYC submissions by status
    getKYCSubmissionsByStatus: builder.query<KYCProfile[], string>({
      query: (status) => ({
        url: `/${management_api}/user-profiles/`,
        method: "GET",
        params: { kyc_status: status },
      }),
    }),

    // Search KYC submissions
    searchKYCSubmissions: builder.query<KYCProfile[], string>({
      query: (searchTerm) => ({
        url: `/${management_api}/user-profiles/`,
        method: "GET",
        params: { search: searchTerm },
      }),
    }),

    // Get KYC documents for a specific profile
    getKYCDocuments: builder.query<KYCDocuments, number>({
      query: (profileId) => ({
        url: `/${management_api}/user-profiles/${profileId}/kyc_documents/`,
        method: "GET",
      }),
    }),

    // Verify or reject KYC submission
    verifyKYC: builder.mutation<KYCVerificationResponse, { profileId: number; data: KYCVerificationRequest }>({
      query: ({ profileId, data }) => ({
        url: `/${management_api}/user-profiles/${profileId}/verify_kyc/`,
        method: "POST",
        body: data,
      }),
    }),

    // Bulk verify KYC submissions
    bulkVerifyKYC: builder.mutation<KYCBulkVerificationResponse, KYCBulkVerificationRequest>({
      query: (data) => ({
        url: `/${management_api}/user-profiles/bulk_verify/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useGetKYCStatsQuery,
  useGetAllKYCSubmissionsQuery,
  useGetKYCSubmissionsByStatusQuery,
  useSearchKYCSubmissionsQuery,
  useGetKYCDocumentsQuery,
  useVerifyKYCMutation,
  useBulkVerifyKYCMutation,
} = kycApiSlice
