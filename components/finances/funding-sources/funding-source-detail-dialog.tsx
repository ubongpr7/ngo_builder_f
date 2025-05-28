"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import type { FundingSource } from "@/types/finance"

interface FundingSourceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundingSource: FundingSource | null
  onEdit?: (fundingSource: FundingSource) => void
}

export function FundingSourceDetailDialog({
  open,
  onOpenChange,
  fundingSource,
  onEdit,
}: FundingSourceDetailDialogProps) {
  if (!fundingSource) return null

  // Helper function to safely parse dates
  const safeParseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | null | undefined, formatStr: string): string => {
    const date = safeParseDate(dateString);
    return date ? format(date, formatStr) : 'N/A';
  };

  const allocationPercentage = fundingSource.amount_available
    ? (Number.parseFloat(fundingSource.amount_allocated || "0") / Number.parseFloat(fundingSource.amount_available)) *
      100
    : 0

  const remainingPercentage = 100 - allocationPercentage

  const getAvailabilityStatus = () => {
    if (!fundingSource.is_active)
      return {
        status: "Inactive",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: Clock,
      }
    
    const expiryDate = safeParseDate(fundingSource.available_until);
    const today = new Date();
    
    if (expiryDate && expiryDate < today) {
      return {
        status: "Expired",
        color: "text-red-500",
        bgColor: "bg-red-100",
        icon: AlertTriangle,
      }
    }

    if (expiryDate) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
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

  const availabilityStatus = getAvailabilityStatus()
  const StatusIcon = availabilityStatus.icon
  const fundingTypeDetails = getFundingTypeDetails(fundingSource.funding_type)

  // Calculate days until expiry
  const getDaysUntilExpiry = (): number | null => {
    const expiryDate = safeParseDate(fundingSource.available_until);
    if (!expiryDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {fundingSource.name}
              </DialogTitle>
              <DialogDescription className="mt-1">Detailed information about this funding source</DialogDescription>
            </div>
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(fundingSource)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
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
                    Created {safeFormatDate(fundingSource.created_at, "PPP")}
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
                  <div className="text-2xl font-bold text-blue-600">{fundingSource.formatted_amount}</div>
                  <div className="text-sm text-muted-foreground">Total Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(fundingSource.currency?.code || "", fundingSource.amount_allocated)}
                  </div>
                  <div className="text-sm text-muted-foreground">Allocated</div>
                  <div className="text-xs text-muted-foreground">{allocationPercentage.toFixed(1)}% of total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(fundingSource.currency?.code || "", fundingSource.amount_remaining)}
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
                        {safeFormatDate(fundingSource.available_from, "PPP")}
                      </div>
                    </div>
                  )}
                  {fundingSource.available_until && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Available Until</div>
                      <div className="text-lg font-semibold">
                        {safeFormatDate(fundingSource.available_until, "PPP")}
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
                            daysUntilExpiry !== null && daysUntilExpiry > 0 ? "border-blue-500" : "border-red-500",
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

          {/* Linked Sources */}
          {(fundingSource.donation || fundingSource.campaign || fundingSource.grant) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Linked Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fundingSource.donation && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Linked Donation</div>
                      <div className="text-sm text-muted-foreground">{fundingSource.donation.donor_name_display}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fundingSource.donation.formatted_amount}</div>
                      <div className="text-xs text-muted-foreground">
                        {safeFormatDate(
                          fundingSource.donation.donation_date || fundingSource.donation.created_at,
                          "MMM dd, yyyy"
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {fundingSource.campaign && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Linked Campaign</div>
                      <div className="text-sm text-muted-foreground">{fundingSource.campaign.title}</div>
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
                )}

                {fundingSource.grant && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Linked Grant</div>
                      <div className="text-sm text-muted-foreground">
                        {fundingSource.grant.title} - {fundingSource.grant.grantor}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fundingSource.grant.formatted_amount}</div>
                      <div className="text-xs text-muted-foreground">{fundingSource.grant.status?.toUpperCase()}</div>
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

          {/* Allocation History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{fundingSource.budgets_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Budgets Funded</div>
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

                {fundingSource.created_by && <Separator />}

                {fundingSource.created_by && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      Created by {fundingSource.created_by.first_name} {fundingSource.created_by.last_name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(fundingSource)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Funding Source
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}