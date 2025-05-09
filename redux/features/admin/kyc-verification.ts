import { apiSlice } from "../../services/apiSlice"

// Define interfaces for KYC data
export interface KYCUser {
  id: number
  name: string
  first_name: string
  last_name: string
  email: string
  membershipType: string
  submissionDate: string
  documentType: string
  profile_image?: string
  kyc_status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'scammer'
  kyc_rejection_reason?: string
  kyc_verification_date?: string
}

export interface KYCVerificationRequest {
  action: "approve" | "reject" | "flag" | "mark_scammer"
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
  kyc_status: string
}

const management_api = "profile_api"

export const kycApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get KYC submissions by status
    getKYCSubmissions: builder.query<{ results: KYCUser[] }, string>({
      query: (status) => ({
        url: `/${management_api}/profiles/`,
        params: { kyc_status: status },
      }),
    }),
    
    // Get all KYC submissions
    getAllKYCSubmissions: builder.query<{ 
      pending: KYCUser[], 
      approved: KYCUser[], 
      rejected: KYCUser[],
      flagged: KYCUser[],
      scammer: KYCUser[]
    }, void>({
      query: () => `/${management_api}/profiles/kyc_all/`,
    }),

    // Search KYC submissions
    searchKYCSubmissions: builder.query<{ results: KYCUser[] }, string>({
      query: (searchTerm) => ({
        url: `/${management_api}/profiles/`,
        params: { search: searchTerm },
      }),
    }),

    // Get KYC documents for a specific profile
    getKYCDocuments: builder.query<KYCDocumentsResponse, number>({
      query: (profileId) => `/${management_api}/profiles/${profileId}/kyc_documents/`,
    }),

    // Verify or reject KYC submission
    updateKYCStatus: builder.mutation<KYCVerificationResponse, { profileId: number; data: KYCVerificationRequest }>({
      query: ({ profileId, data }) => ({
        url: `/${management_api}/profiles/${profileId}/verify_kyc/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const { 
  useGetKYCSubmissionsQuery,
  useGetAllKYCSubmissionsQuery,
  useSearchKYCSubmissionsQuery,
  useGetKYCDocumentsQuery,
  useUpdateKYCStatusMutation
} = kycApiSlice
