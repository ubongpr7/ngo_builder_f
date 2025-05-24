"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useGetAllCampaignsQuery } from "@/redux/features/finance/financeApiSlice"
import { Heart, Calendar } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import type { DonationCampaign } from "@/types/finance"

interface ActiveCampaignsPublicProps {
  onDonateClick?: (type: "one-time" | "monthly", campaign?: { id: number; title: string }) => void
}

export function ActiveCampaignsPublic({ onDonateClick }: ActiveCampaignsPublicProps) {
  const { data: campaigns = [], isLoading } = useGetAllCampaignsQuery()

  // Filter for active campaigns
  const activeCampaigns = campaigns.filter((campaign: DonationCampaign) => {
    return (
      campaign.is_active && new Date(campaign.start_date) <= new Date() && new Date(campaign.end_date) >= new Date()
    )
  })

  // Don't render anything if no active campaigns
  if (isLoading || activeCampaigns.length === 0) {
    return null
  }

  const scrollToDonationForm = () => {
    const donationSection = document.getElementById("donation-form")
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Support our current fundraising campaigns and help us reach our goals
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCampaigns.map((campaign: DonationCampaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onDonateClick={onDonateClick}
            onViewAllOptions={scrollToDonationForm}
          />
        ))}
      </div>
    </div>
  )
}

function CampaignCard({
  campaign,
  onDonateClick,
  onViewAllOptions,
}: {
  campaign: DonationCampaign
  onDonateClick?: (type: "one-time" | "monthly", campaign?: { id: number; title: string }) => void
  onViewAllOptions?: () => void
}) {
  const progressPercentage = campaign.progress_percentage || (campaign.current_amount / campaign.target_amount) * 100
  const endDate = format(new Date(campaign.end_date), "MMM d, yyyy")

  const handleDonateClick = () => {
    onDonateClick?.("one-time", { id: campaign.id, title: campaign.title })
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {campaign.image ? (
          <Image src={campaign.image || "/placeholder.svg"} alt={campaign.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-100 to-green-200">
            <Heart className="h-16 w-16 text-green-600" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">Active</span>
        </div>
      </div>

      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{campaign.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{campaign.description}</p>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Ends {endDate}</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.min(progressPercentage, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
            <div className="flex justify-between mt-1 text-sm">
              <span className="font-medium">${campaign.current_amount.toLocaleString()}</span>
              <span className="text-gray-500">of ${campaign.target_amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleDonateClick}>
              <Heart className="h-4 w-4 mr-2" />
              Donate Now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllOptions}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              View All Options
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
