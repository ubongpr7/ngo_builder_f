import type { Metadata } from "next"
import KYCVerificationForm from "@/components/membership/KYCVerificationForm"

export const metadata: Metadata = {
  title: "Account Verification | Destiny Builders",
  description: "Complete your account verification to access all membership features",
}

export default function VerificationPage() {
  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 px-2">Complete your verification</h1>
      <KYCVerificationForm />
    </div>
  )
}
