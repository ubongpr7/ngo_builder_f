import type { Metadata } from "next"
import KYCVerificationForm from "@/components/membership/KYCVerificationForm"

export const metadata: Metadata = {
  title: "Account Verification | Destiny Builders",
  description: "Complete your account verification to access all membership features",
}

export default function VerificationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        Please complete your verification to activate your Destiny Builders membership
      </h1>
      <KYCVerificationForm />
    </div>
  )
}
