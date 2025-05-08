import { Shield, AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface VerificationStatusBannerProps {
  isVerified: boolean
  verificationStatus?: string
  rejectionReason?: string
  className?: string
}

export function VerificationStatusBanner({
  isVerified,
  verificationStatus = "pending",
  rejectionReason,
  className,
}: VerificationStatusBannerProps) {
  // If verified, show success banner
  if (isVerified) {
    return (
      <Alert className={`bg-green-50 border-green-200 ${className}`}>
        <Shield className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Verified Account</AlertTitle>
        <AlertDescription className="text-green-700">
          Your identity has been verified. You now have full access to all platform features.
        </AlertDescription>
      </Alert>
    )
  }

  // If pending, show pending banner
  if (verificationStatus === "pending") {
    return (
      <Alert className={`bg-yellow-50 border-yellow-200 ${className}`}>
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Verification in Progress</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Your verification is being processed. This usually takes 1-2 business days.
        </AlertDescription>
      </Alert>
    )
  }

  // If rejected, show rejection banner
  if (verificationStatus === "rejected") {
    return (
      <Alert className={`bg-red-50 border-red-200 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Verification Failed</AlertTitle>
        <AlertDescription className="text-red-700">
          <p>{rejectionReason || "Your verification could not be completed. Please try again."}</p>
          <Button
            asChild
            variant="outline"
            className="mt-2 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
          >
            <Link href="/kyc">Try Again</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Default: not verified
  return (
    <Alert className={`bg-gray-50 border-gray-200 ${className}`}>
      <Shield className="h-4 w-4 text-gray-600" />
      <AlertTitle className="text-gray-800">Verify Your Identity</AlertTitle>
      <AlertDescription className="text-gray-700">
        <p>Complete identity verification to access all platform features.</p>
        <Button asChild variant="outline" className="mt-2 border-green-600 text-green-700 hover:bg-green-50">
          <Link href="/kyc">Verify Now</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
