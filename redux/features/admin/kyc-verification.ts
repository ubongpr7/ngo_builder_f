import { apiSlice } from "../../services/apiSlice"

// Define interfaces for KYC data
export interface KYCVerificationRequest {
  action: "approve" | "reject"
  reason?: string
}

export interface KYCVerificationResponse {
  message: string
  profile: any
}

export interface KYCDocumentsResponse {
  id_document_type: string
  id_document_number: string
  id_document_image_front: string | null
  id_document_image_back: string | null
  selfie_image: string | null
  kyc_submission_date: string
  is_kyc_verified: boolean
  kyc_verification_date: string | null
  kyc_rejection_reason: string | null
}

const management_api = "profile_api"

export const kycApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get pending KYC submissions
    getPendingKYCSubmissions: builder.query({
      query: () => ({
        url: `/${management_api}/user-profiles/`,
        params: { kyc_status: "pending" },
      }),
    }),

    // Get KYC documents for a specific profile
    getKYCDocuments: builder.query<KYCDocumentsResponse, number>({
      query: (profileId) => `/${management_api}/user-profiles/${profileId}/kyc_documents/`,
    }),

    // Verify or reject KYC submission
    verifyKYC: builder.mutation<KYCVerificationResponse, { profileId: number; data: KYCVerificationRequest }>({
      query: ({ profileId, data }) => ({
        url: `/${management_api}/user-profiles/${profileId}/verify_kyc/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const { useGetPendingKYCSubmissionsQuery, useGetKYCDocumentsQuery, useVerifyKYCMutation } = kycApiSlice
