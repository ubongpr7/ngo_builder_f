"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Edit, Eye, Calendar, Target, Star, CheckCircle, Clock } from "lucide-react"
import { CampaignDetailDialog } from "./campaign-detail-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { format } from "date-fns"

interface Campaign {
  id: number
  title: string
  description: string
  target_amount: string
  current_amount: string
  start_date: string
  end_date: string
  project_name?: string
  is_active: boolean
  is_featured: boolean
  image?: string
  created_by_name?: string
  created_at: string
  updated_at: string
  progress_percentage: number
  is_completed: boolean
}

interface CampaignCardProps {
  campaign: Campaign
  onUpdate?: () => void
}

export function CampaignCard({ campaign, onUpdate }: CampaignCardProps) {
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount))
  }

  const getStatusBadge = () => {
    const now = new Date()
    const startDate = new Date(campaign.start_date)
    const endDate = new Date(campaign.end_date)

    if (!campaign.is_active) {
      return <Badge variant="secondary">Inactive</Badge>
    }

    if (campaign.is_completed) {
      return (
        <Badge variant="default" className="bg-green-600">
          Completed
        </Badge>
      )
    }

    if (now < startDate) {
      return <Badge variant="outline">Upcoming</Badge>
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>
    }

    return <Badge variant="default">Active</Badge>
  }

  const getDaysRemaining = () => {
    const now = new Date()
    const endDate = new Date(campaign.end_date)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Ends today"
    if (diffDays === 1) return "1 day left"
    return `${diffDays} days left`
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Campaign Image */}
      {campaign.image && (
        <div className="relative h-48 overflow-hidden">
          <img src={campaign.image || "/placeholder.svg"} alt={campaign.title} className="w-full h-full object-cover" />
          {campaign.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="bg-yellow-500 text-black">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
              {campaign.is_completed && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
            </div>
            {getStatusBadge()}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{campaign.description}</p>

        {/* Progress Section */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold">{campaign.progress_percentage.toFixed(1)}%</span>
          </div>
          <Progress value={campaign.progress_percentage} className="h-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-green-600 font-semibold">{formatCurrency(campaign.current_amount)}</span>
            <span className="text-gray-500">of {formatCurrency(campaign.target_amount)}</span>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>
              {format(new Date(campaign.start_date), "MMM d")} - {format(new Date(campaign.end_date), "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
            <span className="text-orange-600 font-medium">{getDaysRemaining()}</span>
          </div>

          {campaign.project_name && (
            <div className="text-sm text-gray-600">
              <span className="text-gray-500">Project: </span>
              {campaign.project_name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 border-t flex justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Target className="h-4 w-4 mr-1" />
          <span>{formatCurrency(Number(campaign.target_amount) - Number(campaign.current_amount))} needed</span>
        </div>

        <div className="flex space-x-1">
          {/* View Details Button */}
          <CampaignDetailDialog
            campaignId={campaign.id}
            trigger={
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            }
          />

          {/* Admin Edit Button */}
          {is_DB_admin && (
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
