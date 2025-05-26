"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Edit3,
  DollarSign,
  Users,
  TrendingUp,
  Building,
  BarChart3,
  FileText,
  Settings,
  RefreshCw,
  X,
  Gift,
  Repeat,
  CreditCard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGetDonationCampaignByIdQuery, useUpdateDonationCampaignMutation } from "@/redux/features/finance/donation-campaigns"
import { CampaignEditForm } from "@/components/finances/campaign/campaign-edit-form"
import { RecentDonationsFeed } from "@/components/finances/campaign/recent-donations-feed"
import { EnhancedCampaignStats } from "@/components/finances/campaign/enhanced-campaign-stats"
import { CampaignBankAccountDialog } from "@/components/finances/campaign/campaign-bank-account-dialog"
import { DonationAnalyticsCharts } from "@/components/finances/campaign/donation-analytics-charts"
import { DonorManagementSection } from "@/components/finances/campaign/donor-management-section"
import { InKindDonationsSection } from "@/components/finances/campaign/in-kind-donations-section"
import { CampaignBankAccountsManagement } from "@/components/finances/campaign/campaign-bank-accounts-management"
import { DonationOptionsPanel } from "@/components/finances/campaign/donation-options-panel"
import { CampaignMilestoneChecker } from "@/components/finances/campaign/campaign-milestone-checker"
import { DashboardSkeleton } from "@/components/finances/dashboard/dashboard-skeleton"

import { RecurringDonationsSection } from "@/components/finances/campaign/recurring-donations-section"
import { PerformanceMetricsDashboard } from "@/components/finances/campaign/performance-metrics-dashboard"


export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = Number.parseInt(params.campaignId as string)
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: campaign, isLoading, error, refetch } = useGetDonationCampaignByIdQuery(campaignId)

  const [updateCampaign, { isLoading: isUpdating }] = useUpdateDonationCampaignMutation()

  const handleRefresh = () => {
    refetch()
    toast({
      title: "Data Refreshed",
      description: "Campaign data has been updated",
    })
  }

  const handleEditSave = async (formData: any) => {
    try {
      await updateCampaign({
        id: campaignId,
        data: formData,
      }).unwrap()

      setIsEditing(false)
      refetch()
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      })
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  const onBankAccountAdded = () => {
    setShowBankAccountDialog(false)
    refetch()
    toast({
      title: "Success",
      description: "Bank account added to campaign",
    })
  }

  const onAnyDataChange = () => {
    refetch()
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Campaign Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The campaign you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign?.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                <Badge
                  variant={campaign.is_active ? "default" : "secondary"}
                  className={`${getStatusColor(campaign.is_active ? "active" : "inactive")} text-white`}
                >
                  {campaign.is_active ? "Active" : "Inactive"}
                </Badge>
                {campaign.is_featured && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-4">{campaign.description}</p>

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Campaign Progress</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(campaign.current_amount_in_target_currency)} of{" "}
                    {formatCurrency(campaign.target_amount)} raised
                  </span>
                </div>
                <Progress value={campaign.progress_percentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{Number(campaign.progress_percentage)?.toFixed(1)}% Complete</span>
                  <span>{campaign.days_remaining} days remaining</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{campaign.donors_count}</span>
                  </div>
                  <span className="text-xs text-gray-600">Total Donors</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{campaign.donations_count}</span>
                  </div>
                  <span className="text-xs text-gray-600">Donations</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Repeat className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{campaign.recurring_donors_count}</span>
                  </div>
                  <span className="text-xs text-gray-600">Recurring</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Gift className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{campaign.in_kind_donors_count}</span>
                  </div>
                  <span className="text-xs text-gray-600">In-Kind</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-6">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button variant="outline" size="sm" onClick={() => setShowBankAccountDialog(true)}>
                <Building className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="border-t pt-4 mt-4">
              <CampaignEditForm
                campaign={campaign}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
                isLoading={isUpdating}
              />
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Banking
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Enhanced Stats */}
              <div className="lg:col-span-2 space-y-6">
                <EnhancedCampaignStats campaign={campaign} />
                <PerformanceMetricsDashboard campaign={campaign} onDataChange={onAnyDataChange} />
              </div>

              {/* Right Column - Donation Options */}
              <div className="space-y-6">
              {/* Donation Options Panel 
                <DonationOptionsPanel campaign={campaign} onDonationMade={onAnyDataChange} />

                */}
                
                <CampaignMilestoneChecker campaign={campaign} onMilestoneReached={onAnyDataChange} />
              </div>
            </div>

            {/* Full Width Analytics */}
            <DonationAnalyticsCharts campaign={campaign} />
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentDonationsFeed campaign={campaign} onDataChange={onAnyDataChange} />
              <DonorManagementSection campaign={campaign} onDataChange={onAnyDataChange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InKindDonationsSection campaign={campaign} onDataChange={onAnyDataChange} />
              <RecurringDonationsSection campaign={campaign} onDataChange={onAnyDataChange} />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <DonationAnalyticsCharts campaign={campaign} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceMetricsDashboard campaign={campaign} onDataChange={onAnyDataChange} />
              <DonorManagementSection campaign={campaign} onDataChange={onAnyDataChange} />
            </div>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            <CampaignBankAccountsManagement
              campaign={campaign}
              onDataChange={onAnyDataChange}
              onAddBankAccount={() => setShowBankAccountDialog(true)}
            />
            <DonationOptionsPanel campaign={campaign} onDonationMade={onAnyDataChange} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Financial Reports
                  </CardTitle>
                  <CardDescription>Generate detailed financial reports for this campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Donation Summary Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Donor Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Financial Breakdown
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Tax Receipt Summary
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Campaign Analytics
                  </CardTitle>
                  <CardDescription>Export campaign performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trend Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Donor Demographics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bank Account Dialog */}
        <CampaignBankAccountDialog
          open={showBankAccountDialog}
          onOpenChange={setShowBankAccountDialog}
          campaign={campaign}
          onBankAccountAdded={onBankAccountAdded}
        />
      </div>
    </div>
  )
}
