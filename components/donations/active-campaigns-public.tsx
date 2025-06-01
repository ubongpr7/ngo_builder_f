"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency-utils"
import { Heart, Target, Clock, Users, Repeat } from "lucide-react"
import { useGetActiveDonationCampaignsQuery } from "@/redux/features/finance/donation-campaigns"
import { format, parseISO } from "date-fns"

interface ActiveCampaignsPublicProps {
  onDonateClick: (type: "one-time" | "monthly", campaign?: { id: number; title: string }) => void
}

export function ActiveCampaignsPublic({ onDonateClick }: ActiveCampaignsPublicProps) {
  const { data: campaigns, isLoading } = useGetActiveDonationCampaignsQuery()

  // Filter campaigns that are active, not expired, and target not met
  const activeCampaigns =
    campaigns?.filter((campaign: any) => {
      const now = new Date()
      const endDate = campaign.end_date ? new Date(campaign.end_date) : null
      const isNotExpired = !endDate || endDate > now
      const targetNotMet = campaign.progress_percentage < 100

      return campaign.is_active && isNotExpired && targetNotMet
    }) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeCampaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Campaigns</h2>
        <p className="text-gray-600">Check back soon for new campaigns to support!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 mb-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Active Campaigns</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Support these ongoing campaigns and help us reach our goals. Every contribution makes a difference.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCampaigns.map((campaign: any) => (
          <CampaignCard key={campaign.id} campaign={campaign} onDonateClick={onDonateClick} />
        ))}
      </div>
    </div>
  )
}

interface CampaignCardProps {
  campaign: any
  onDonateClick: (type: "one-time" | "monthly", campaign?: { id: number; title: string }) => void
}

function CampaignCard({ campaign, onDonateClick }: CampaignCardProps) {
  const progressPercentage = Math.min(campaign.progress_percentage || 0, 100)
  const daysRemaining = campaign.days_remaining || 0
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0

  const handleDonateClick = (type: "one-time" | "monthly") => {
    onDonateClick(type, { id: campaign.id, title: campaign.title })
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Campaign Image */}
      {campaign.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={campaign.image || "/placeholder.svg"}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=400&text=Campaign+Image"
            }}
          />
          {isUrgent && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
            {campaign.title}
          </CardTitle>
          <Badge variant={campaign.campaign_status === "ACTIVE" ? "default" : "secondary"}>
            {campaign.campaign_status}
          </Badge>
        </div>
        {campaign.description && <CardDescription className="line-clamp-3">{campaign.description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-green-600 font-semibold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(campaign.target_currency?.code || "USD", campaign.current_amount || 0)} raised</span>
            <span>Goal: {formatCurrency(campaign.target_currency?.code || "USD", campaign.target_amount || 0)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-lg font-bold">{campaign.total_donors || 0}</span>
            </div>
            <span className="text-xs text-gray-600">Donors</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-lg font-bold">{daysRemaining}</span>
            </div>
            <span className="text-xs text-gray-600">Days Left</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={() => handleDonateClick("one-time")}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Heart className="h-4 w-4 mr-2" />
            Donate Now
          </Button>
          <Button
            onClick={() => handleDonateClick("monthly")}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50"
          >
            <Repeat className="h-4 w-4 mr-2" />
            Monthly Support
          </Button>
        </div>

        {/* Campaign Details */}
        {campaign.end_date && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            Ends: {format(parseISO(campaign.end_date), "MMM dd, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
