"use client"

import { useState } from "react"
import { FlutterwavePayment } from "./flutterwave-payment"
import { toast } from "react-toastify"

interface PaymentHandlerProps {
  donationData: {
    id: number
    amount: number
    currency: string
    donor_email: string
    donor_name: string
    donor_phone?: string
    type: "one-time" | "recurring" | "in-kind"
    payment_plan_id?: string
  }
  onComplete: () => void
  onCancel: () => void
}

export function PaymentHandler({ donationData, onComplete, onCancel }: PaymentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentSuccess = (response: any) => {
    setIsProcessing(true)

    // Wait a moment before completing to show success state
    setTimeout(() => {
      setIsProcessing(false)
      onComplete()
    }, 2000)
  }

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error)
    toast.error("Payment failed. Please try again later.")
  }

  return (
    <FlutterwavePayment
      donationDataId={donationData.id}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
      onCancel={onCancel}
    />
  )
}
