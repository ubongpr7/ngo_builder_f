import KYCVerificationPanel from "@/src/components/admin/KYCVerificationPanel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KYC Verification | Admin Dashboard",
  description: "Verify user KYC submissions",
}

export default function KYCVerificationPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>
      <KYCVerificationPanel />
    </div>
  )
}
