
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

  export const kycApiSlice = createApi({
    reducerPath: "kycApi",
    baseQuery: fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
      prepareHeaders: (headers, { getState }) => {
        // Get token from auth state
        const token = (getState() as RootState).auth.token
  
        if (token) {
          headers.set("authorization", `Token ${token}`)
        }
        return headers
      },
    }),
    tagTypes: ["KYC", "Profile"],
    endpoints: (builder) => ({
      // Get pending KYC submissions
      getPendingKYCSubmissions: builder.query({
        query: () => ({
          url: "profiles",
          params: { kyc_status: "pending" },
        }),
        providesTags: ["KYC"],
      }),
  
      // Get KYC documents for a specific profile
      getKYCDocuments: builder.query<KYCDocumentsResponse, number>({
        query: (profileId) => `profiles/${profileId}/kyc_documents/`,
        providesTags: (result, error, profileId) => [{ type: "KYC", id: profileId }],
      }),
  
      // Verify or reject KYC submission
      verifyKYC: builder.mutation<KYCVerificationResponse, { profileId: number; data: KYCVerificationRequest }>({
        query: ({ profileId, data }) => ({
          url: `profiles/${profileId}/verify_kyc/`,
          method: "POST",
          body: data,
        }),
        invalidatesTags: (result, error, { profileId }) => [{ type: "KYC", id: profileId }, "KYC", "Profile"],
      }),
    }),
  })
  
  export const { useGetPendingKYCSubmissionsQuery, useGetKYCDocumentsQuery, useVerifyKYCMutation } = kycApiSlice
    