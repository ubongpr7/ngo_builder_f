"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/currency-utils"
import { format, parseISO } from "date-fns"
import { Activity, DollarSign, Clock, Filter, RefreshCw, Heart, Repeat, Gift } from "lucide-react"
import { useGetCampaignDonationsQuery } from "@/redux/features/finance/donation-campaigns"

interface RecentActivityProps {
  campaignId: number
}

export function RecentActivity({ campaignId }: RecentActivityProps) {
  const [filters, setFilters] = useState({
    type: "all" as "all" | "regular" | "recurring" | "in_kind",
    status: "",
    start_date: "",
    end_date: "",
    min_amount: "",
    max_amount: "",
    page: 1,
    page_size: 20,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: donations,
    isLoading,
    refetch,
  } = useGetCampaignDonationsQuery({
    campaignId,
    ...filters,
    min_amount: filters.min_amount ? Number(filters.min_amount) : undefined,
    max_amount: filters.max_amount ? Number(filters.max_amount) : undefined,
  })

  const getDonationTypeIcon = (type: string) => {
    switch (type) {
      case "regular":
        return <Heart className="h-4 w-4 text-red-500" />
      case "recurring":
        return <Repeat className="h-4 w-4 text-blue-500" />
      case "in_kind":
        return <Gift className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getDonationTypeBadge = (type: string) => {
    switch (type) {
      case "regular":
        return <Badge variant="default">One-time</Badge>
      case "recurring":
        return <Badge variant="secondary">Recurring</Badge>
      case "in_kind":
        return <Badge variant="outline">In-kind</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      status: "",
      start_date: "",
      end_date: "",
      min_amount: "",
      max_amount: "",
      page: 1,
      page_size: 20,
    })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Recent Activity</h3>
          <p className="text-muted-foreground">All donations and campaign activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Donation Summary Cards */}
      {donations?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{donations.summary.regular_donations.count}</div>
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
                  <div className="text-2xl font-bold">{Number(donations.summary.total_donations)-Number(donations.summary.recurring_donations.count)}</div>
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
                  <div className="text-2xl font-bold">{donations.summary.in_kind_donations.count}</div>
                  <div className="text-sm text-muted-foreground">In-kind</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{donations.summary.total_donations}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type">Donation Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="regular">One-time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="in_kind">In-kind</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="min_amount">Min Amount</Label>
              <Input
                id="min_amount"
                type="number"
                placeholder="0"
                value={filters.min_amount}
                onChange={(e) => handleFilterChange("min_amount", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="max_amount">Max Amount</Label>
              <Input
                id="max_amount"
                type="number"
                placeholder="No limit"
                value={filters.max_amount}
                onChange={(e) => handleFilterChange("max_amount", e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Donations
            </div>
            <div className="text-sm text-muted-foreground">{donations?.count || 0} total donations</div>
          </CardTitle>
          <CardDescription>
            {donations?.filters_applied?.type !== "all" && (
              <span>Filtered by: {donations?.filters_applied?.type} donations</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {donations?.results?.map((donation: any, index: number) => (
                <div
                  key={donation.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getDonationTypeIcon(donation.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{donation.donor?.name || "Anonymous"}</span>
                        {getDonationTypeBadge(donation.type)}
                        {donation.is_anonymous && (
                          <Badge variant="outline" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {donation.donation_date
                            ? format(parseISO(donation.donation_date), "MMM dd, yyyy HH:mm")
                            : "Unknown date"}
                        </span>
                        {donation.payment_method && (
                          <>
                            <span>•</span>
                            <span>{donation.payment_method}</span>
                          </>
                        )}
                      </div>
                      {donation.message && (
                        <div className="text-sm text-muted-foreground mt-1 italic">"{donation.message}"</div>
                      )}
                      {donation.type === "in_kind" && donation.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Item:</strong> {donation.description}
                          {donation.quantity && donation.quantity > 1 && <span> (Qty: {donation.quantity})</span>}
                        </div>
                      )}
                      {donation.type === "recurring" && donation.frequency && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Frequency:</strong> {donation.frequency}
                          {donation.next_payment_date && (
                            <span> • Next: {format(parseISO(donation.next_payment_date), "MMM dd, yyyy")}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(donation.currency?.code || "USD", donation.amount)}
                    </div>
                    {getStatusBadge(donation.status)}
                  </div>
                </div>
              ))}

              {(!donations?.results || donations.results.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donations found with current filters</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {donations && donations.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {donations.page} of {donations.total_pages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!donations.previous}
                  onClick={() => handlePageChange(donations.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!donations.next}
                  onClick={() => handlePageChange(donations.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
