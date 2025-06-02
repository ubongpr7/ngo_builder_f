"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/currency-utils"
import { format, parseISO } from "date-fns"
import {
  Heart,
  Repeat,
  Gift,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Package,
  CreditCard,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useGetMyDonationsQuery } from "@/redux/features/finance/donations"
import { useGetMyInKindDonationsQuery } from "@/redux/features/finance/in-kind-donations"
import { useGetMyRecurringDonationsQuery } from "@/redux/features/finance/recurring-donations"
import Link from "next/link"

interface UserDonationsProps {
  userId?: number
}

// Type definitions for better type safety
interface RegularDonation {
  id: number
  campaign?: string
  project?: string
  amount: number
  currency?: { code: string }
  status: string
  donation_date: string
  payment_method?: string
  is_recent?: boolean
  days_since_donation?: number
  formatted_amount?: string
  net_amount?: number
  formatted_net_amount?: string
  processor_fee_percentage?: number
}

interface InKindDonation {
  id: number
  campaign?: string
  project?: string
  item_description: string
  category?: string
  quantity: number
  estimated_value: number
  valuation_currency?: { code: string }
  status: string
  donation_date: string
  received_date?: string
  is_overdue?: boolean
  formatted_estimated_value?: string
  effective_value?: number
  formatted_effective_value?: string
}

interface RecurringDonation {
  id: number
  campaign?: string
  project?: string
  amount: number
  currency?: { code: string }
  frequency: string
  status: string
  next_payment_date?: string
  payment_count: number
  success_rate?: number
  is_healthy?: boolean
  is_at_risk?: boolean
  days_until_next_payment?: number
  subscription_age_months?: number
  formatted_amount?: string
  total_donated?: number
  formatted_total_donated?: string
}

export function UserDonations() {
  const [activeTab, setActiveTab] = useState("regular")

  // Fetch all donation types
  const { data: regularDonations, isLoading: isLoadingRegular, refetch: refetchRegular } = useGetMyDonationsQuery({})

  const { data: inKindDonations, isLoading: isLoadingInKind, refetch: refetchInKind } = useGetMyInKindDonationsQuery({})

  const {
    data: recurringDonations,
    isLoading: isLoadingRecurring,
    refetch: refetchRecurring,
  } = useGetMyRecurringDonationsQuery({})

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ""

    switch (statusLower) {
      case "completed":
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleRefresh = async () => {
    await Promise.all([refetchRegular(), refetchInKind(), refetchRecurring()])
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy HH:mm")
    } catch {
      return "Invalid date"
    }
  }

  // Regular Donations Component
  const RegularDonationsTab = () => (
    <div className="space-y-4">
      {isLoadingRegular ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : regularDonations?.length ? (
        regularDonations?.map((donation: RegularDonation) => (
          <Card key={donation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{donation.campaign || "General Donation"}</h3>
                      {getStatusBadge(donation.status)}
                    </div>
                    {donation.project && (
                      <p className="text-sm text-muted-foreground mb-1">Project: {donation.project}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(donation.donation_date)}</span>
                      </div>
                      {donation.payment_method && (
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-4 w-4" />
                          <span>{donation.payment_method}</span>
                        </div>
                      )}
                      {donation.is_recent && (
                        <Badge variant="outline" className="text-xs">
                          Recent
                        </Badge>
                      )}
                    </div>
                    {donation.days_since_donation !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">{donation.days_since_donation} days ago</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {donation.formatted_amount || formatCurrency(donation.currency?.code || "USD", donation.amount)}
                  </div>
                  {donation.net_amount && (
                    <div className="text-sm text-muted-foreground">
                      Net:{" "}
                      {donation.formatted_net_amount ||
                        formatCurrency(donation.currency?.code || "USD", donation.net_amount)}
                    </div>
                  )}
                  {donation.processor_fee_percentage && (
                    <div className="text-xs text-muted-foreground">Fee: {donation.processor_fee_percentage}%</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
          <p className="text-muted-foreground mb-4">Start making a difference today</p>
        </div>
      )}
    </div>
  )

  // In-Kind Donations Component
  const InKindDonationsTab = () => (
    <div className="space-y-4">
      {isLoadingInKind ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : inKindDonations?.length ? (
        inKindDonations?.map((donation: InKindDonation) => (
          <Card key={donation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{donation.campaign || "General Donation"}</h3>
                      {getStatusBadge(donation.status)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{donation.item_description}</p>
                      {donation.category && (
                        <p className="text-sm text-muted-foreground">Category: {donation.category}</p>
                      )}
                      {donation.quantity > 1 && (
                        <p className="text-sm text-muted-foreground">Quantity: {donation.quantity}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(donation.donation_date)}</span>
                      </div>
                      {donation.received_date && (
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>Received {formatDate(donation.received_date)}</span>
                        </div>
                      )}
                    </div>
                    {donation.is_overdue && (
                      <Badge variant="destructive" className="mt-2">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {donation.formatted_estimated_value ||
                      formatCurrency(donation.valuation_currency?.code || "USD", donation.estimated_value)}
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                  {donation.effective_value && donation.effective_value !== donation.estimated_value && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Effective:{" "}
                      {donation.formatted_effective_value ||
                        formatCurrency(donation.valuation_currency?.code || "USD", donation.effective_value)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No in-kind donations</h3>
          <p className="text-muted-foreground mb-4">Consider donating goods or services</p>
        </div>
      )}
    </div>
  )

  // Recurring Donations Component
  const RecurringDonationsTab = () => (
    <div className="space-y-4">
      {isLoadingRecurring ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : recurringDonations?.length ? (
        recurringDonations?.map((donation: RecurringDonation) => (
          <Card key={donation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Repeat className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{donation.campaign || "General Donation"}</h3>
                      {getStatusBadge(donation.status)}
                      {donation.is_healthy && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Healthy
                        </Badge>
                      )}
                      {donation.is_at_risk && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          At Risk
                        </Badge>
                      )}
                    </div>
                    {donation.project && (
                      <p className="text-sm text-muted-foreground mb-1">Project: {donation.project}</p>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Frequency:</span> {donation.frequency}
                      </p>
                      {donation.next_payment_date && (
                        <p className="text-sm">
                          <span className="font-medium">Next Payment:</span> {formatDate(donation.next_payment_date)}
                        </p>
                      )}
                      {donation.days_until_next_payment !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {donation.days_until_next_payment} days until next payment
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{donation.payment_count} payments made</span>
                      </div>
                      {donation.success_rate !== undefined && (
                        <div className="flex items-center space-x-1">
                          <span>Success rate: {donation.success_rate}%</span>
                        </div>
                      )}
                    </div>
                    {donation.subscription_age_months !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Active for {donation.subscription_age_months} months
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {donation.formatted_amount || formatCurrency(donation.currency?.code || "USD", donation.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">per {donation.frequency}</div>
                  {donation.total_donated && (
                    <div className="text-sm font-medium text-green-600 mt-1">
                      Total:{" "}
                      {donation.formatted_total_donated ||
                        formatCurrency(donation.currency?.code || "USD", donation.total_donated)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No recurring donations</h3>
          <p className="text-muted-foreground mb-4">Set up a recurring donation to make ongoing impact</p>
        </div>
      )}
    </div>
  )

  // Calculate totals for summary - safely handle undefined data
  const totalRegular = regularDonations?.length || 0
  const totalInKind = inKindDonations?.length || 0
  const totalRecurring = recurringDonations?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Donations</h2>
          <p className="text-muted-foreground">Track your giving history and impact</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/donate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Make a Donation
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{totalRegular}</div>
                <div className="text-sm text-muted-foreground">One-time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalRecurring}</div>
                <div className="text-sm text-muted-foreground">Recurring</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{totalInKind}</div>
                <div className="text-sm text-muted-foreground">In-kind</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{totalRegular + totalRecurring + totalInKind}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>View and manage all your donations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="regular" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>One-time ({totalRegular})</span>
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center space-x-2">
                <Repeat className="h-4 w-4" />
                <span>Recurring ({totalRecurring})</span>
              </TabsTrigger>
              <TabsTrigger value="in-kind" className="flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>In-kind ({totalInKind})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="mt-6">
              <RegularDonationsTab />
            </TabsContent>

            <TabsContent value="recurring" className="mt-6">
              <RecurringDonationsTab />
            </TabsContent>

            <TabsContent value="in-kind" className="mt-6">
              <InKindDonationsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
