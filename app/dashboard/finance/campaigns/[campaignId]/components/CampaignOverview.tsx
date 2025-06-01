import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/currency-utils"
import { TrendingUp, CheckCircle, AlertCircle, DollarSign } from "lucide-react"

const HEALTH_COLORS = {
  EXCELLENT: "#10B981",
  VERY_GOOD: "#3B82F6",
  ON_TRACK: "#059669",
  SLIGHTLY_BEHIND: "#F59E0B",
  BEHIND: "#F97316",
  SIGNIFICANTLY_BEHIND: "#EF4444",
  NOT_STARTED: "#6B7280",
}

interface CampaignOverviewProps {
  campaign: any
  analytics: any
}

export function CampaignOverview({ campaign, analytics }: CampaignOverviewProps) {
  const getHealthColor = (health: string) => HEALTH_COLORS[health as keyof typeof HEALTH_COLORS] || "#6B7280"

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "COMPLETED":
        return "secondary"
      case "PAUSED":
        return "outline"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Progress Overview */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Campaign Progress</CardTitle>
            <Badge variant={getStatusBadgeVariant(analytics.campaign_info?.campaign_status)} className="ml-2">
              {analytics.campaign_info?.campaign_status}
            </Badge>
          </div>
          <CardDescription>
            {formatCurrency(analytics.campaign_info?.currency, analytics.financial_metrics?.current_amount)} of{" "}
            {formatCurrency(analytics.campaign_info?.currency, analytics.campaign_info?.target_amount)} raised
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{analytics.financial_metrics?.progress_percentage}%</span>
            </div>
            <Progress value={analytics.financial_metrics?.progress_percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.donor_metrics?.total_donors_count}</div>
              <div className="text-sm text-muted-foreground">Total Donors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.time_metrics?.days_remaining}</div>
              <div className="text-sm text-muted-foreground">Days Left</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fundraising Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div
              className="text-3xl font-bold"
              style={{ color: getHealthColor(analytics.campaign_info?.fundraising_health) }}
            >
              {analytics.campaign_info?.fundraising_health?.replace(/_/g, " ")}
            </div>
            <div className="text-sm text-muted-foreground">Based on time vs progress ratio</div>
            {analytics.performance_indicators?.is_on_track ? (
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Daily Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.campaign_info?.currency, analytics.time_metrics?.daily_fundraising_rate)}
            </div>
            <div className="text-sm text-muted-foreground">Average per day</div>
            <div className="text-xs text-muted-foreground">
              Projected:{" "}
              {formatCurrency(analytics.campaign_info?.currency, analytics.time_metrics?.projected_final_amount)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
