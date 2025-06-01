"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Target,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Search,
  Plus,
  BarChart3,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  Activity,
  Clock,
  Zap,
  TrendingDown,
} from "lucide-react"
import { AddEditCampaignDialog } from "../add-edit-campaign-dialog"
import { CampaignAnalyticsDashboard } from "./campaign-analytics-dashboard"
import {
  useGetDonationCampaignsQuery,
  useGetDashboardStatsQuery,
  useDeleteDonationCampaignMutation,
} from "@/redux/features/finance/donation-campaigns"
import type { DonationCampaign } from "@/types/finance"
import { format, differenceInDays, isAfter } from "date-fns"
import { toast } from "react-toastify"
import Image from "next/image"
import { formatCurrency } from "@/lib/currency-utils"
import { useRouter } from "next/navigation"
interface CampaignCardProps {
  campaign: DonationCampaign
  onEdit: (campaign: DonationCampaign) => void
  onDelete: (campaign: DonationCampaign) => void
  onView: (campaign: DonationCampaign) => void
}

interface CurrencyTotal {
  code: string
  total_raised: number
  total_target: number
  campaign_count: number
}

function CampaignCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-8" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignCard({ campaign, onEdit, onDelete, onView }: CampaignCardProps) {
  // Add state to control dropdown open/close
  const [dropdownOpen, setDropdownOpen] = useState(false)
    const router = useRouter()

  const progressPercentage = campaign.progress_percentage || 0
  const daysRemaining = differenceInDays(new Date(campaign.end_date), new Date())
  const isExpired = daysRemaining < 0
  const isEndingSoon = daysRemaining <= 7 && daysRemaining >= 0

  const getStatusColor = () => {
    const status = campaign.campaign_status || campaign.status
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "PAUSED":
        return "bg-yellow-500"
      case "COMPLETED":
      case "SUCCESSFUL":
        return "bg-blue-500"
      case "CANCELLED":
      case "UNSUCCESSFUL":
        return "bg-red-500"
      case "DRAFT":
        return "bg-gray-500"
      case "UPCOMING":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHealthColor = () => {
    const health = campaign.fundraising_health
    switch (health) {
      case "EXCELLENT":
      case "VERY_GOOD":
      case "ON_TRACK":
        return "text-green-600"
      case "SLIGHTLY_BEHIND":
        return "text-yellow-600"
      case "BEHIND":
        return "text-orange-600"
      case "SIGNIFICANTLY_BEHIND":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthIcon = () => {
    const health = campaign.fundraising_health
    switch (health) {
      case "EXCELLENT":
      case "VERY_GOOD":
        return <TrendingUp className="h-3 w-3" />
      case "ON_TRACK":
        return <Activity className="h-3 w-3" />
      case "SLIGHTLY_BEHIND":
        return <Clock className="h-3 w-3" />
      case "BEHIND":
      case "SIGNIFICANTLY_BEHIND":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
    }
  }

  const getStatusText = () => {
    return (campaign.campaign_status || campaign.status).replace("_", " ")
  }

  // Handle dropdown actions with proper state management
  const handleEdit = () => {
    setDropdownOpen(false) // Close dropdown first
    setTimeout(() => onEdit(campaign), 100) // Small delay to ensure dropdown closes
  }

  const handleDelete = () => {
    setDropdownOpen(false) // Close dropdown first
    setTimeout(() => onDelete(campaign), 100) // Small delay to ensure dropdown closes
  }

  const handleView = () => {
    setDropdownOpen(false) // Close dropdown first
    setTimeout(() => onView(campaign), 100) // Small delay to ensure dropdown closes
  }

  // Get currency code for formatting
  const currencyCode = campaign.target_currency?.code || "USD"

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        {campaign.image ? (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={campaign.image || "/placeholder.svg"}
              alt={campaign.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Target className="h-12 w-12 text-blue-400" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2">
          {campaign.is_featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className={`text-white ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </div>

        <div className="absolute top-3 left-3">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle
              className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => onView(campaign)}
            >
              {campaign.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{campaign.description}</CardDescription>
          </div>
        </div>

        {/* Health Indicator */}
        {campaign.fundraising_health && (
          <div className={`flex items-center gap-1 text-xs ${getHealthColor()}`}>
            {getHealthIcon()}
            <span className="font-medium">{campaign.fundraising_health.replace("_", " ")}</span>
          </div>
        )}
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
              {formatCurrency(currencyCode, campaign.current_amount || 0)}
            </span>
            <span className="text-muted-foreground">of {formatCurrency(currencyCode, campaign.target_amount)}</span>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center text-blue-600">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{campaign.total_donors_count || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Donors</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-green-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{campaign.total_donations_count || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Donations</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-purple-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{isExpired ? "Ended" : `${Math.max(0, daysRemaining)}d`}</span>
            </div>
            <p className="text-xs text-muted-foreground">{isExpired ? "Days ago" : "Days left"}</p>
          </div>
        </div>

        {/* Campaign Type & Project */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {campaign.campaign_type?.replace("_", " ") || "General"}
            </Badge>
            {campaign.allow_recurring_donations && (
              <Badge variant="outline" className="text-xs text-blue-600">
                <Zap className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>

          {campaign.project && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                Project: <span className="font-medium">{campaign.project.title}</span>
              </span>
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(new Date(campaign.start_date), "MMM dd, yyyy")}</span>
          <span>→</span>
          <span>{format(new Date(campaign.end_date), "MMM dd, yyyy")}</span>
        </div>

        {/* Quick Action Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onView(campaign)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Campaign Details
        </Button>
      </CardContent>
    </Card>
  )
}

export function EnhancedCampaignListView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<DonationCampaign | null>(null)

  const {
    data: campaignsResponse,
    isLoading,
    refetch,
  } = useGetDonationCampaignsQuery({
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    campaign_type: typeFilter !== "all" ? typeFilter : undefined,
    ordering: sortBy,
    page_size: 50,
  })

  const { data: dashboardStats } = useGetDashboardStatsQuery()
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteDonationCampaignMutation()

  const campaigns = campaignsResponse || []

  const filteredCampaigns = campaigns.filter((campaign: DonationCampaign) => {
    switch (selectedTab) {
      case "active":
        return campaign.is_active && campaign.campaign_status === "ACTIVE"
      case "featured":
        return campaign.is_featured
      case "completed":
        return ["COMPLETED", "SUCCESSFUL"].includes(campaign.campaign_status || campaign.status)
      case "expired":
        return isAfter(new Date(), new Date(campaign.end_date))
      case "draft":
        return campaign.status === "draft" || campaign.campaign_status === "DRAFT"
      default:
        return true
    }
  })

  // Enhanced handlers with proper state management
  const handleEdit = (campaign: DonationCampaign) => {
    setEditingCampaign(campaign)
    // Use setTimeout to ensure any open dropdowns are closed first
    setTimeout(() => {
      setShowCreateDialog(true)
    }, 150)
  }

  const handleDeleteClick = (campaign: DonationCampaign) => {
    setCampaignToDelete(campaign)
    // Use setTimeout to ensure any open dropdowns are closed first
    setTimeout(() => {
      setDeleteDialogOpen(true)
    }, 150)
  }

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return

    const deleteToastId = toast.loading("Deleting campaign...")

    try {
      await deleteCampaign(campaignToDelete.id).unwrap()
      toast.update(deleteToastId, {
        render: "Campaign deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
      refetch()
    } catch (error: any) {
      toast.update(deleteToastId, {
        render: error?.data?.detail || "Failed to delete campaign",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      })
    } finally {
      setDeleteDialogOpen(false)
      setCampaignToDelete(null)
    }
  }

  const handleView = (campaign: DonationCampaign) => {
    router.push(`/dashboard/finance/campaigns/${campaign.id}`)
  }

  const handleSuccess = () => {
    refetch()
    setShowCreateDialog(false)
    setEditingCampaign(undefined)
  }

  // Close any open dialogs when component unmounts or when needed
  const handleDialogClose = () => {
    setShowCreateDialog(false)
    setEditingCampaign(undefined)
  }

  // Enhanced statistics calculations with proper multicurrency handling
  const stats = dashboardStats || {
    summary: { total_campaigns: 0, active_campaigns: 0, completed_campaigns: 0 },
    health_distribution: {},
    status_distribution: {},
  }

  // Group campaigns by currency for proper totals
  const currencyTotals = campaigns.reduce((acc: Record<string, CurrencyTotal>, campaign: DonationCampaign) => {
    const currencyCode = campaign.target_currency?.code || "USD"

    if (!acc[currencyCode]) {
      acc[currencyCode] = {
        code: currencyCode,
        total_raised: 0,
        total_target: 0,
        campaign_count: 0,
      }
    }

    acc[currencyCode].total_raised += campaign.current_amount || 0
    acc[currencyCode].total_target += campaign.target_amount || 0
    acc[currencyCode].campaign_count += 1

    return acc
  }, {})

  // Get the primary currency totals (most common currency or USD)
  const currencyEntries = Object.values(currencyTotals)
  const primaryCurrency =
    currencyEntries.length > 0
      ? currencyEntries.reduce((prev, current) => (prev.campaign_count > current.campaign_count ? prev : current))
      : { code: "USD", total_raised: 0, total_target: 0, campaign_count: 0 }

  const avgProgress =
    campaigns.length > 0
      ? campaigns.reduce((sum: number, c: DonationCampaign) => sum + (c.progress_percentage || 0), 0) / campaigns.length
      : 0

  const healthyCampaigns = campaigns.filter((c: DonationCampaign) =>
    ["EXCELLENT", "VERY_GOOD", "ON_TRACK"].includes(c.fundraising_health || ""),
  ).length

  if (isLoading) {
    return (
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="h-10 bg-gray-200 rounded animate-pulse" />

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Donation Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor your fundraising campaigns</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {showAnalytics ? "Hide" : "Show"} Analytics
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && <CampaignAnalyticsDashboard campaigns={campaigns} dashboardStats={dashboardStats} />}

      {/* Enhanced Summary Cards with Multicurrency Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{stats.summary.total_campaigns}</p>
                <p className="text-xs text-muted-foreground">{stats.summary.active_campaigns} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Raised</p>
                {currencyEntries.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {formatCurrency(primaryCurrency.code, primaryCurrency.total_raised)}
                    </p>
                    {currencyEntries.length > 1 && (
                      <div className="space-y-0.5">
                        {currencyEntries
                          .filter((c) => c.code !== primaryCurrency.code)
                          .slice(0, 2)
                          .map((currency) => (
                            <p key={currency.code} className="text-xs text-muted-foreground">
                              + {formatCurrency(currency.code, currency.total_raised)}
                            </p>
                          ))}
                        {currencyEntries.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            + {currencyEntries.length - 3} more currencies
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      of {formatCurrency(primaryCurrency.code, primaryCurrency.total_target)} target
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency("USD", 0)}</p>
                    <p className="text-xs text-muted-foreground">No campaigns yet</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{avgProgress.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">across all campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy Campaigns</p>
                <p className="text-2xl font-bold">{healthyCampaigns}</p>
                <p className="text-xs text-muted-foreground">
                  {campaigns.length > 0 ? ((healthyCampaigns / campaigns.length) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multicurrency Breakdown Card */}
      {currencyEntries.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Multicurrency Breakdown</CardTitle>
            <CardDescription>Campaign totals by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currencyEntries.map((currency) => (
                <div key={currency.code} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{currency.code}</h4>
                    <Badge variant="outline">{currency.campaign_count} campaigns</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Raised:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(currency.code, currency.total_raised)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">{formatCurrency(currency.code, currency.total_target)}</span>
                    </div>
                    <Progress
                      value={currency.total_target > 0 ? (currency.total_raised / currency.total_target) * 100 : 0}
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns by title, description, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="project_specific">Project</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Newest</SelectItem>
                  <SelectItem value="created_at">Oldest</SelectItem>
                  <SelectItem value="-progress_percentage">Progress ↓</SelectItem>
                  <SelectItem value="progress_percentage">Progress ↑</SelectItem>
                  <SelectItem value="-target_amount">Target ↓</SelectItem>
                  <SelectItem value="target_amount">Target ↑</SelectItem>
                  <SelectItem value="end_date">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({campaigns.filter((c: DonationCampaign) => c.campaign_status === "ACTIVE").length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({campaigns.filter((c: DonationCampaign) => c.is_featured).length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({campaigns.filter((c: DonationCampaign) => c.status === "draft").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed (
            {
              campaigns.filter((c: DonationCampaign) => ["COMPLETED", "SUCCESSFUL"].includes(c.campaign_status || ""))
                .length
            }
            )
          </TabsTrigger>
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
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Get started by creating your first campaign"}
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
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <AddEditCampaignDialog
        campaign={editingCampaign}
        open={showCreateDialog}
        setOpen={handleDialogClose}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Delete Campaign
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaignToDelete?.title}"? This action cannot be undone and will
              permanently remove the campaign and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
