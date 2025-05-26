"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Users, Gift, Repeat, TrendingUp, Calendar, Target, PieChart } from "lucide-react"

interface DonationBreakdown {
  regular_donations: {
    count: number
    total: number
    percentage: number
  }
  in_kind_donations: {
    count: number
    total: number
    percentage: number
  }
  recurring_donations: {
    count: number
    total: number
    percentage: number
  }
}

interface EnhancedCampaignStatsProps {
  campaign: {
    id: string
    title: string
    target_amount: number
    current_amount_in_target_currency: number
    progress_percentage: number
    target_currency: {
      code: string
      symbol: string
    }
    donations_count: number
    donors_count: number
    recurring_donors_count: number
    in_kind_donors_count: number
    total_estimated_in_kind_value: number
    total_recurring_donated: number
    days_remaining: number
    days_active: number
    donation_breakdown: DonationBreakdown
  }
}

export function EnhancedCampaignStats({ campaign }: EnhancedCampaignStatsProps) {
  const {
    target_amount,
    current_amount_in_target_currency,
    progress_percentage,
    target_currency,
    donations_count,
    donors_count,
    recurring_donors_count,
    in_kind_donors_count,
    total_estimated_in_kind_value,
    total_recurring_donated,
    days_remaining,
    days_active,
    donation_breakdown,
  } = campaign

  // Calculate percentages for donation breakdown
  const totalRaised = current_amount_in_target_currency
  const regularPercentage = totalRaised > 0 ? (donation_breakdown.regular_donations.total / totalRaised) * 100 : 0
  const inKindPercentage = totalRaised > 0 ? (donation_breakdown.in_kind_donations.total / totalRaised) * 100 : 0
  const recurringPercentage = totalRaised > 0 ? (donation_breakdown.recurring_donations.total / totalRaised) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: target_currency?.code|| "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Progress
          </CardTitle>
          <CardDescription>
            {formatCurrency(current_amount_in_target_currency)} of {formatCurrency(target_amount)} raised
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={Number(progress_percentage)} className="h-3" />
          <div className="flex justify-between text-sm">
            <span>{Number(progress_percentage).toFixed(1)}% Complete</span>
            <span>{days_remaining} days remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Donation Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Donation Breakdown
          </CardTitle>
          <CardDescription>Contributions by donation type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Regular Donations */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Regular Donations</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(donation_breakdown.regular_donations.total)}</div>
              <div className="text-xs text-muted-foreground">
                {donation_breakdown.regular_donations.count} donations ({regularPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
          <Progress value={regularPercentage} className="h-2" />

          {/* In-Kind Donations */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">In-Kind Donations</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(donation_breakdown.in_kind_donations.total)}</div>
              <div className="text-xs text-muted-foreground">
                {donation_breakdown.in_kind_donations.count} items ({inKindPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
          <Progress value={inKindPercentage} className="h-2" />

          {/* Recurring Donations */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Recurring Donations</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(donation_breakdown.recurring_donations.total)}</div>
              <div className="text-xs text-muted-foreground">
                {donation_breakdown.recurring_donations.count} subscriptions ({recurringPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
          <Progress value={recurringPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Donors */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{donors_count}</div>
                <div className="text-xs text-muted-foreground">Total Donors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regular Donations */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{donations_count}</div>
                <div className="text-xs text-muted-foreground">One-time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Donors */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{recurring_donors_count}</div>
                <div className="text-xs text-muted-foreground">Recurring</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In-Kind Donors */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{in_kind_donors_count}</div>
                <div className="text-xs text-muted-foreground">In-Kind</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{days_active}</div>
              <div className="text-xs text-muted-foreground">Days Active</div>
            </div>
            <div className="flex-1 mx-4">
              <Progress value={(days_active / (days_active + days_remaining)) * 100} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{days_remaining}</div>
              <div className="text-xs text-muted-foreground">Days Left</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
                <div className="text-lg font-bold">
                  {formatCurrency(current_amount_in_target_currency / Math.max(days_active, 1))}
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Avg per Donor</div>
                <div className="text-lg font-bold">
                  {formatCurrency(current_amount_in_target_currency / Math.max(donors_count, 1))}
                </div>
              </div>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge
                  variant={progress_percentage >= 100 ? "default" : progress_percentage >= 75 ? "secondary" : "outline"}
                >
                  {progress_percentage >= 100
                    ? "Completed"
                    : progress_percentage >= 75
                      ? "On Track"
                      : "Needs Attention"}
                </Badge>
              </div>
              <Target className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
