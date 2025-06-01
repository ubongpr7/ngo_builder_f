"use client"

import { useState, useEffect } from "react"
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { toast } from "react-toastify"
import {
  useUpdateDonationPaymentStatusMutation,
  useUpdateRecurringDonationPaymentStatusMutation,
  useUpdateInKindDonationPaymentStatusMutation,
  useVerifyFlutterwavePaymentMutation,
} from "@/redux/features/finance/payment"
import { useGetBankAccountByIdQuery } from "@/redux/features/finance/bank-accounts"

interface FlutterwavePaymentProps {
  donationData: {
    id: number
    amount: number
    currency: string
    donor_email: string
    donor_name: string
    donor_phone?: string
    type: "one-time" | "recurring" | "in-kind"
    payment_plan_id?: string
    campaign_id?: string
  }
  onPaymentSuccess: (response: any) => void
  onPaymentError: (error: any) => void
  onCancel: () => void
}

interface FlutterwaveResponse {
  status: string
  transaction_id: string
  tx_ref: string
  flw_ref: string
  amount: number
  currency: string
  customer: {
    email: string
    name: string
    phone_number: string
  }
  payment_type?: string
}

export function FlutterwavePayment({
  donationData,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: FlutterwavePaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [isInitiating, setIsInitiating] = useState(false)
  const [flutterwaveConfig, setFlutterwaveConfig] = useState<any>(null)

  // Fetch bank account data
  const { data: bankAccount, isLoading: isLoadingAccount, error: bankAccountError } = useGetBankAccountByIdQuery(1)

  // Payment status mutations based on donation type
  const [updateDonationPaymentStatus] = useUpdateDonationPaymentStatusMutation()
  const [updateRecurringDonationPaymentStatus] = useUpdateRecurringDonationPaymentStatusMutation()
  const [updateInKindDonationPaymentStatus] = useUpdateInKindDonationPaymentStatusMutation()
  const [verifyPayment] = useVerifyFlutterwavePaymentMutation()

  // Generate unique transaction reference
  const tx_ref = `donation_${donationData.type}_${donationData.id}_${Date.now()}`

  // Initialize Flutterwave config when bank account data is available
  useEffect(() => {
    if (bankAccount?.api_key) {
      const config = {
        public_key: bankAccount.api_key,
        tx_ref,
        amount: donationData.amount,
        currency: donationData.currency,
        payment_options: donationData.type === "recurring" ? "card" : "card,banktransfer,mobilemoney,ussd",
        ...(donationData.type === "recurring" &&
          donationData.payment_plan_id && {
            payment_plan: donationData.payment_plan_id,
          }),
        customer: {
          email: donationData.donor_email,
          phone_number: donationData.donor_phone || "",
          name: donationData.donor_name,
        },
        customizations: {
          title: "Donation Payment",
          description: `${donationData.type === "recurring" ? "Recurring" : "One-time"} donation payment`,
          logo: "/logo.png",
        },
        meta: {
          donation_id: donationData.id,
          donation_type: donationData.type,
          campaign_id: donationData.campaign_id || null,
          donor_email: donationData.donor_email,
        },
      }
      setFlutterwaveConfig(config)
    }
  }, [bankAccount, donationData, tx_ref])

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig || {})

  const getPaymentStatusMutation = () => {
    switch (donationData.type) {
      case "one-time":
        return updateDonationPaymentStatus
      case "recurring":
        return updateRecurringDonationPaymentStatus
      case "in-kind":
        return updateInKindDonationPaymentStatus
      default:
        return updateDonationPaymentStatus
    }
  }

  const handlePaymentUpdate = async (response: FlutterwaveResponse, status: string) => {
    try {
      const updateMutation = getPaymentStatusMutation()

      await updateMutation({
        id: donationData.id,
        data: {
          status,
          transaction_data: {
            flutterwave_ref: response.flw_ref,
            transaction_id: response.transaction_id,
            tx_ref: response.tx_ref,
            amount: response.amount,
            currency: response.currency,
            payment_method: response.payment_type || "card",
            processed_at: new Date().toISOString(),
          },
        },
      }).unwrap()

      return true
    } catch (error) {
      console.error("Error updating payment status:", error)
      return false
    }
  }

  const initiatePayment = () => {
    if (!flutterwaveConfig?.public_key) {
      toast.error("Payment system not configured. Please contact support.")
      return
    }

    setIsInitiating(true)
    setPaymentStatus("processing")

    handleFlutterPayment({
      callback: async (response: FlutterwaveResponse) => {
        console.log("Payment response:", response)

        if (response.status === "successful") {
          setPaymentStatus("success")
          toast.success("Payment successful!")
          onPaymentSuccess(response)
        } else {
          setPaymentStatus("failed")
          toast.error("Payment failed. Please try again.")
          onPaymentError(response)
        }

        closePaymentModal()
        setIsInitiating(false)
      },
      onClose: () => {
        console.log("Payment modal closed")
        setIsInitiating(false)
        if (paymentStatus === "processing") {
          setPaymentStatus("idle")
        }
      },
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Show loading state while fetching bank account
  if (isLoadingAccount) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Payment System</h3>
          <p className="text-gray-600 text-center">Please wait while we set up your payment...</p>
        </CardContent>
      </Card>
    )
  }

  // Show error state if bank account fetch failed
  if (bankAccountError) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment System Error</h3>
          <p className="text-gray-600 text-center mb-4">
            Unable to load payment configuration. Please try again or contact support.
          </p>
          <div className="flex gap-2 w-full">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              Retry
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error if no API key found
  if (!bankAccount?.api_key) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Configuration Missing</h3>
          <p className="text-gray-600 text-center mb-4">
            Payment system is not properly configured. Please contact support.
          </p>
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
          <p className="text-gray-600 text-center mb-4">
            Thank you for your {donationData.type} donation of{" "}
            {formatAmount(donationData.amount, donationData.currency)}.
          </p>
          <Button onClick={() => (window.location.href = "/donations")} className="w-full">
            View Donations
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === "failed") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
          <p className="text-gray-600 text-center mb-4">
            We couldn't process your payment. Please try again or contact support.
          </p>
          <div className="flex gap-2 w-full">
            <Button onClick={() => setPaymentStatus("idle")} variant="outline" className="flex-1">
              Try Again
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          {donationData.type === "recurring" ? "Set up recurring payment" : "Complete your donation"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold">{formatAmount(donationData.amount, donationData.currency)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Type:</span>
            <span className="font-semibold capitalize">{donationData.type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Donor:</span>
            <span className="font-semibold">{donationData.donor_name}</span>
          </div>
        </div>

        {/* Debug Information - Remove in production */}
        <div className="bg-green-50 p-3 rounded-lg text-sm">
          <p>
            <strong>Payment System Ready:</strong>
          </p>
          <p>API Key: {bankAccount.api_key ? `${bankAccount.api_key.substring(0, 15)}...` : "Not found"}</p>
          <p>Config Ready: {flutterwaveConfig ? "✅ Yes" : "❌ No"}</p>
        </div>

        <Button onClick={initiatePayment} disabled={isInitiating || !flutterwaveConfig?.public_key} className="w-full">
          {isInitiating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatAmount(donationData.amount, donationData.currency)}`
          )}
        </Button>

        <Button onClick={onCancel} variant="outline" className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  )
}
