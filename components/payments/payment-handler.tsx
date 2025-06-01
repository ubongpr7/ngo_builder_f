"use client"

import { useState } from "react"
import { FlutterwavePayment } from "./flutterwave-payment"

interface PaymentHandlerProps {
  donationData: number
  onComplete: () => void
  onCancel: () => void
}

export function PaymentHandler({ donationData, onComplete, onCancel }: PaymentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentSuccess = (response: any) => {
    setIsProcessing(true)

    // Show success message and complete after a short delay
    setTimeout(() => {
      setIsProcessing(false)
      onComplete()
    }, 1500)
  }

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error)
    // Don't show additional toast here as it's already shown in FlutterwavePayment
    // Just call onCancel to go back to the form
    onCancel()
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <FlutterwavePayment
      donationDataId={donationData.id}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
      onCancel={handleCancel}
    />
  )
}
