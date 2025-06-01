"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Download,
  Share,
  Settings,
  AlertCircle,
  Banknote,
  Activity,
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
import { formatCurrency } from "@/lib/currency-utils"
import { CampaignOverview } from "./components/CampaignOverview"
import { FinancialMetrics } from "./components/FinancialMetrics"
import { DonorAnalytics } from "./components/DonorAnalytics"
import { TrendsAnalysis } from "./components/TrendsAnalysis"
import { PaymentAnalysis } from "./components/PaymentAnalysis"
import { BankAccountManagement } from "./components/BankAccountManagement"
import { MLInsights } from "./components/MLInsights"
import { CampaignSettings } from "./components/CampaignSettings"
import { RecentActivity } from "./components/RecentActivity"

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

    // Prediction insights
    const projectedFinal = analytics.time_metrics?.projected_final_amount || 0
    const targetAmount = analytics.financial_metrics?.target_amount || 0

    if (projectedFinal > targetAmount * 1.1) {
      insights.push({
        type: "prediction",
        title: "Exceeding Target Projection",
        description: `Based on current trends, this campaign is projected to raise ${formatCurrency(analytics.campaign_info?.currency || "USD", projectedFinal)} (${Math.round((projectedFinal / targetAmount - 1) * 100)}% over target)`,
        confidence: 85,
        impact: "high",
        actionable: true,
      })
    }

    // Donor retention insights
    const retentionRate = donorAnalysis.donor_retention?.retention_rate || 0
    if (retentionRate < 15) {
      insights.push({
        type: "alert",
        title: "Low Donor Retention",
        description: `Only ${retentionRate}% of donors are repeat contributors. Consider implementing donor engagement strategies.`,
        confidence: 95,
        impact: "high",
        actionable: true,
      })
    }

    // Trend analysis
    const recentTrends = trends.daily_trends?.slice(-7) || []
    const avgRecent = recentTrends.reduce((sum, day) => sum + day.total, 0) / recentTrends.length
    const avgEarlier = trends.daily_trends?.slice(-14, -7).reduce((sum, day) => sum + day.total, 0) / 7 || 0

    if (avgRecent > avgEarlier * 1.2) {
      insights.push({
        type: "opportunity",
        title: "Momentum Building",
        description: `Donations have increased by ${Math.round((avgRecent / avgEarlier - 1) * 100)}% in the last week. Consider amplifying marketing efforts.`,
        confidence: 78,
        impact: "medium",
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
      toast.success("Dashboard refreshed successfully")
    } catch (error) {
      toast.error("Failed to refresh dashboard")
    } finally {
      setRefreshing(false)
    }
  }

  const handleUpdateMonetary = async () => {
    try {
      await updateMonetaryFields(campaignId).unwrap()
      toast.success("Monetary fields updated successfully")
      handleRefreshAll()
    } catch (error) {
      toast.error("Failed to update monetary fields")
    }
  }

  const handleExport = async (format: string) => {
    try {
      const blob = await exportData({ id: campaignId, format }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `campaign-${campaignId}-data.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error("Failed to export data")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!campaign || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Campaign Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The campaign you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{campaign.title}</h1>
              <p className="text-muted-foreground">Campaign Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleUpdateMonetary}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Metrics
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={refreshing}>
              <Activity className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh All
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Campaign Overview Cards */}
        <CampaignOverview campaign={campaign} analytics={analytics} />

        {/* ML Insights */}
        {mlInsights.length > 0 && <MLInsights insights={mlInsights} />}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="donors" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Donors</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <Banknote className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center space-x-2">
              <Banknote className="h-4 w-4" />
              <span className="hidden sm:inline">Banking</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialMetrics analytics={analytics} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialMetrics analytics={analytics} detailed />
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            <DonorAnalytics donorAnalysis={donorAnalysis} analytics={analytics} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendsAnalysis trends={trends} analytics={analytics} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentAnalysis paymentAnalysis={paymentAnalysis} analytics={analytics} />
          </TabsContent>

          <TabsContent value="banking" className="space-y-6">
            <BankAccountManagement bankAccounts={bankAccounts} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity donations={donations} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CampaignSettings campaign={campaign} campaignId={campaignId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
