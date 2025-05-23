"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DollarSign, Calendar, User, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { AddEditDonationDialog } from "./add-edit-donation-dialog"
import { useDeleteDonationMutation } from "@/redux/features/finance/financeApiSlice"
import type { Donation } from "@/types/finance"

interface DonationCardProps {
  donation: Donation
}

export function DonationCard({ donation }: DonationCardProps) {
  const [deleteDonation] = useDeleteDonationMutation()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 border-red-300"
      case "refunded":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await deleteDonation(donation.id).unwrap()
      } catch (error) {
        console.error("Failed to delete donation:", error)
      }
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-500">
            {donation.donation_type === "recurring" ? "Recurring" : "One-time"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(donation.status)}>{donation.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddEditDonationDialog
                donation={donation}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(donation.amount)}</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <User className="mr-1 h-3 w-3" />
              {donation.is_anonymous ? "Anonymous" : donation.donor_name_display || "Unknown Donor"}
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(donation.donation_date)}
          </div>

          {donation.campaign_title && (
            <div className="text-sm">
              <span className="text-gray-500">Campaign:</span>
              <span className="ml-1 font-medium">{donation.campaign_title}</span>
            </div>
          )}

          {donation.payment_method && (
            <div className="text-sm">
              <span className="text-gray-500">Payment:</span>
              <span className="ml-1 capitalize">{donation.payment_method.replace("_", " ")}</span>
            </div>
          )}

          {donation.notes && <div className="text-sm text-gray-600 line-clamp-2">{donation.notes}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
