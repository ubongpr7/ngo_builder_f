"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Calendar, Users, DollarSign, BarChart3, Activity } from "lucide-react"
import type { DonationCampaign } from "@/types/finance"

interface PerformanceMetricsDashboardProps {
  campaign: DonationCampaign
  onDataChange: () => void
}

export function PerformanceMetricsDashboard({ campaign, onDataChange }: PerformanceMetricsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate performance metrics
  const dailyAverage = campaign.current_amount_in_target_currency / Math.max(campaign.days_active, 1)
  const projectedTotal = dailyAverage * (campaign.days_active + campaign.days_remaining)
  const projectedCompletion = (projectedTotal / campaign.target_amount) * 100
  const donorGrowthRate = 15.2 // Sample data
  const conversionRate = 3.8 // Sample data
  const averageDonation = campaign.current_amount_in_target_currency / Math.max(campaign.donors_count, 1)

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 75) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>Key performance indicators and projections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Goal Progress</h3>
            <Badge
              variant={campaign.progress_percentage >= 100 ? "default" : "outline"}
              className={getPerformanceColor(campaign.progress_percentage)}
            >
              {Number(campaign.progress_percentage).toFixed(1)}%
            </Badge>
          </div>
          <Progress value={campaign.progress_percentage} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{formatCurrency(campaign.current_amount_in_target_currency)}</div>
              <div className="text-muted-foreground">Raised</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{formatCurrency(campaign.target_amount)}</div>
              <div className="text-muted-foreground">Goal</div>
            </div>
            <div className="text-center">
              <div className="font-medium">
                {formatCurrency(campaign.target_amount - campaign.current_amount_in_target_currency)}
              </div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Daily Average */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Daily Average</div>
                  <div className="text-xl font-bold">{formatCurrency(dailyAverage)}</div>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Average Donation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Avg Donation</div>
                  <div className="text-xl font-bold">{formatCurrency(averageDonation)}</div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Donor Growth */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Donor Growth</div>
                  <div className="text-xl font-bold flex items-center gap-1">
                    +{donorGrowthRate}%
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-xl font-bold">{conversionRate}%</div>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projections */}
        <div className="space-y-4">
          <h3 className="font-medium">Projections</h3>

          {/* Projected Completion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Projected Goal Completion</span>
              <div className="flex items-center gap-2">
                {getPerformanceIcon(projectedCompletion)}
                <span className={`font-medium ${getPerformanceColor(projectedCompletion)}`}>
                  {projectedCompletion.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.min(projectedCompletion, 100)} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Based on current daily average: {formatCurrency(projectedTotal)} projected total
            </div>
          </div>

          {/* Time to Goal */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-medium">Time to Goal</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {projectedCompletion >= 100 ? (
                <span className="text-green-600">
                  Goal likely to be reached{" "}
                  {Math.ceil((campaign.target_amount - campaign.current_amount_in_target_currency) / dailyAverage)} days
                  early
                </span>
              ) : (
                <span className="text-orange-600">
                  Need {Math.ceil((campaign.target_amount - campaign.current_amount_in_target_currency) / dailyAverage)}{" "}
                  more days at current rate
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="space-y-3">
          <h3 className="font-medium">Performance Indicators</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-sm">Fundraising Velocity</span>
              <Badge variant={dailyAverage > 1000 ? "default" : "outline"}>
                {dailyAverage > 1000 ? "Strong" : "Moderate"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-sm">Donor Engagement</span>
              <Badge variant={campaign.recurring_donors_count > campaign.donors_count * 0.3 ? "default" : "outline"}>
                {campaign.recurring_donors_count > campaign.donors_count * 0.3 ? "High" : "Low"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-sm">Campaign Momentum</span>
              <Badge variant={campaign.progress_percentage > 50 ? "default" : "outline"}>
                {campaign.progress_percentage > 50 ? "Building" : "Starting"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
