"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Calendar, User, DollarSign } from "lucide-react"
import { AddEditDonationDialog } from "./add-edit-donation-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { format } from "date-fns"
import type { Donation } from "@/types/finance"

interface DonationCardProps {
  donation: Donation
  onUpdate?: () => void
}

export function DonationCard({ donation, onUpdate }: DonationCardProps) {
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  // Format date
  const donationDate = donation.donation_date ? format(new Date(donation.donation_date), "MMM d, yyyy") : "N/A"

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Get donor name display
  const donorName = donation.is_anonymous
    ? "Anonymous"
    : donation.donor_name_display || donation.donor_name || "Unknown"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-green-600" />
            <span className="font-semibold text-lg">${donation.amount.toFixed(2)}</span>
          </div>
          <Badge variant={getStatusVariant(donation.status) as any}>{donation.status}</Badge>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm">
            <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-gray-700">{donorName}</span>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-gray-700">{donationDate}</span>
          </div>

          {donation.campaign_title && (
            <div className="text-sm text-gray-700">
              <span className="text-gray-500">Campaign: </span>
              {donation.campaign_title}
            </div>
          )}

          {donation.notes && <p className="text-sm text-gray-500 line-clamp-2 mt-2">{donation.notes}</p>}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 border-t flex justify-between">
        <div className="text-sm text-gray-500">
          <Badge variant="outline">{donation.donation_type}</Badge>
        </div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={`/dashboard/finance/donations/${donation.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>

          {is_DB_admin && (
            <AddEditDonationDialog
              donation={donation}
              onSuccess={onUpdate}
              trigger={
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              }
            />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
