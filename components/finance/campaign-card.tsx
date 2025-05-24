"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Calendar } from "lucide-react"
import { AddEditCampaignDialog } from "./add-edit-campaign-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { format } from "date-fns"
import type { DonationCampaign } from "@/types/finance"

interface CampaignCardProps {
  campaign: DonationCampaign
  onUpdate?: () => void
}

export function CampaignCard({ campaign, onUpdate }: CampaignCardProps) {
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  // Calculate if campaign is active based on dates and is_active flag
  const isActive =
    campaign.is_active && new Date(campaign.start_date) <= new Date() && new Date(campaign.end_date) >= new Date()

  // Format dates
  const startDate = format(new Date(campaign.start_date), "MMM d, yyyy")
  const endDate = format(new Date(campaign.end_date), "MMM d, yyyy")

  // Calculate progress percentage
  const progressPercentage = campaign.progress_percentage || (campaign.current_amount / campaign.target_amount) * 100

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
        </div>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{campaign.description}</p>

        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>
              {startDate} - {endDate}
            </span>
          </div>

          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-1 text-sm">
              <span>${Number(campaign.current_amount).toFixed(2)}</span>
              <span className="text-gray-500">${Number(campaign.target_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 border-t flex justify-between">
        <div className="text-sm text-gray-500">{campaign.is_featured && <Badge variant="outline">Featured</Badge>}</div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={`/dashboard/finance/campaigns/${campaign.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>

          {is_DB_admin && (
            <AddEditCampaignDialog
              campaign={campaign}
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
