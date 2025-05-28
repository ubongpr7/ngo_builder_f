"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Select from "react-select"
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  AlertCircle,
  Filter,
  Download,
  Eye,
  Edit,
  TrendingUp,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { AddFundingSourceDialog } from "@/components/finances/funding-sources/add-funding-source-dialog"
import { FundingSourceDetailDialog } from "@/components/finances/funding-sources/funding-source-detail-dialog"
import { useGetFundingSourcesQuery } from "@/redux/features/finance/funding-sources"
import { formatCurrency } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "react-toastify"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function FundingSourcesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedFundingSource, setSelectedFundingSource] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    funding_type: "",
    is_active: "",
    ordering: "-created_at",
  })

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Memoize query parameters
  const queryParams = useMemo(
    () => ({
      search: debouncedSearchTerm,
      ...filters,
      page_size: 50,
    }),
    [debouncedSearchTerm, filters],
  )

  const { data: fundingSourcesData, isLoading, error, isFetching } = useGetFundingSourcesQuery(queryParams)

  const fundingSources = fundingSourcesData?.results || []

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const activeSources = fundingSources.filter((source: any) => source.is_active)
    const totalAvailable = activeSources.reduce(
      (sum: number, source: any) => sum + Number.parseFloat(source.amount_available || "0"),
      0,
    )
    const totalAllocated = activeSources.reduce(
      (sum: number, source: any) => sum + Number.parseFloat(source.amount_allocated || "0"),
      0,
    )
    const totalRemaining = activeSources.reduce(
      (sum: number, source: any) => sum + Number.parseFloat(source.amount_remaining || "0"),
      0,
    )

    const expiredSources = activeSources.filter((source: any) => source.is_expired)
    const expiringSoon = activeSources.filter((source: any) => {
      if (!source.available_until) return false
      const expiryDate = new Date(source.available_until)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
    })

    return {
      total_sources: activeSources.length,
      total_available: totalAvailable,
      total_allocated: totalAllocated,
      total_remaining: totalRemaining,
      allocation_percentage: totalAvailable > 0 ? (totalAllocated / totalAvailable) * 100 : 0,
      expired_count: expiredSources.length,
      expiring_soon_count: expiringSoon.length,
    }
  }, [fundingSources])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleViewDetails = (fundingSource: any) => {
    setSelectedFundingSource(fundingSource)
    setShowDetailDialog(true)
    toast.info(`Viewing details for ${fundingSource.name}`)
  }

  const handleEdit = (fundingSource: any) => {
    setSelectedFundingSource(fundingSource)
    setShowAddDialog(true)
    toast.info(`Editing ${fundingSource.name}`)
  }

  const getFundingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      grant: "bg-blue-100 text-blue-800",
      donation: "bg-green-100 text-green-800",
      campaign: "bg-purple-100 text-purple-800",
      government: "bg-red-100 text-red-800",
      corporate_sponsorship: "bg-orange-100 text-orange-800",
      foundation_grant: "bg-indigo-100 text-indigo-800",
      internal: "bg-gray-100 text-gray-800",
      investment: "bg-yellow-100 text-yellow-800",
      partnership: "bg-pink-100 text-pink-800",
      crowdfunding: "bg-cyan-100 text-cyan-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getAvailabilityStatus = (source: any) => {
    if (!source.is_active) return { status: "inactive", color: "text-gray-500", icon: Clock }
    if (source.is_expired) return { status: "expired", color: "text-red-500", icon: AlertTriangle }
    if (source.available_until) {
      const expiryDate = new Date(source.available_until)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      if (expiryDate <= thirtyDaysFromNow) {
        return { status: "expiring", color: "text-orange-500", icon: AlertCircle }
      }
    }
    return { status: "available", color: "text-green-500", icon: CheckCircle }
  }

  // Loading component
  const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Funding Sources
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track available funding sources</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Input
              placeholder="Search funding sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 w-64"
              disabled={isLoading}
            />
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2" disabled={isLoading}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            disabled={isLoading || !fundingSources.length}
            onClick={() => {
              if (fundingSources.length === 0) {
                toast.error("No funding sources to export")
                return
              }
              // Implement export functionality
              toast.success("Export started! Download will begin shortly.")
              // Add actual export logic here
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={() => {
              setSelectedFundingSource(null)
              setShowAddDialog(true)
            }}
            className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Funding Source
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Funding Type</label>
                <Select
                  value={
                    filters.funding_type
                      ? {
                          value: filters.funding_type,
                          label: filters.funding_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                        }
                      : null
                  }
                  onChange={(option) => handleFilterChange("funding_type", option?.value || "")}
                  options={[
                    { value: "", label: "All types" },
                    { value: "grant", label: "Grant" },
                    { value: "donation", label: "Donation" },
                    { value: "campaign", label: "Campaign" },
                    { value: "government", label: "Government" },
                    { value: "corporate_sponsorship", label: "Corporate Sponsorship" },
                    { value: "foundation_grant", label: "Foundation Grant" },
                    { value: "internal", label: "Internal" },
                    { value: "investment", label: "Investment" },
                    { value: "partnership", label: "Partnership" },
                    { value: "crowdfunding", label: "Crowdfunding" },
                  ]}
                  placeholder="All types"
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      "&:hover": {
                        borderColor: "#3b82f6",
                      },
                    }),
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={
                    filters.is_active
                      ? {
                          value: filters.is_active,
                          label: filters.is_active === "true" ? "Active" : "Inactive",
                        }
                      : null
                  }
                  onChange={(option) => handleFilterChange("is_active", option?.value || "")}
                  options={[
                    { value: "", label: "All statuses" },
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  placeholder="All statuses"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      "&:hover": {
                        borderColor: "#3b82f6",
                      },
                    }),
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={{
                    value: filters.ordering,
                    label: (() => {
                      const orderingLabels: Record<string, string> = {
                        "-created_at": "Newest First",
                        created_at: "Oldest First",
                        name: "Name A-Z",
                        "-name": "Name Z-A",
                        "-amount_available": "Highest Amount",
                        amount_available: "Lowest Amount",
                      }
                      return orderingLabels[filters.ordering] || "Newest First"
                    })(),
                  }}
                  onChange={(option) => handleFilterChange("ordering", option?.value || "-created_at")}
                  options={[
                    { value: "-created_at", label: "Newest First" },
                    { value: "created_at", label: "Oldest First" },
                    { value: "name", label: "Name A-Z" },
                    { value: "-name", label: "Name Z-A" },
                    { value: "-amount_available", label: "Highest Amount" },
                    { value: "amount_available", label: "Lowest Amount" },
                  ]}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      "&:hover": {
                        borderColor: "#3b82f6",
                      },
                    }),
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total_sources}</div>
            <p className="text-xs text-muted-foreground">Active funding sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total_available.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all currencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.allocation_percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of available funds allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summaryStats.expired_count + summaryStats.expiring_soon_count}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.expired_count} expired, {summaryStats.expiring_soon_count} expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funding Sources Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading funding sources..." />
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading funding sources</p>
            </div>
          </CardContent>
        </Card>
      ) : fundingSources.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2" />
              <p>No funding sources found</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-2" variant="outline">
                Add your first funding source
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundingSources.map((source: any) => {
            const availabilityStatus = getAvailabilityStatus(source)
            const StatusIcon = availabilityStatus.icon
            const allocationPercentage =
              source.amount_available > 0
                ? (Number.parseFloat(source.amount_allocated || "0") / Number.parseFloat(source.amount_available)) * 100
                : 0

            return (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-6">{source.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getFundingTypeColor(source.funding_type)}>
                          {source.funding_type.replace("_", " ")}
                        </Badge>
                        <div className={cn("flex items-center gap-1", availabilityStatus.color)}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-xs capitalize">{availabilityStatus.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(source)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(source)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="font-medium">{source.formatted_amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Allocated</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(source.currency?.code || "", source.amount_allocated)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(source.currency?.code || "", source.amount_remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Allocation Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Allocation</span>
                      <span>{allocationPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          allocationPercentage >= 90
                            ? "bg-red-500"
                            : allocationPercentage >= 70
                              ? "bg-orange-500"
                              : "bg-blue-500",
                        )}
                        style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {source.available_until && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Expires {format(new Date(source.available_until), "MMM dd, yyyy")}</span>
                    </div>
                  )}

                  {source.linked_source && (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                      Linked to: {source.linked_source}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <AddFundingSourceDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setSelectedFundingSource(null)
        }}
        fundingSource={selectedFundingSource}
        onSuccess={(action, fundingSourceName) => {
          if (action === "create") {
            toast.success(`Funding source "${fundingSourceName}" created successfully!`)
          } else if (action === "update") {
            toast.success(`Funding source "${fundingSourceName}" updated successfully!`)
          }
        }}
      />

      <FundingSourceDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        fundingSource={selectedFundingSource}
        onEdit={(source) => {
          setShowDetailDialog(false)
          setSelectedFundingSource(source)
          setShowAddDialog(true)
        }}
      />
    </div>
  )
}
