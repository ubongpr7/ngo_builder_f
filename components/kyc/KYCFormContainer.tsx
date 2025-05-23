"use client"

import { useGetProfileQuery } from "@/redux/features/profile/profileAPISlice"
import { VerifiedUserKYCForm } from "./VerifiedUserKYCForm"
import { UnverifiedUserKYCForm } from "./UnverifiedUserKYCForm"
import { Card, CardContent } from "@/components/ui/card"
import type { KYCFormContainerProps } from "./types"

export default function KYCFormContainer({ profileId, userId }: KYCFormContainerProps) {
  const { data: userProfile, isLoading: isProfileLoading } = useGetProfileQuery(profileId, { skip: !profileId })

  const isKycVerified = userProfile?.is_kyc_verified && userProfile?.kyc_status === "approved"

  if (isProfileLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-4 sm:p-8">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return isKycVerified ? (
    <VerifiedUserKYCForm profileId={profileId} userId={userId} />
  ) : (
    <UnverifiedUserKYCForm profileId={profileId} userId={userId} />
  )
}
