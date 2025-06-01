"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { toast } from "react-toastify"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Download,
  Share,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Banknote,
  Activity,
  Zap,
  Brain,
  RefreshCw,
} from "lucide-react"
import {
  useGetDonationCampaignByIdQuery,
  useGetCampaignComprehensiveAnalyticsQuery,
  useGetCampaignDonationTrendsQuery,
  useGetCampaignDonorAnalysisQuery,
  useGetCampaignPaymentAnalysisQuery,
  useGetCampaignDonationsQuery,
  useGetBankAccountsQuery,
  useUpdateCampaignMonetaryFieldsMutation,
  useExportCampaignDataMutation,
} from "@/redux/features/finance/donation-campaigns"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/currency-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

const HEALTH_COLORS = {
  EXCELLENT: "#10B981",
  VERY_GOOD: "#3B82F6",
  ON_TRACK: "#059669",
  SLIGHTLY_BEHIND: "#F59E0B",
  BEHIND: "#F97316",
  SIGNIFICANTLY_BEHIND: "#EF4444",
  NOT_STARTED: "#6B7280",
}

interface MLInsight {
  type: "prediction" | "recommendation" | "alert" | "opportunity"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  actionable: boolean
}

export default function ComprehensiveCampaignDashboard() {
  const params = useParams()
  const router = useRouter()
  const campaignId = Number(params.campaignId)
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [mlInsights, setMlInsights] = useState<MLInsight[]>([])

  // API queries
  const { data: campaign, isLoading, refetch: refetchCampaign } = useGetDonationCampaignByIdQuery(campaignId)
  const { data: analytics, refetch: refetchAnalytics } = useGetCampaignComprehensiveAnalyticsQuery(campaignId)
  const { data: trends, refetch: refetchTrends } = useGetCampaignDonationTrendsQuery({
    id: campaignId,
    period: 30,
  })
  const { data: donorAnalysis, refetch: refetchDonorAnalysis } = useGetCampaignDonorAnalysisQuery(campaignId)
  const { data: paymentAnalysis, refetch: refetchPaymentAnalysis } = useGetCampaignPaymentAnalysisQuery(campaignId)
  const { data: donations, refetch: refetchDonations } = useGetCampaignDonationsQuery({
    campaignId,
    page_size: 20,
  })
  const { data: bankAccounts, refetch: refetchBankAccounts } = useGetBankAccountsQuery(campaignId)

  // Mutations
  const [updateMonetaryFields] = useUpdateCampaignMonetaryFieldsMutation()
  const [exportData] = useExportCampaignDataMutation()

  // Generate ML-like insights
  useEffect(() => {
    if (analytics && trends && donorAnalysis) {
      generateMLInsights()
    }
  }, [analytics, trends, donorAnalysis])

  const generateMLInsights = () => {
    const insights: MLInsight[] = []

    if (!analytics || !trends || !donorAnalysis) return

    // Prediction: Final amount based on trends
    const dailyAverage =
      trends.daily_trends?.reduce((sum, day) => sum + day.total, 0) / (trends.daily_trends?.length || 1)
    const projectedFinal =
      dailyAverage * (analytics.time_metrics?.days_remaining || 0) + analytics.financial_metrics?.current_amount

    if (projectedFinal > analytics.financial_metrics?.target_amount * 1.1) {
      insights.push({
        type: "prediction",
        title: "Likely to Exceed Target",
        description: `Based on current trends, this campaign is projected to raise ${formatCurrency(analytics.campaign_info?.currency || "USD", projectedFinal)} (${Math.round((projectedFinal / analytics.financial_metrics?.target_amount - 1) * 100)}% over target)`,
        confidence: 85,
        impact: "high",
        actionable: true,
      })
    }

    // Recommendation: Donor retention
    if (donorAnalysis.donor_retention?.retention_rate < 30) {
      insights.push({
        type: "recommendation",
        title: "Improve Donor Retention",
        description: `Only ${donorAnalysis.donor_retention?.retention_rate?.toFixed(1)}% of donors are repeat contributors. Consider implementing a donor engagement strategy.`,
        confidence: 92,
        impact: "high",
        actionable: true,
      })
    }

    // Alert: Declining trend
    const recentTrends = trends.daily_trends?.slice(-7) || []
    const earlierTrends = trends.daily_trends?.slice(-14, -7) || []
    const recentAvg = recentTrends.reduce((sum, day) => sum + day.total, 0) / recentTrends.length
    const earlierAvg = earlierTrends.reduce((sum, day) => sum + day.total, 0) / earlierTrends.length

    if (recentAvg < earlierAvg * 0.7) {
      insights.push({
        type: "alert",
        title: "Declining Donation Trend",
        description: `Donations have decreased by ${Math.round((1 - recentAvg / earlierAvg) * 100)}% in the last week. Consider boosting marketing efforts.`,
        confidence: 78,
        impact: "medium",
        actionable: true,
      })
    }

    // Opportunity: Large donor potential
    const largeSegment = donorAnalysis.segments?.large
    if (largeSegment && largeSegment.count > 0 && largeSegment.avg > 1000) {
      insights.push({
        type: "opportunity",
        title: "High-Value Donor Segment",
        description: `You have ${largeSegment.count} large donors averaging ${formatCurrency(analytics.campaign_info?.currency || "USD", largeSegment.avg)}. Consider personalized outreach.`,
        confidence: 95,
        impact: "high",
        actionable: true,
      })
    }

    setMlInsights(insights)
  }

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchCampaign(),
        refetchAnalytics(),
        refetchTrends(),
        refetchDonorAnalysis(),
        refetchPaymentAnalysis(),
        refetchDonations(),
        refetchBankAccounts(),
      ])

      // Update monetary fields
      await updateMonetaryFields(campaignId).unwrap()

      toast.success("Dashboard data refreshed successfully")
    } catch (error) {
      toast.error("Failed to refresh dashboard data")
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = async (format = "csv") => {
    try {
      const blob = await exportData({ id: campaignId, format }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `campaign_${campaignId}_data.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Campaign data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error("Failed to export campaign data")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PAUSED":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "COMPLETED":
      case "SUCCESSFUL":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthColor = (health: string) => {
    return HEALTH_COLORS[health as keyof typeof HEALTH_COLORS] || "#6B7280"
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return <Brain className="h-4 w-4" />
      case "recommendation":
        return <Zap className="h-4 w-4" />
      case "alert":
        return <AlertCircle className="h-4 w-4" />
      case "opportunity":
        return <Target className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
        <Button onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    )
  }

  const currency = analytics?.campaign_info?.currency || campaign.target_currency?.code || "USD"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/campaigns")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.title}</h1>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Campaign Status Banner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(analytics?.campaign_info?.campaign_status || campaign.status)}
              <div>
                <div className="font-semibold">
                  {analytics?.campaign_info?.campaign_status?.replace("_", " ") || campaign.status}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: getHealthColor(analytics?.campaign_info?.fundraising_health || "") }}
                >
                  Health: {analytics?.campaign_info?.fundraising_health?.replace("_", " ") || "Unknown"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {analytics?.time_metrics?.days_remaining !== undefined && analytics.time_metrics.days_remaining > 0
                  ? `${analytics.time_metrics.days_remaining} days remaining`
                  : "Campaign ended"}
              </div>
              <div className="text-sm text-muted-foreground">
                Ends: {format(new Date(campaign.end_date), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currency, analytics?.financial_metrics?.target_amount || campaign.target_amount)}
            </div>
            {analytics?.financial_metrics?.minimum_goal_percentage && (
              <p className="text-xs text-muted-foreground">
                Min goal: {analytics.financial_metrics.minimum_goal_percentage.toFixed(1)}% reached
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currency, analytics?.financial_metrics?.current_amount || campaign.current_amount || 0)}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress
                value={analytics?.financial_metrics?.progress_percentage || campaign.progress_percentage || 0}
                className="flex-1"
              />
              <span className="text-sm font-medium">
                {Math.round(analytics?.financial_metrics?.progress_percentage || campaign.progress_percentage || 0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.donor_metrics?.total_donors_count || campaign.total_donors_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.donor_metrics?.total_donations_count || campaign.total_donations_count || 0} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                currency,
                analytics?.time_metrics?.daily_fundraising_rate || campaign.daily_fundraising_rate || 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected:{" "}
              {formatCurrency(
                currency,
                analytics?.time_metrics?.projected_final_amount || campaign.projected_final_amount || 0,
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Insights */}
      {mlInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Machine learning analysis of your campaign performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mlInsights?.map((insight, index) => (
                <Alert
                  key={index}
                  className={`border-l-4 ${
                    insight.type === "alert"
                      ? "border-l-red-500"
                      : insight.type === "opportunity"
                        ? "border-l-green-500"
                        : insight.type === "prediction"
                          ? "border-l-blue-500"
                          : "border-l-yellow-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm">{insight.description}</AlertDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            insight.impact === "high"
                              ? "destructive"
                              : insight.impact === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {insight.impact} impact
                        </Badge>
                        {insight.actionable && (
                          <Badge variant="outline" className="text-xs">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Donation Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Donation Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">One-time Donations</span>
                    <span className="font-medium">
                      {formatCurrency(currency, analytics?.financial_metrics?.total_donations_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recurring Donations</span>
                    <span className="font-medium">
                      {formatCurrency(currency, analytics?.financial_metrics?.total_recurring_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In-kind Donations</span>
                    <span className="font-medium">
                      {formatCurrency(currency, analytics?.financial_metrics?.total_in_kind_amount || 0)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(currency, analytics?.financial_metrics?.current_amount || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donations to this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {donations?.slice(0, 5)?.map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {donation.is_anonymous ? "Anonymous" : donation.donor_name_display}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(donation.donation_date), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(donation.currency?.code || currency, donation.amount)}
                        </div>
                        <Badge variant={donation.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No donations yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Trends Chart */}
          {trends?.daily_trends && trends.daily_trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Donation Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={trends.daily_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickFormatter={(value) => format(parseISO(value), "MMM dd")} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => format(parseISO(value as string), "MMM dd, yyyy")}
                      formatter={(value, name) => [
                        name === "total" ? formatCurrency(currency, value as number) : value,
                        name === "total" ? "Amount" : name === "count" ? "Count" : "Average",
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill="#8884d8" name="Daily Total" />
                    <Line yAxisId="right" type="monotone" dataKey="count" stroke="#82ca9d" name="Donation Count" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Progress vs Time</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {analytics?.financial_metrics?.progress_percentage?.toFixed(1)}% vs{" "}
                        {analytics?.time_metrics?.time_progress_percentage?.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {analytics?.performance_indicators?.is_on_track ? "On Track" : "Behind Schedule"}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Donation</span>
                    <span className="font-medium">
                      {formatCurrency(currency, analytics?.donor_metrics?.average_donation_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Largest Donation</span>
                    <span className="font-medium">
                      {formatCurrency(currency, analytics?.donor_metrics?.largest_donation_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Amount Remaining</span>
                    <span className="font-medium">
                      {formatCurrency(currency, analytics?.financial_metrics?.amount_remaining || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Target Goal</span>
                      <span>{analytics?.financial_metrics?.progress_percentage?.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics?.financial_metrics?.progress_percentage || 0} />
                  </div>
                  {analytics?.financial_metrics?.minimum_goal_percentage && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Minimum Goal</span>
                        <span>{analytics.financial_metrics.minimum_goal_percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.financial_metrics.minimum_goal_percentage} />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time Progress</span>
                      <span>{analytics?.time_metrics?.time_progress_percentage?.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics?.time_metrics?.time_progress_percentage || 0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trends */}
          {trends?.daily_trends && trends.daily_trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Donation Trends Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trends.daily_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickFormatter={(value) => format(parseISO(value), "MMM dd")} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => format(parseISO(value as string), "MMM dd, yyyy")}
                      formatter={(value, name) => [
                        formatCurrency(currency, value as number),
                        name === "total" ? "Daily Total" : "Average",
                      ]}
                    />
                    <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="avg" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Donations</CardTitle>
              <CardDescription>Complete list of donations for this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations?.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {donation.is_anonymous ? "Anonymous" : donation.donor_name_display}
                          </div>
                          {donation.donor_email_display && (
                            <div className="text-sm text-muted-foreground">{donation.donor_email_display}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(donation.currency?.code || currency, donation.amount)}
                          </div>
                          {donation.net_amount && (
                            <div className="text-sm text-muted-foreground">
                              Net: {formatCurrency(donation.currency?.code || currency, donation.net_amount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{donation.payment_method?.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={donation.status === "completed" ? "default" : "secondary"}>
                          {donation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(parseISO(donation.donation_date), "MMM dd, yyyy HH:mm")}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No donations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Donor Segments */}
            {donorAnalysis?.segments && (
              <Card>
                <CardHeader>
                  <CardTitle>Donor Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(donorAnalysis.segments)?.map(([key, value]) => ({
                          name: key.charAt(0).toUpperCase() + key.slice(1),
                          value: value.count,
                          amount: value.total,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(donorAnalysis.segments)?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, `${name} Donors`]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Donor Retention */}
            {donorAnalysis?.donor_retention && (
              <Card>
                <CardHeader>
                  <CardTitle>Donor Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Donors</span>
                      <span className="font-medium">{donorAnalysis.donor_retention.total_donors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Repeat Donors</span>
                      <span className="font-medium">{donorAnalysis.donor_retention.repeat_donors_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">First-time Donors</span>
                      <span className="font-medium">{donorAnalysis.donor_retention.first_time_donors_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Retention Rate</span>
                      <span className="font-medium">{donorAnalysis.donor_retention.retention_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={donorAnalysis.donor_retention.retention_rate} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Repeat Donors */}
          {donorAnalysis?.repeat_donors && donorAnalysis.repeat_donors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Repeat Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor ID</TableHead>
                      <TableHead>Donations</TableHead>
                      <TableHead>Total Donated</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donorAnalysis.repeat_donors?.map((donor, index) => (
                      <TableRow key={index}>
                        <TableCell>#{donor.donor}</TableCell>
                        <TableCell>{donor.donation_count}</TableCell>
                        <TableCell>{formatCurrency(currency, donor.total_donated)}</TableCell>
                        <TableCell>{formatCurrency(currency, donor.total_donated / donor.donation_count)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Payment Methods */}
            {paymentAnalysis?.payment_methods && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={paymentAnalysis.payment_methods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="payment_method" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "total" ? formatCurrency(currency, value as number) : value,
                          name === "total" ? "Total Amount" : name === "count" ? "Count" : "Average",
                        ]}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Processing Efficiency */}
            {paymentAnalysis?.processing_efficiency && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gross Amount</span>
                      <span className="font-medium">
                        {formatCurrency(currency, paymentAnalysis.processing_efficiency.total_gross)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Processing Fees</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(currency, paymentAnalysis.processing_efficiency.total_fees)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Net Amount</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(currency, paymentAnalysis.processing_efficiency.total_net)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fee Percentage</span>
                      <span className="font-medium">
                        {paymentAnalysis.processing_efficiency.avg_fee_percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Method Details */}
          {paymentAnalysis?.payment_methods && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Fees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentAnalysis.payment_methods?.map((method, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{method.payment_method.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>{method.count}</TableCell>
                        <TableCell>{formatCurrency(currency, method.total)}</TableCell>
                        <TableCell>{formatCurrency(currency, method.avg)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(currency, method.total_fees)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Campaign Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Anonymous Donations</span>
                    <Badge variant={campaign.allow_anonymous_donations ? "default" : "secondary"}>
                      {campaign.allow_anonymous_donations ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recurring Donations</span>
                    <Badge variant={campaign.allow_recurring_donations ? "default" : "secondary"}>
                      {campaign.allow_recurring_donations ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In-kind Donations</span>
                    <Badge variant={campaign.allow_in_kind_donations ? "default" : "secondary"}>
                      {campaign.allow_in_kind_donations ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Featured Campaign</span>
                    <Badge variant={campaign.is_featured ? "default" : "secondary"}>
                      {campaign.is_featured ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Accounts */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>Configured bank accounts for this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {bankAccounts?.accounts?.length ? (
                  <div className="space-y-3">
                    {bankAccounts.accounts?.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Banknote className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{account.bank_account?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {account.bank_account?.account_type} • {account.bank_account?.currency?.code}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {account.is_primary && (
                            <Badge variant="default" className="mb-1">
                              Primary
                            </Badge>
                          )}
                          <div className="text-sm text-muted-foreground">Priority: {account.priority_order}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Bank Accounts</h3>
                    <p className="text-muted-foreground mb-4">
                      No bank accounts have been configured for this campaign yet.
                    </p>
                    <Button>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Bank Accounts
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Campaign Type:</span>
                    <span className="text-sm">{campaign.campaign_type?.replace("_", " ") || "General"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Start Date:</span>
                    <span className="text-sm">{format(new Date(campaign.start_date), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">End Date:</span>
                    <span className="text-sm">{format(new Date(campaign.end_date), "MMM dd, yyyy")}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">{format(new Date(campaign.created_at), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span className="text-sm">{format(new Date(campaign.updated_at), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline">{campaign.status}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
