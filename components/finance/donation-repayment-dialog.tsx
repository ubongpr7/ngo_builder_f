"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Repeat, Loader2 } from "lucide-react"
import { useCreateDonationMutation } from "@/redux/features/finance/financeApiSlice"
import { useAuth } from "@/redux/features/users/useAuth"
import { toast } from "react-toastify"
import { format } from "date-fns"
import type { Donation } from "@/types/finance"

interface DonationRepaymentDialogProps {
  donation: Donation
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function DonationRepaymentDialog({ donation, onSuccess, trigger }: DonationRepaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [createDonation, { isLoading }] = useCreateDonationMutation()
  const { user } = useAuth()

  const handleRepayment = async () => {
    try {
      const currentDate = new Date().toISOString()
      const userName =
        user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || "Unknown User"

      // Create new donation with same details but current date and pending status
      const repaymentData = {
        donor: donation.donor,
        campaign: donation.campaign,
        project: donation.project,
        amount: donation.amount,
        donation_type: donation.donation_type,
        donation_date: currentDate,
        payment_method: donation.payment_method,
        status: "pending",
        is_anonymous: donation.is_anonymous,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        tax_deductible: donation.tax_deductible,
        notes: `Repayment of donation #${donation.id} - Created by: ${userName} on ${format(new Date(), "PPp")}`,
      }

      await createDonation(repaymentData).unwrap()

      toast.success("Repayment donation created successfully")
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create repayment:", error)
      toast.error("Failed to create repayment donation")
    }
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
            <Repeat className="h-4 w-4 mr-1" />
            Make Repayment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Repayment Donation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create a new donation with the same details as the original donation.
          </p>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                  <span className="font-semibold">{formatCurrency(donation.amount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {donation.donation_type.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Method:</span>
                <span className="text-sm capitalize">{donation.payment_method.replace("_", " ")}</span>
              </div>

              {donation.campaign_title && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Campaign:</span>
                  <span className="text-sm">{donation.campaign_title}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Original Date:</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm">
                    {donation.donation_date ? format(new Date(donation.donation_date), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Date:</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-semibold text-green-600">{format(new Date(), "MMM d, yyyy")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Status:</span>
                <Badge variant="secondary">PENDING</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The new donation will be created with "pending" status and will need to be
              processed separately.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRepayment} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Repayment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
