"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Users, Calendar, Star, CheckCircle, Clock, Gift, Zap } from "lucide-react"
import { toast } from "react-toastify"
import type { DonationCampaign } from "@/types/finance"

interface Milestone {
  id: string
  title: string
  description: string
  type: "amount" | "donors" | "time" | "special"
  target: number
  current: number
  achieved: boolean
  achievedDate?: string
  reward?: string
  icon: React.ReactNode
}

interface CampaignMilestoneCheckerProps {
  campaign: DonationCampaign
  onMilestoneReached: () => void
}

export function CampaignMilestoneChecker({ campaign, onMilestoneReached }: CampaignMilestoneCheckerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    // Initialize milestones based on campaign data
    const campaignMilestones: Milestone[] = [
      {
        id: "first_donation",
        title: "First Donation",
        description: "Receive your first donation",
        type: "amount",
        target: 1,
        current: campaign.current_amount_in_target_currency > 0 ? 1 : 0,
        achieved: campaign.current_amount_in_target_currency > 0,
        achievedDate: campaign.current_amount_in_target_currency > 0 ? "2024-01-15" : undefined,
        reward: "Campaign momentum boost",
        icon: <Star className="h-4 w-4" />,
      },
      {
        id: "ten_percent",
        title: "10% Goal Reached",
        description: "Reach 10% of your fundraising goal",
        type: "amount",
        target: campaign.target_amount * 0.1,
        current: campaign.current_amount_in_target_currency,
        achieved: campaign.progress_percentage >= 10,
        achievedDate: campaign.progress_percentage >= 10 ? "2024-01-18" : undefined,
        reward: "Social media boost",
        icon: <Target className="h-4 w-4" />,
      },
      {
        id: "quarter_goal",
        title: "25% Goal Reached",
        description: "Reach 25% of your fundraising goal",
        type: "amount",
        target: campaign.target_amount * 0.25,
        current: campaign.current_amount_in_target_currency,
        achieved: campaign.progress_percentage >= 25,
        achievedDate: campaign.progress_percentage >= 25 ? "2024-01-20" : undefined,
        reward: "Featured campaign status",
        icon: <Trophy className="h-4 w-4" />,
      },
      {
        id: "half_goal",
        title: "50% Goal Reached",
        description: "Reach halfway to your goal",
        type: "amount",
        target: campaign.target_amount * 0.5,
        current: campaign.current_amount_in_target_currency,
        achieved: campaign.progress_percentage >= 50,
        achievedDate: campaign.progress_percentage >= 50 ? "2024-01-22" : undefined,
        reward: "Newsletter feature",
        icon: <Zap className="h-4 w-4" />,
      },
      {
        id: "ten_donors",
        title: "10 Donors",
        description: "Reach 10 unique donors",
        type: "donors",
        target: 10,
        current: campaign.donors_count,
        achieved: campaign.donors_count >= 10,
        achievedDate: campaign.donors_count >= 10 ? "2024-01-19" : undefined,
        reward: "Donor appreciation email",
        icon: <Users className="h-4 w-4" />,
      },
      {
        id: "fifty_donors",
        title: "50 Donors",
        description: "Build a community of 50 supporters",
        type: "donors",
        target: 50,
        current: campaign.donors_count,
        achieved: campaign.donors_count >= 50,
        achievedDate: campaign.donors_count >= 50 ? "2024-01-25" : undefined,
        reward: "Donor wall feature",
        icon: <Gift className="h-4 w-4" />,
      },
      {
        id: "one_week",
        title: "One Week Active",
        description: "Campaign running for 7 days",
        type: "time",
        target: 7,
        current: campaign.days_active,
        achieved: campaign.days_active >= 7,
        achievedDate: campaign.days_active >= 7 ? "2024-01-22" : undefined,
        reward: "Performance analytics",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        id: "goal_reached",
        title: "Goal Achieved!",
        description: "Reach 100% of your fundraising goal",
        type: "amount",
        target: campaign.target_amount,
        current: campaign.current_amount_in_target_currency,
        achieved: campaign.progress_percentage >= 100,
        achievedDate: campaign.progress_percentage >= 100 ? "2024-01-30" : undefined,
        reward: "Success celebration package",
        icon: <Trophy className="h-4 w-4" />,
      },
    ]

    setMilestones(campaignMilestones)
  }, [campaign])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMilestoneProgress = (milestone: Milestone) => {
    if (milestone.achieved) return 100
    return Math.min((milestone.current / milestone.target) * 100, 100)
  }

  const getProgressText = (milestone: Milestone) => {
    switch (milestone.type) {
      case "amount":
        return `${formatCurrency(milestone.current)} / ${formatCurrency(milestone.target)}`
      case "donors":
        return `${milestone.current} / ${milestone.target} donors`
      case "time":
        return `${milestone.current} / ${milestone.target} days`
      default:
        return `${milestone.current} / ${milestone.target}`
    }
  }

  const handleCelebrateMilestone = (milestone: Milestone) => {
    toast.success(`🎉 Milestone Celebrated! ${milestone.title}`)
    onMilestoneReached()
  }

  const achievedMilestones = milestones.filter((m) => m.achieved)
  const upcomingMilestones = milestones.filter((m) => !m.achieved)
  const nextMilestone = upcomingMilestones.sort((a, b) => getMilestoneProgress(b) - getMilestoneProgress(a))[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Campaign Milestones
        </CardTitle>
        <CardDescription>Track your progress and celebrate achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Milestone Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{achievedMilestones.length}</div>
            <div className="text-xs text-green-600">Achieved</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{upcomingMilestones.length}</div>
            <div className="text-xs text-blue-600">Upcoming</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((achievedMilestones.length / milestones.length) * 100)}%
            </div>
            <div className="text-xs text-purple-600">Complete</div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-full">{nextMilestone.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">{nextMilestone.title}</h3>
                <p className="text-sm text-blue-700">{nextMilestone.description}</p>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                Next Up
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getProgressText(nextMilestone)}</span>
              </div>
              <Progress value={getMilestoneProgress(nextMilestone)} className="h-2" />
              <div className="text-xs text-blue-600">{nextMilestone.reward && `Reward: ${nextMilestone.reward}`}</div>
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {achievedMilestones.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Recent Achievements</h3>
            <div className="space-y-2">
              {achievedMilestones.slice(-3).map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">{milestone.title}</div>
                    <div className="text-sm text-green-700">
                      Achieved on {milestone.achievedDate && new Date(milestone.achievedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCelebrateMilestone(milestone)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Celebrate
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Milestones */}
        <div className="space-y-3">
          <h3 className="font-medium">All Milestones</h3>
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  milestone.achieved ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-full ${milestone.achieved ? "bg-green-100" : "bg-gray-100"}`}>
                  {milestone.achieved ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${milestone.achieved ? "text-green-900" : "text-gray-900"}`}>
                    {milestone.title}
                  </div>
                  <div className={`text-sm ${milestone.achieved ? "text-green-700" : "text-gray-600"}`}>
                    {getProgressText(milestone)}
                  </div>
                </div>
                <Badge
                  variant={milestone.achieved ? "default" : "outline"}
                  className={milestone.achieved ? "bg-green-600" : ""}
                >
                  {milestone.achieved ? "Achieved" : `${getMilestoneProgress(milestone).toFixed(0)}%`}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
