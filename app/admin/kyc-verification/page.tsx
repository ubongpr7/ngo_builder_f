"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertCircle, Search, Eye, Flag, Mail, Edit, Filter, X } from "lucide-react"
import Select from "react-select"
import {
  useGetKYCStatsQuery,
  useGetKYCSubmissionsByStatusQuery,
  useSearchKYCSubmissionsQuery,
  useFilterKYCSubmissionsQuery,
  useVerifyKYCMutation,
  useBulkVerifyKYCMutation,
  useSendKYCReminderMutation,
  type KYCProfile,
  type GeoFilterParams,
} from "@/redux/features/admin/kyc-verification"
import { useGetCountriesQuery, useGetRegionsQuery, useGetSubregionsQuery } from "@/redux/features/common/typeOF"
import { UserProfileDialog } from "@/components/admin/UserProfileDialog"
import { VerificationCodeDialog } from "@/components/admin/VerificationCodeDialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "react-toastify"

// Define option type for react-select
interface SelectOption {
  value: string
  label: string
}

export default function KYCVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | "flag" | "mark_scammer" | "">("")
  const [bulkReason, setBulkReason] = useState("")
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [selectedProfileForEdit, setSelectedProfileForEdit] = useState<number | null>(null)
  const [editedProfileData, setEditedProfileData] = useState<any>(null)

  // Local state for tab counts to ensure they update immediately
  const [localStats, setLocalStats] = useState<{
    pending: number
    approved: number
    rejected: number
    flagged: number
    scammer: number
    total: number
  } | null>(null)

  // Geographic filtering state
  const [showFilters, setShowFilters] = useState(false)
  const [geoSearch, setGeoSearch] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [selectedSubregion, setSelectedSubregion] = useState<number | null>(null)

  const hasCompletedKYC = (profile: KYCProfile) => {
    if (!profile) return false

    const profileData = profile

    return !!(
      profileData?.id_document_type &&
      profileData?.id_document_number &&
      profileData?.id_document_image_front &&
      profileData?.selfie_image
    )
  }

  // Geographic data queries
  const { data: countries } = useGetCountriesQuery()
  const { data: regions } = useGetRegionsQuery(selectedCountry || 0, {
    skip: !selectedCountry,
  })
  const { data: subregions } = useGetSubregionsQuery(selectedRegion || 0, {
    skip: !selectedRegion,
  })

  // Convert data to react-select options
  const countryOptions: SelectOption[] = useMemo(() => {
    if (!countries) return []
    return [
      { value: "all", label: "All Countries" },
      ...countries?.map((country) => ({
        value: country.id.toString(),
        label: country.name,
      })),
    ]
  }, [countries])

  const regionOptions: SelectOption[] = useMemo(() => {
    if (!regions) return []
    return [
      { value: "all", label: "All Regions" },
      ...regions?.map((region) => ({
        value: region.id.toString(),
        label: region.name,
      })),
    ]
  }, [regions])

  const subregionOptions: SelectOption[] = useMemo(() => {
    if (!subregions) return []
    return [
      { value: "all", label: "All Subregions" },
      ...subregions?.map((subregion) => ({
        value: subregion.id.toString(),
        label: subregion.name,
      })),
    ]
  }, [subregions])

  const { data: kycStats, isLoading: isLoadingStats, refetch: refetchStats } = useGetKYCStatsQuery()

  // Initialize local stats from API data
  useEffect(() => {
    if (kycStats && !localStats) {
      setLocalStats(kycStats)
    }
  }, [kycStats, localStats])

  // Build filter params
  const filterParams = useMemo<GeoFilterParams>(() => {
    const params: GeoFilterParams = {
      kyc_status: activeTab,
    }

    if (searchTerm) {
      params.search = searchTerm
    }

    if (geoSearch) {
      params.geo_search = geoSearch
    }

    if (selectedCountry) {
      params.country_id = selectedCountry
    }

    if (selectedRegion) {
      params.region_id = selectedRegion
    }

    if (selectedSubregion) {
      params.subregion_id = selectedSubregion
    }

    return params
  }, [activeTab, searchTerm, geoSearch, selectedCountry, selectedRegion, selectedSubregion])

  // Use the filter query instead of the status query when filters are applied
  const isFiltering = !!(selectedCountry || geoSearch)

  const {
    data: profilesByStatus,
    isLoading: isLoadingProfiles,
    refetch: refetchByStatus,
  } = useGetKYCSubmissionsByStatusQuery(activeTab, { skip: isFiltering })

  const {
    data: filteredProfiles,
    isLoading: isLoadingFiltered,
    refetch: refetchFiltered,
  } = useFilterKYCSubmissionsQuery(filterParams, { skip: !isFiltering })

  const { data: searchResults, isLoading: isLoadingSearch } = useSearchKYCSubmissionsQuery(searchTerm, {
    skip: !searchTerm || isFiltering,
  })

  const [verifyKYC, { isLoading: isVerifying }] = useVerifyKYCMutation()
  const [bulkVerifyKYC, { isLoading: isBulkVerifying }] = useBulkVerifyKYCMutation()
  const [sendKYCReminder, { isLoading: isSendingReminder }] = useSendKYCReminderMutation()

  // Determine which profiles to display
  const displayProfiles = useMemo(() => {
    if (isFiltering) {
      return filteredProfiles || []
    }
    return searchTerm ? searchResults : profilesByStatus
  }, [isFiltering, filteredProfiles, searchTerm, searchResults, profilesByStatus])

  const refetch = () => {
    if (isFiltering) {
      refetchFiltered()
    } else {
      refetchByStatus()
    }
    // Always refetch stats to update tab counts
    refetchStats()
  }

  useEffect(() => {
    setSelectedProfiles([])
    setSelectAll(false)
  }, [activeTab, displayProfiles])

  // Reset region and subregion when country changes
  useEffect(() => {
    setSelectedRegion(null)
    setSelectedSubregion(null)
  }, [selectedCountry])

  // Reset subregion when region changes
  useEffect(() => {
    setSelectedSubregion(null)
  }, [selectedRegion])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
    // Reset geographic filters when changing tabs
    resetFilters()
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleGeoSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeoSearch(e.target.value)
  }

  const resetFilters = () => {
    setSelectedCountry(null)
    setSelectedRegion(null)
    setSelectedSubregion(null)
    setGeoSearch("")
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked && displayProfiles) {
      if (activeTab === "pending") {
        const completedProfileIds = displayProfiles
          .filter((profile) => hasCompletedKYC(profile))
          ?.map((profile) => profile.id)
        setSelectedProfiles(completedProfileIds)
      } else {
        setSelectedProfiles(displayProfiles?.map((profile) => profile.id))
      }
    } else {
      setSelectedProfiles([])
    }
  }

  const handleProfileSelection = (profileId: number, checked: boolean) => {
    if (checked) {
      setSelectedProfiles([...selectedProfiles, profileId])
    } else {
      setSelectedProfiles(selectedProfiles.filter((id) => id !== profileId))
      setSelectAll(false)
    }
  }

  const handleVerificationChange = () => {
    refetch()
  }

  // Update local stats when a verification status changes
  const updateLocalStats = (fromStatus: string, toStatus: string, count = 1) => {
    if (!localStats) return

    const newStats = { ...localStats }

    // Decrease count from original status
    if (fromStatus === "pending") newStats.pending -= count
    else if (fromStatus === "approved") newStats.approved -= count
    else if (fromStatus === "rejected") newStats.rejected -= count
    else if (fromStatus === "flagged") newStats.flagged -= count
    else if (fromStatus === "scammer") newStats.scammer -= count

    // Increase count in new status
    if (toStatus === "pending") newStats.pending += count
    else if (toStatus === "approved") newStats.approved += count
    else if (toStatus === "rejected") newStats.rejected += count
    else if (toStatus === "flagged") newStats.flagged += count
    else if (toStatus === "scammer") newStats.scammer += count

    setLocalStats(newStats)
  }

  const handleSendReminder = async (userId: number) => {
    try {
      const response = await sendKYCReminder(userId).unwrap()
      toast.success("Reminder sent successfully.")
    } catch (error: any) {
      toast.error("Failed to send reminder.")
    }
  }

  const handleEditProfile = (profileId: number) => {
    setSelectedProfileForEdit(profileId)
    setShowVerificationDialog(true)
  }

  const handleVerificationSuccess = (profileData: any) => {
    setEditedProfileData(profileData)
  }

  const handleProfileEditComplete = () => {
    setShowVerificationDialog(false)
    setSelectedProfileForEdit(null)
    setEditedProfileData(null)
    refetch()
    toast.success("Profile updated successfully.")
    
  }

  const handleBulkActionDialog = (action: "approve" | "reject" | "flag" | "mark_scammer") => {
    if (selectedProfiles?.length === 0) {
      toast.error("No profiles selected")
      return
    }

    if (action === "approve" && displayProfiles) {
      const incompleteProfiles = selectedProfiles.filter((id) => {
        const profile = displayProfiles.find((profile) => profile?.id === id)
        return profile ? !hasCompletedKYC(profile) : true
      })

      if (incompleteProfiles?.length > 0) {
        toast.error("Incomplete KYC Documents") 
        
        return
      }
    }

    setBulkAction(action)
    setShowBulkDialog(true)
  }

  const handleBulkAction = async () => {
    if (bulkAction === "") return

    if (bulkAction !== "approve" && !bulkReason) {
      toast.error("`Please provide a reason for ${bulkAction} action.`")
      
      return
    }

    try {
      const response = await bulkVerifyKYC({
        profile_ids: selectedProfiles,
        action: bulkAction,
        reason: bulkReason,
      }).unwrap()

      // Update local stats for bulk actions
      if (activeTab === "pending" && bulkAction === "approve") {
        updateLocalStats("pending", "approved", selectedProfiles?.length)
      } else if (activeTab === "pending" && bulkAction === "reject") {
        updateLocalStats("pending", "rejected", selectedProfiles?.length)
      } else if (activeTab === "pending" && bulkAction === "flag") {
        updateLocalStats("pending", "flagged", selectedProfiles?.length)
      } else if (activeTab === "pending" && bulkAction === "mark_scammer") {
        updateLocalStats("pending", "scammer", selectedProfiles?.length)
      }
      toast.success(response.message)

      setSelectedProfiles([])
      setSelectAll(false)
      setBulkAction("")
      setBulkReason("")
      setShowBulkDialog(false)
      refetch()
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to perform bulk action")
    }
  }

  const handleVerification = async (
    profileId: number,
    action: "approve" | "reject" | "flag" | "mark_scammer",
    reason?: string,
  ) => {
    try {
      const response = await verifyKYC({
        profileId,
        data: {
          action,
          reason,
        },
      }).unwrap()

      // Update local stats immediately
      if (activeTab === "pending") {
        if (action === "approve") {
          updateLocalStats("pending", "approved")
        } else if (action === "reject") {
          updateLocalStats("pending", "rejected")
        } else if (action === "flag") {
          updateLocalStats("pending", "flagged")
        } else if (action === "mark_scammer") {
          updateLocalStats("pending", "scammer")
        }
      }

      toast.success(response.message)

      setRejectionReason("")
      refetch()
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to perform verification")
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "verified":
        return <Badge className="bg-green-500">Verified</Badge>
      case "approved":
        return <Badge className="bg-green-500">Verified</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "flagged":
        return <Badge className="bg-orange-500">Flagged</Badge>
      case "scammer":
        return <Badge className="bg-purple-500">Scammer</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  const isLoading = isLoadingProfiles || isLoadingSearch || isLoadingFiltered

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "36px",
      borderRadius: "0.375rem",
      borderColor: "#e2e8f0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: "0 8px",
    }),
    input: (base: any) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: "4px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#e2e8f0" : "transparent",
      color: state.isSelected ? "white" : "inherit",
      padding: "8px 12px",
      cursor: "pointer",
    }),
  }

  // Use local stats if available, otherwise use API stats
  const displayStats = localStats ||
    kycStats || { pending: 0, approved: 0, rejected: 0, flagged: 0, scammer: 0, total: 0 }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">KYC Verification Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Location
              {(selectedCountry || selectedRegion || selectedSubregion) && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCountry && selectedRegion && selectedSubregion
                    ? "3"
                    : selectedCountry && selectedRegion
                      ? "2"
                      : "1"}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-medium">Geographic Filters</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search Location</label>
                <input
                  type="text"
                  placeholder="Search by country, region..."
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={geoSearch}
                  onChange={handleGeoSearch}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select
                  options={countryOptions}
                  value={countryOptions.find((option) =>
                    selectedCountry ? option.value === selectedCountry.toString() : option.value === "all",
                  )}
                  onChange={(option) => {
                    if (option) {
                      setSelectedCountry(option.value === "all" ? null : Number(option.value))
                    } else {
                      setSelectedCountry(null)
                    }
                  }}
                  placeholder="Select country"
                  isClearable
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {selectedCountry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region/State</label>
                  <Select
                    options={regionOptions}
                    value={regionOptions.find((option) =>
                      selectedRegion ? option.value === selectedRegion.toString() : option.value === "all",
                    )}
                    onChange={(option) => {
                      if (option) {
                        setSelectedRegion(option.value === "all" ? null : Number(option.value))
                      } else {
                        setSelectedRegion(null)
                      }
                    }}
                    placeholder="Select region"
                    isClearable
                    styles={selectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              )}

              {selectedRegion && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subregion</label>
                  <Select
                    options={subregionOptions}
                    value={subregionOptions.find((option) =>
                      selectedSubregion ? option.value === selectedSubregion.toString() : option.value === "all",
                    )}
                    onChange={(option) => {
                      if (option) {
                        setSelectedSubregion(option.value === "all" ? null : Number(option.value))
                      } else {
                        setSelectedSubregion(null)
                      }
                    }}
                    placeholder="Select subregion"
                    isClearable
                    styles={selectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {(selectedCountry || geoSearch) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {geoSearch && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {geoSearch}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setGeoSearch("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedCountry && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Country: {countries?.find((c) => c.id === selectedCountry)?.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  setSelectedCountry(null)
                  setSelectedRegion(null)
                  setSelectedSubregion(null)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedRegion && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Region: {regions?.find((r) => r.id === selectedRegion)?.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  setSelectedRegion(null)
                  setSelectedSubregion(null)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedSubregion && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Subregion: {subregions?.find((s) => s.id === selectedSubregion)?.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setSelectedSubregion(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(selectedCountry || geoSearch) && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="h-6">
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending">
            Pending {!isLoadingStats && <Badge className="ml-2 bg-yellow-500">{displayStats.pending || 0}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Verified {!isLoadingStats && <Badge className="ml-2 bg-green-500">{displayStats.approved || 0}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected {!isLoadingStats && <Badge className="ml-2 bg-red-500">{displayStats.rejected || 0}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Select All Checkbox */}
        {displayProfiles && displayProfiles?.length > 0 && activeTab === "pending" && (
          <div className="mb-4 flex items-center">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              className="mr-2"
            />
            <label htmlFor="select-all" className="text-sm cursor-pointer">
              Select all profiles {activeTab === "pending" ? "with complete KYC" : ""}
            </label>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProfiles?.length > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium">{selectedProfiles?.length} profiles selected</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600"
                onClick={() => handleBulkActionDialog("approve")}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => handleBulkActionDialog("reject")}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600"
                onClick={() => handleBulkActionDialog("flag")}
              >
                <Flag className="h-4 w-4 mr-1" /> Flag All
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Action Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {bulkAction === "approve"
                  ? "Approve Selected Profiles"
                  : bulkAction === "reject"
                    ? "Reject Selected Profiles"
                    : bulkAction === "flag"
                      ? "Flag Selected Profiles"
                      : "Mark Selected Profiles as Scammers"}
              </DialogTitle>
              <DialogDescription>
                {bulkAction === "approve"
                  ? "Are you sure you want to approve all selected profiles?"
                  : `Please provide a reason for ${bulkAction === "reject" ? "rejecting" : bulkAction === "flag" ? "flagging" : "marking as scammers"} these profiles.`}
              </DialogDescription>
            </DialogHeader>

            {bulkAction !== "approve" && (
              <Textarea
                placeholder={`Reason for ${bulkAction}...`}
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
              />
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={bulkAction === "approve" ? "default" : "destructive"}
                onClick={handleBulkAction}
                disabled={isBulkVerifying || (bulkAction !== "approve" && !bulkReason)}
              >
                {isBulkVerifying ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verification Code Dialog */}
        {selectedProfileForEdit && (
          <VerificationCodeDialog
            isOpen={showVerificationDialog}
            onClose={() => {
              setShowVerificationDialog(false)
              setSelectedProfileForEdit(null)
            }}
            profileId={selectedProfileForEdit}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}

        {/* Profile Lists */}
        {isLoading ? (
          // Loading state
          <div className="grid gap-4">
            {[1, 2, 3]?.map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {displayProfiles && displayProfiles?.length > 0 ? (
              displayProfiles?.map((profile) => {
                const hasKYC = hasCompletedKYC(profile)

                return (
                  <Card key={profile.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {activeTab === "pending" && (
                            <Checkbox
                              checked={selectedProfiles.includes(profile.id)}
                              onCheckedChange={(checked) => handleProfileSelection(profile.id, checked as boolean)}
                              className="mr-2"
                              disabled={!hasKYC} // Disable checkbox for incomplete KYC profiles
                            />
                          )}
                          <Avatar>
                            <AvatarImage src={profile.profile_image || ""} alt={profile.full_name} />
                            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{profile.full_name}</h3>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-2">
                                {profile.membership_type_name || profile.role_summary?.[0] || "Member"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {activeTab === "pending"
                                  ? `Submitted: ${formatDate(profile.kyc_submission_date)}`
                                  : activeTab === "approved"
                                    ? `Verified: ${formatDate(profile.kyc_verification_date ?? "")}`
                                    : `Rejected: ${formatDate(profile.kyc_verification_date || profile.kyc_submission_date)}`}
                              </span>
                            </div>
                            {profile.kyc_rejection_reason && (
                              <p className="text-xs text-red-500 mt-1">Reason: {profile.kyc_rejection_reason}</p>
                            )}
                            {!hasKYC && activeTab === "pending" && (
                              <p className="text-xs text-orange-500 mt-1">
                                <AlertCircle className="h-3 w-3 inline mr-1" />
                                Incomplete KYC documents
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <UserProfileDialog
                            userId={profile.user_id}
                            onVerificationChange={handleVerificationChange}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            }
                          />

                          {/* Only show Edit Profile button for pending or rejected profiles */}
                          {activeTab !== "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600"
                              onClick={() => handleEditProfile(profile.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit Profile
                            </Button>
                          )}

                          {activeTab === "pending" && (
                            <>
                              {hasKYC ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600"
                                  onClick={async () => {
                                    try {
                                      await verifyKYC({
                                        profileId: profile.id,
                                        data: {
                                          action: "approve",
                                        },
                                      }).unwrap()

                                      // Update local stats immediately
                                      updateLocalStats("pending", "approved")
                                      toast.success("User has been verified successfully.")

                                      refetch()
                                    } catch (error: any) {
                                     toast.error(error.data?.error || "Failed to verify user.")
                                    }
                                  }}
                                  disabled={isVerifying}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600"
                                  onClick={() => handleSendReminder(profile.id)}
                                  disabled={isSendingReminder}
                                >
                                  <Mail className="h-4 w-4 mr-1" /> Send Reminder
                                </Button>
                              )}

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Verification</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for rejecting this verification
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleVerification(profile.id, "reject", rejectionReason)}
                                      disabled={isVerifying || !rejectionReason}
                                    >
                                      {isVerifying ? "Processing..." : "Confirm Rejection"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          {activeTab !== "pending" && getStatusBadge(profile.kyc_status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">
                  {searchTerm || isFiltering
                    ? "No results found"
                    : activeTab === "pending"
                      ? "No pending verifications"
                      : activeTab === "approved"
                        ? "No verified users"
                        : "No rejected verifications"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || isFiltering
                    ? "Try different search terms or filters"
                    : activeTab === "pending"
                      ? "All KYC submissions have been processed"
                      : activeTab === "approved"
                        ? "No users have been verified yet"
                        : "No users have been rejected yet"}
                </p>
              </div>
            )}
          </div>
        )}
      </Tabs>
    </div>
  )
}
