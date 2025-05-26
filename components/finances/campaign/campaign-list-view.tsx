"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Search,
  Filter,
  Plus,
  BarChart3,
  Star,
} from "lucide-react"
import { AddEditCampaignDialog } from "./add-edit-campaign-dialog"
import { CampaignStatistics } from "./campaign-statistics"
import { useGetDonationCampaignsQuery } from "@/redux/features/finance/donation-campaigns"
import type { DonationCampaign } from "@/types/finance"
import { format, differenceInDays, isAfter } from "date-fns"
import Image from "next/image"

interface CampaignCardProps {
  campaign: DonationCampaign
}

function CampaignCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 animate-pulse" />

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-2 bg-gray-200 rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-8" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Project Association Skeleton */}
        <div className="h-8 bg-gray-200 rounded animate-pulse" />

        {/* Date Range Skeleton */}
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage = Number.parseFloat(campaign.progress_percentage)
  const daysRemaining = differenceInDays(new Date(campaign.end_date), new Date())
  const isExpired = daysRemaining < 0
  const isEndingSoon = daysRemaining <= 7 && daysRemaining >= 0

  const getStatusColor = () => {
    if (!campaign.is_active) return "bg-gray-500"
    if (isExpired) return "bg-red-500"
    if (isEndingSoon) return "bg-yellow-500"
    if (progressPercentage >= 100) return "bg-green-500"
    return "bg-blue-500"
  }

  const getStatusText = () => {
    if (!campaign.is_active) return "Inactive"
    if (isExpired) return "Expired"
    if (progressPercentage >= 100) return "Completed"
    if (isEndingSoon) return "Ending Soon"
    return "Active"
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <div className="relative">
        {campaign.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={campaign.image || "/placeholder.svg"}
              alt={campaign.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2">
          {campaign.is_featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className={`text-white ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {campaign.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{campaign.description}</CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => (window.location.href = `/dashboard/campaigns/${campaign.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-green-600">
              {campaign.target_currency?.code}{" "}
              {Number.parseFloat(campaign.current_amount_in_target_currency).toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              of {campaign.target_currency?.code} {Number.parseFloat(campaign.target_amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center text-blue-600">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{campaign.donors_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Donors</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-green-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{campaign.donations_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Donations</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-purple-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{isExpired ? "Expired" : `${daysRemaining}d`}</span>
            </div>
            <p className="text-xs text-muted-foreground">{isExpired ? "Days ago" : "Days left"}</p>
          </div>
        </div>

        {/* Project Association */}
        {campaign.project && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">
              Project: <span className="font-medium">{campaign.project.title}</span>
            </span>
          </div>
        )}

        {/* Date Range */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(new Date(campaign.start_date), "MMM dd, yyyy")}</span>
          <span>→</span>
          <span>{format(new Date(campaign.end_date), "MMM dd, yyyy")}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function CampaignListView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)

  const {
    data: campaignsData,
    isLoading,
    refetch,
  } = useGetDonationCampaignsQuery({
    search: searchTerm,
    page_size: 50,
  })

  const campaigns = campaignsData || []


  const filteredCampaigns = campaigns.filter((campaign: DonationCampaign) => {
    switch (selectedTab) {
      case "active":
        return campaign.is_active && !campaign.is_completed
      case "featured":
        return campaign.is_featured
      case "completed":
        return campaign.is_completed
      case "expired":
        return isAfter(new Date(), new Date(campaign.end_date))
      default:
        return true
    }
  })

  const handleSuccess = () => {
    refetch()
    setShowCreateDialog(false)
  }

  // Calculate summary statistics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((c: DonationCampaign) => c.is_active).length
  const completedCampaigns = campaigns.filter((c: DonationCampaign) => c.is_completed).length
  const totalRaised = campaigns.reduce(
    (sum: number, c: DonationCampaign) => sum + Number.parseFloat(c.current_amount_in_target_currency),
    0,
  )
  const totalTarget = campaigns.reduce(
    (sum: number, c: DonationCampaign) => sum + Number.parseFloat(c.target_amount),
    0,
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 bg-gray-200 rounded animate-pulse" />

        {/* Campaign Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donation Campaigns</h1>
          <p className="text-gray-600">Manage and monitor your fundraising campaigns</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowStatistics(!showStatistics)} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {showStatistics ? "Hide" : "Show"} Statistics
          </Button>

          <AddEditCampaignDialog
            open={showCreateDialog}
            setOpen={setShowCreateDialog}
            onSuccess={handleSuccess}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            }
          />
        </div>
      </div>

      {/* Statistics Panel */}
      {showStatistics && (
        <CampaignStatistics
          totalCampaigns={totalCampaigns}
          activeCampaigns={activeCampaigns}
          completedCampaigns={completedCampaigns}
          totalRaised={totalRaised}
          totalTarget={totalTarget}
          campaigns={campaigns}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold">${totalRaised.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {totalTarget > 0 ? ((totalRaised / totalTarget) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({totalCampaigns})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCampaigns})</TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({campaigns.filter((c: DonationCampaign) => c.is_featured).length})
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCampaigns})</TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({campaigns.filter((c: DonationCampaign) => isAfter(new Date(), new Date(c.end_date))).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first campaign"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign: DonationCampaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <AddEditCampaignDialog open={false} setOpen={() => {}} onSuccess={handleSuccess} />
    </div>
  )
}
