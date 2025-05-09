"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRequestEditCodeMutation, useVerifyEditCodeMutation } from "@/redux/features/admin/kyc-verification"

interface VerificationCodeDialogProps {
  isOpen: boolean
  onClose: () => void
  profileId: number
  onVerificationSuccess: (profileData: any) => void
}

export function VerificationCodeDialog({
  isOpen,
  onClose,
  profileId,
  onVerificationSuccess,
}: VerificationCodeDialogProps) {
  const [step, setStep] = useState<"request" | "verify">("request")
  const [verificationCode, setVerificationCode] = useState("")
  const { toast } = useToast()

  const [requestCode, { isLoading: isRequestingCode }] = useRequestEditCodeMutation()
  const [verifyCode, { isLoading: isVerifyingCode }] = useVerifyEditCodeMutation()

  const handleRequestCode = async () => {
    try {
      const response = await requestCode(profileId).unwrap()

      toast({
        title: "Code Sent",
        description: response.message,
      })

      setStep("verify")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.error || "Failed to send verification code",
        variant: "destructive",
      })
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await verifyCode({
        profileId,
        code: verificationCode,
      }).unwrap()

      toast({
        title: "Success",
        description: response.message,
      })

      onVerificationSuccess(response.profile)
      handleClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.error || "Failed to verify code",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setStep("request")
    setVerificationCode("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === "request" ? "Request Verification Code" : "Enter Verification Code"}</DialogTitle>
          <DialogDescription>
            {step === "request"
              ? "A verification code will be sent to the user's email. They must share this code with you to allow profile editing."
              : "Enter the verification code provided by the user to continue with profile editing."}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <p className="text-sm text-gray-500">
                  The user will receive an email with a 6-digit verification code. This code will expire in 15 minutes.
                </p>
                <p className="text-sm font-medium text-amber-600">
                  Important: The user should only share this code if they are physically present with you.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="verification-code" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === "request" ? (
            <Button onClick={handleRequestCode} disabled={isRequestingCode}>
              {isRequestingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          ) : (
            <Button onClick={handleVerifyCode} disabled={isVerifyingCode || !verificationCode}>
              {isVerifyingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
