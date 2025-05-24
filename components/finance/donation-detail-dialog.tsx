"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, DollarSign, CreditCard, FileText, Hash, Receipt, Building, Eye, Loader2 } from "lucide-react"
import { useGetDonationByIdQuery } from "@/redux/features/finance/financeApiSlice"
import { format } from "date-fns"

interface DonationDetailDialogProps {
  donationId: number
  trigger?: React.ReactNode
}

export function DonationDetailDialog({ donationId, trigger }: DonationDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    data: donation,
    isLoading,
    error,
  } = useGetDonationByIdQuery(donationId, {
    skip: !open,
  })

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
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
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Donation Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load donation details</p>
          </div>
        ) : donation ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-2xl font-bold">{formatCurrency(donation.amount)}</h3>
                  <p className="text-sm text-gray-500">Donation #{donation.id}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(donation.status) as any} className="text-sm">
                {donation.status.toUpperCase()}
              </Badge>
            </div>

            <Separator />

            {/* Donor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Donor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm">
                      {donation.is_anonymous ? "Anonymous" : donation.donor_name_display || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">
                      {donation.is_anonymous ? "Hidden" : donation.donor_email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Anonymous Donation</label>
                  <p className="text-sm">{donation.is_anonymous ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Donation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Donation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm capitalize">{donation.donation_type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-sm">
                      {donation.donation_date ? format(new Date(donation.donation_date), "PPP") : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-sm capitalize">{donation.payment_method.replace("_", " ")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax Deductible</label>
                    <p className="text-sm">{donation.tax_deductible ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign/Project Information */}
            {(donation.campaign_title || donation.project_title) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {donation.campaign_title && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Campaign</label>
                      <p className="text-sm">{donation.campaign_title}</p>
                    </div>
                  )}
                  {donation.project_title && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Project</label>
                      <p className="text-sm">{donation.project_title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transaction Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Transaction Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                    <p className="text-sm font-mono">{donation.transaction_id || "Not available"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Number</label>
                    <p className="text-sm font-mono">{donation.reference_number || "Not available"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Receipt Number</label>
                    <p className="text-sm font-mono">{donation.receipt_number || "Not generated"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Receipt Sent</label>
                    <p className="text-sm">{donation.receipt_sent ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  Processing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Processed By</label>
                    <p className="text-sm">{donation.processed_by_name || "System"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm">
                      {donation.created_at ? format(new Date(donation.created_at), "PPp") : "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">
                    {donation.updated_at ? format(new Date(donation.updated_at), "PPp") : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {donation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{donation.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
