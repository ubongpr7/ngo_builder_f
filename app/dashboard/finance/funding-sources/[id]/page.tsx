"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  History,
  BarChart3,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import { AddFundingSourceDialog } from "@/components/finances/funding-sources/add-funding-source-dialog"
import {
  useGetFundingSourceByIdQuery,
  useGetFundingSourceAllocationHistoryQuery,
} from "@/redux/features/finance/funding-sources"
import { toast } from "react-toastify"


export default function FundingSourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const fundingSourceId = Number.parseInt(params.id as string)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: fundingSource, isLoading, error, refetch } = useGetFundingSourceByIdQuery(fundingSourceId)

  const { data: allocationHistoryData, isLoading: historyLoading } =
    useGetFundingSourceAllocationHistoryQuery(fundingSourceId)
    console.log(allocationHistoryData)
  const allocationHistory = allocationHistoryData as {
    allocations: {
      budget_id: number
      budget_title: string
      budget_status: string
      allocation_date: string
      amount_allocated: number
    }[]
    total_amount: number
    amount_allocated: number
    amount_remaining: number
  }
  console.log(allocationHistory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading funding source details...</span>
        </div>
      </div>
    )
  }

  if (error || !fundingSource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Funding Source Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The funding source you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push("/dashboard/finance/funding-sources")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Funding Sources
          </Button>
        </div>
      </div>
    )
  }

  // Use allocation history data if available, otherwise fall back to funding source data
  const totalAmount = allocationHistory?.total_amount || Number.parseFloat(fundingSource.amount_available || "0")
  const allocatedAmount =
    allocationHistory?.amount_allocated || Number.parseFloat(fundingSource.amount_allocated || "0")
  const remainingAmount =
    allocationHistory?.amount_remaining || Number.parseFloat(fundingSource.amount_remaining || "0")

  const allocationPercentage = totalAmount > 0 ? (allocatedAmount / totalAmount) * 100 : 0
  const remainingPercentage = 100 - allocationPercentage

  const getAvailabilityStatus = () => {
    if (!fundingSource.is_active)
      return {
        status: "Inactive",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: Clock,
      }
    if (fundingSource.is_expired)
      return {
        status: "Expired",
        color: "text-red-500",
        bgColor: "bg-red-100",
        icon: AlertTriangle,
      }
    if (fundingSource.available_until) {
      const expiryDate = new Date(fundingSource.available_until)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      if (expiryDate <= thirtyDaysFromNow) {
        return {
          status: "Expiring Soon",
          color: "text-orange-500",
          bgColor: "bg-orange-100",
          icon: AlertCircle,
        }
      }
    }
    return {
      status: "Available",
      color: "text-green-500",
      bgColor: "bg-green-100",
      icon: CheckCircle,
    }
  }

  const getFundingTypeDetails = (type: string) => {
    const types: Record<string, { label: string; description: string; color: string }> = {
      donation: {
        label: "General Donation",
        description: "Individual or one-time donations",
        color: "bg-green-100 text-green-800",
      },
      campaign: {
        label: "Campaign",
        description: "Fundraising campaign proceeds",
        color: "bg-purple-100 text-purple-800",
      },
      grant: {
        label: "Grant",
        description: "Grant funding from institutions",
        color: "bg-blue-100 text-blue-800",
      },
      internal: {
        label: "Internal Funds",
        description: "Organization's internal funding",
        color: "bg-gray-100 text-gray-800",
      },
      partnership: {
        label: "Partnership Funding",
        description: "Funding from partnerships",
        color: "bg-pink-100 text-pink-800",
      },
      government: {
        label: "Government Funding",
        description: "Government grants or contracts",
        color: "bg-red-100 text-red-800",
      },
      investment: {
        label: "Investment Returns",
        description: "Returns from investments",
        color: "bg-yellow-100 text-yellow-800",
      },
      fundraising_event: {
        label: "Fundraising Event",
        description: "Proceeds from fundraising events",
        color: "bg-indigo-100 text-indigo-800",
      },
      corporate_sponsorship: {
        label: "Corporate Sponsorship",
        description: "Corporate sponsor funding",
        color: "bg-orange-100 text-orange-800",
      },
      foundation_grant: {
        label: "Foundation Grant",
        description: "Private foundation grants",
        color: "bg-cyan-100 text-cyan-800",
      },
      crowdfunding: {
        label: "Crowdfunding",
        description: "Crowdfunding platform proceeds",
        color: "bg-teal-100 text-teal-800",
      },
      other: {
        label: "Other",
        description: "Other funding sources",
        color: "bg-gray-100 text-gray-800",
      },
    }
    return types[type] || types.other
  }

  const getBudgetStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
      on_hold: "bg-orange-100 text-orange-800",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const availabilityStatus = getAvailabilityStatus()
  const StatusIcon = availabilityStatus.icon
  const fundingTypeDetails = getFundingTypeDetails(fundingSource.funding_type)

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!fundingSource.available_until) return null
    const expiryDate = new Date(fundingSource.available_until)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    refetch()
    toast.success("Funding source updated successfully!")
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/finance/funding-sources")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{fundingSource.name}</h1>
            <p className="text-muted-foreground">Funding source details and allocation history</p>
          </div>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Status and Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", availabilityStatus.color)} />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                  availabilityStatus.bgColor,
                  availabilityStatus.color,
                )}
              >
                <StatusIcon className="h-4 w-4" />
                {availabilityStatus.status}
              </div>

              {daysUntilExpiry !== null && (
                <div className="text-sm text-muted-foreground">
                  {daysUntilExpiry > 0 ? (
                    <span>Expires in {daysUntilExpiry} days</span>
                  ) : daysUntilExpiry === 0 ? (
                    <span className="text-orange-600">Expires today</span>
                  ) : (
                    <span className="text-red-600">Expired {Math.abs(daysUntilExpiry)} days ago</span>
                  )}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Created {format(new Date(fundingSource.created_at), "PPP")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Funding Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge className={fundingTypeDetails.color}>{fundingTypeDetails.label}</Badge>
              <p className="text-sm text-muted-foreground">{fundingTypeDetails.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="allocations" className="gap-2">
            <History className="h-4 w-4" />
            Allocations
          </TabsTrigger>
          <TabsTrigger value="linked" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Linked Sources
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(fundingSource.currency?.code || "", totalAmount.toString())}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(fundingSource.currency?.code || "", allocatedAmount.toString())}
                  </div>
                  <div className="text-sm text-muted-foreground">Allocated</div>
                  <div className="text-xs text-muted-foreground">{allocationPercentage.toFixed(1)}% of total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(fundingSource.currency?.code || "", remainingAmount.toString())}
                  </div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-xs text-muted-foreground">{remainingPercentage.toFixed(1)}% available</div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Allocation Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Allocation Progress</span>
                  <span>{allocationPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={allocationPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100% Allocated</span>
                </div>
              </div>

              {allocationPercentage >= 90 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">High Allocation</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    This funding source is nearly fully allocated. Consider monitoring remaining funds carefully.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allocation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{allocationHistory?.allocations.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Budget Allocations</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{allocationPercentage.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Utilization Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{fundingSource.currency?.code || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">Currency</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{fundingSource.is_active ? "Active" : "Inactive"}</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Allocation History
                {allocationHistory && (
                  <Badge variant="secondary" className="ml-2">
                    {allocationHistory.allocations.length} allocations
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading allocation history...</span>
                </div>
              ) : !allocationHistory || allocationHistory.allocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2" />
                  <p>No allocations found for this funding source</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-700">
                          {formatCurrency(
                            fundingSource.currency?.code || "",
                            allocationHistory.total_amount.toString(),
                          )}
                        </div>
                        <div className="text-xs text-blue-600">Total Amount</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-orange-700">
                          {formatCurrency(
                            fundingSource.currency?.code || "",
                            allocationHistory.amount_allocated.toString(),
                          )}
                        </div>
                        <div className="text-xs text-orange-600">Total Allocated</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-700">
                          {formatCurrency(
                            fundingSource.currency?.code || "",
                            allocationHistory.amount_remaining.toString(),
                          )}
                        </div>
                        <div className="text-xs text-green-600">Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* Allocation List */}
                  {allocationHistory.allocations.map((allocation, index) => (
                    <div
                      key={`${allocation.budget_id}-${index}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{allocation.budget_title}</div>
                          <Badge className={getBudgetStatusColor(allocation.budget_status)}>
                            {allocation.budget_status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">Budget ID: {allocation.budget_id}</div>
                        <div className="text-xs text-muted-foreground">
                          Allocated on {format(new Date(allocation.allocation_date), "PPP")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {formatCurrency(fundingSource.currency?.code || "", allocation.amount_allocated.toString())}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((allocation.amount_allocated / allocationHistory.total_amount) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linked" className="space-y-6">
          {fundingSource.donation || fundingSource.campaign || fundingSource.grant ? (
            <div className="space-y-4">
              {fundingSource.donation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Linked Donation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">{fundingSource.donation.donor_name_display}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            new Date(fundingSource.donation.donation_date || fundingSource.donation.created_at),
                            "PPP",
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fundingSource.donation.formatted_amount}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {fundingSource.campaign && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Linked Campaign
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium">{fundingSource.campaign.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(fundingSource.campaign.start_date), "MMM dd")} -{" "}
                          {format(new Date(fundingSource.campaign.end_date), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(
                            fundingSource.campaign.target_currency?.code || "",
                            fundingSource.campaign.target_amount,
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Target Amount</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {fundingSource.grant && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Linked Grant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">{fundingSource.grant.title}</div>
                        <div className="text-sm text-muted-foreground">{fundingSource.grant.grantor}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fundingSource.grant.formatted_amount}</div>
                        <div className="text-xs text-muted-foreground">{fundingSource.grant.status?.toUpperCase()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                  <p>No linked sources found for this funding source</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Availability Period */}
          {(fundingSource.available_from || fundingSource.available_until) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fundingSource.available_from && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Available From</div>
                      <div className="text-lg font-semibold">
                        {format(new Date(fundingSource.available_from), "PPP")}
                      </div>
                    </div>
                  )}
                  {fundingSource.available_until && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Available Until</div>
                      <div className="text-lg font-semibold">
                        {format(new Date(fundingSource.available_until), "PPP")}
                      </div>
                    </div>
                  )}
                </div>

                {fundingSource.available_from && fundingSource.available_until && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">Availability Timeline</div>
                    <div className="relative">
                      <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200"></div>
                      <div className="relative flex justify-between">
                        <div className="bg-white border-2 border-green-500 rounded-full w-3 h-3"></div>
                        <div
                          className={cn(
                            "bg-white border-2 rounded-full w-3 h-3",
                            daysUntilExpiry && daysUntilExpiry > 0 ? "border-blue-500" : "border-red-500",
                          )}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Start</span>
                      <span>End</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description and Restrictions */}
          {(fundingSource.description || fundingSource.restrictions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingSource.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{fundingSource.description}</p>
                  </CardContent>
                </Card>
              )}

              {fundingSource.restrictions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Usage Restrictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 whitespace-pre-wrap">{fundingSource.restrictions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Created By Information */}
          {fundingSource.created_by && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Created By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {fundingSource.created_by.first_name} {fundingSource.created_by.last_name}
                  </span>
                  <span>•</span>
                  <span>{format(new Date(fundingSource.created_at), "PPP")}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
        </TabsContent>
        
      </Tabs>

      {/* Edit Dialog */}
      <AddFundingSourceDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        fundingSource={fundingSource}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
