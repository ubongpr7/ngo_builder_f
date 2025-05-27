"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Heart, Star, Repeat, Calendar, Award, Crown, Zap } from "lucide-react"
import type { CampaignDetailData } from "@/types/finance"

interface DonorInsightsPanelProps {
  campaign: CampaignDetailData
}

export function DonorInsightsPanel({ campaign }: DonorInsightsPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Sample top donors data (would come from API)
  const topDonors = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      total_donated: 2500,
      donation_count: 5,
      first_donation: "2024-01-15",
      last_donation: "2024-01-25",
      is_recurring: true,
      avatar: null,
      tier: "major",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      total_donated: 1200,
      donation_count: 3,
      first_donation: "2024-01-10",
      last_donation: "2024-01-20",
      is_recurring: false,
      avatar: null,
      tier: "large",
    },
    {
      id: 3,
      name: "Tech Corp Foundation",
      email: "giving@techcorp.com",
      total_donated: 5000,
      donation_count: 1,
      first_donation: "2024-01-18",
      last_donation: "2024-01-18",
      is_recurring: false,
      avatar: null,
      tier: "major",
    },
  ]

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "major":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "large":
        return <Award className="h-4 w-4 text-purple-500" />
      case "medium":
        return <Star className="h-4 w-4 text-blue-500" />
      default:
        return <Heart className="h-4 w-4 text-green-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "major":
        return "bg-yellow-100 text-yellow-800"
      case "large":
        return "bg-purple-100 text-purple-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Donor Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Donor Overview
          </CardTitle>
          <CardDescription>Key donor metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{campaign.donors_count}</div>
              <div className="text-xs text-blue-600">Total Donors</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{campaign.recurring_donors_count}</div>
              <div className="text-xs text-green-600">Recurring</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{campaign.in_kind_donors_count}</div>
              <div className="text-xs text-purple-600">In-Kind</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(campaign.current_amount_in_target_currency / Math.max(campaign.donors_count, 1))}
              </div>
              <div className="text-xs text-orange-600">Avg Donation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Donor Segments
          </CardTitle>
          <CardDescription>Donors by contribution level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.donor_segments &&
            Object.entries(campaign.donor_segments).map(([segment, count]) => {
              const total = Object.values(campaign.donor_segments).reduce((sum, val) => sum + val, 0)
              const percentage = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={segment} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getTierIcon(segment)}
                      <span className="font-medium capitalize">{segment} Donors</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
        </CardContent>
      </Card>

      {/* Top Donors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Donors
          </CardTitle>
          <CardDescription>Highest contributing supporters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topDonors.map((donor, index) => (
            <div key={donor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-gray-500 w-6">#{index + 1}</div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={donor.avatar || ""} />
                  <AvatarFallback>{getInitials(donor.name)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{donor.name}</span>
                  {getTierIcon(donor.tier)}
                  {donor.is_recurring && (
                    <Badge variant="outline" className="text-xs">
                      <Repeat className="h-3 w-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{donor.email}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>{donor.donation_count} donations</span>
                  <span>Since {new Date(donor.first_donation).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg">{formatCurrency(donor.total_donated)}</div>
                <Badge className={getTierColor(donor.tier)}>{donor.tier.toUpperCase()}</Badge>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full">
            View All Donors
          </Button>
        </CardContent>
      </Card>

      {/* Donor Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Donor Engagement
          </CardTitle>
          <CardDescription>Engagement metrics and trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((campaign.recurring_donors_count / Math.max(campaign.donors_count, 1)) * 100)}%
              </div>
              <div className="text-xs text-green-600">Retention Rate</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(campaign.donations_count / Math.max(campaign.donors_count, 1)).toFixed(1)}
              </div>
              <div className="text-xs text-blue-600">Avg Donations/Donor</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">First-time Donors</span>
              <Badge variant="outline">{campaign.donors_count - campaign.recurring_donors_count}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Repeat Donors</span>
              <Badge variant="outline">{campaign.recurring_donors_count}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Corporate Donors</span>
              <Badge variant="outline">3</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Donor Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest donor interactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.donations?.slice(0, 5).map((donation, index) => (
            <div key={index} className="flex items-center gap-3 p-2 border-l-2 border-blue-200 pl-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {donation.is_anonymous ? "?" : getInitials(donation.donor_name_display)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-medium">
                    {donation.is_anonymous ? "Anonymous donor" : donation.donor_name_display}
                  </span>{" "}
                  donated <span className="font-medium">{donation.formatted_amount}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(donation.donation_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
