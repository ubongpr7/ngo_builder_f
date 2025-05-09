"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertCircle, Search, Eye, Flag, Mail, Edit } from "lucide-react"
import {
  useGetKYCStatsQuery,
  useGetKYCSubmissionsByStatusQuery,
  useSearchKYCSubmissionsQuery,
  useVerifyKYCMutation,
  useBulkVerifyKYCMutation,
  useSendKYCReminderMutation,
} from "@/redux/features/admin/kyc-verification"
import { UserProfileDialog } from "@/components/admin/UserProfileDialog"
import { VerificationCodeDialog } from "@/components/admin/VerificationCodeDialog"
import type { UserProfile } from "@/components/interfaces/profile"

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

  const { toast } = useToast()
  const hasCompletedKYC = (profile: UserProfile) => {
    if (!profile) return false

    const profileData = profile.profile_data || profile

    return !!(
      profileData?.id_document_type &&
      profileData?.id_document_number &&
      profileData?.id_document_image_front &&
      profileData?.selfie_image
    )
  }

  // Fetch KYC stats
  const { data: kycStats, isLoading: isLoadingStats } = useGetKYCStatsQuery()

  // Fetch KYC submissions based on active tab
  const { data: profiles, isLoading: isLoadingProfiles, refetch } = useGetKYCSubmissionsByStatusQuery(activeTab)

  // Search functionality
  const { data: searchResults, isLoading: isLoadingSearch } = useSearchKYCSubmissionsQuery(searchTerm, {
    skip: !searchTerm,
  })

  // Mutations for verification actions
  const [verifyKYC, { isLoading: isVerifying }] = useVerifyKYCMutation()
  const [bulkVerifyKYC, { isLoading: isBulkVerifying }] = useBulkVerifyKYCMutation()
  const [sendKYCReminder, { isLoading: isSendingReminder }] = useSendKYCReminderMutation()

  // Get display data based on search or active tab
  const displayProfiles = searchTerm ? searchResults : profiles

  // Reset selected profiles when tab changes or profiles change
  useEffect(() => {
    setSelectedProfiles([])
    setSelectAll(false)
  }, [activeTab, profiles])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked && displayProfiles) {
      // Only select profiles that have completed KYC if we're in the pending tab
      if (activeTab === "pending") {
        const completedProfileIds = displayProfiles
          .filter((profile) => hasCompletedKYC(profile))
          .map((profile) => profile.id)
        setSelectedProfiles(completedProfileIds)
      } else {
        setSelectedProfiles(displayProfiles.map((profile) => profile.id))
      }
    } else {
      setSelectedProfiles([])
    }
  }

  // Handle individual profile selection for bulk actions
  const handleProfileSelection = (profileId: number, checked: boolean) => {
    if (checked) {
      setSelectedProfiles([...selectedProfiles, profileId])
    } else {
      setSelectedProfiles(selectedProfiles.filter((id) => id !== profileId))
      setSelectAll(false)
    }
  }

  // Handle verification change
  const handleVerificationChange = () => {
    refetch()
  }

  // Handle sending KYC reminder
  const handleSendReminder = async (userId: number) => {
    try {
      const response = await sendKYCReminder(userId).unwrap()

      toast({
        title: "Success",
        description: response.message || "Reminder sent successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.error || "Failed to send reminder.",
        variant: "destructive",
      })
    }
  }

  // Handle edit profile button click
  const handleEditProfile = (profileId: number) => {
    setSelectedProfileForEdit(profileId)
    setShowVerificationDialog(true)
  }

  // Handle verification success
  const handleVerificationSuccess = (profileData: any) => {
    setEditedProfileData(profileData)
    // The dialog will automatically switch to the edit view
  }

  // Handle profile edit completion
  const handleProfileEditComplete = () => {
    setShowVerificationDialog(false)
    setSelectedProfileForEdit(null)
    setEditedProfileData(null)
    refetch()

    toast({
      title: "Profile Updated",
      description: "The user profile has been successfully updated.",
    })
  }

  // Handle bulk action dialog
  const handleBulkActionDialog = (action: "approve" | "reject" | "flag" | "mark_scammer") => {
    if (selectedProfiles.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile to perform this action.",
        variant: "destructive",
      })
      return
    }

    // Check if any selected profiles don't have complete KYC for approval
    if (action === "approve" && profiles) {
      const incompleteProfiles = selectedProfiles.filter(
        (id) => !hasCompletedKYC(profiles.find((profile) => profile.id === id)),
      )

      if (incompleteProfiles.length > 0) {
        toast({
          title: "Incomplete KYC Documents",
          description: `${incompleteProfiles.length} selected profile(s) have incomplete KYC documents and cannot be approved.`,
          variant: "destructive",
        })
        return
      }
    }

    setBulkAction(action)
    setShowBulkDialog(true)
  }

  // Handle bulk action submission
  const handleBulkAction = async () => {
    if (bulkAction === "") return

    if (bulkAction !== "approve" && !bulkReason) {
      toast({
        title: "Reason required",
        description: `Please provide a reason for ${bulkAction} action.`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await bulkVerifyKYC({
        profile_ids: selectedProfiles,
        action: bulkAction,
        reason: bulkReason,
      }).unwrap()

      toast({
        title: "Success",
        description: response.message,
      })

      setSelectedProfiles([])
      setSelectAll(false)
      setBulkAction("")
      setBulkReason("")
      setShowBulkDialog(false)
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.error || "Failed to perform bulk action",
        variant: "destructive",
      })
    }
  }

  // Handle individual verification actions
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

      toast({
        title: "Success",
        description: response.message,
      })

      setRejectionReason("")
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.error || "Failed to update verification status",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase()
  }

  // Get status badge
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

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">KYC Verification Dashboard</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending">
            Pending {!isLoadingStats && <Badge className="ml-2 bg-yellow-500">{kycStats?.pending || 0}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Verified {!isLoadingStats && <Badge className="ml-2 bg-green-500">{kycStats?.approved || 0}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected {!isLoadingStats && <Badge className="ml-2 bg-red-500">{kycStats?.rejected || 0}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Select All Checkbox */}
        {displayProfiles && displayProfiles.length > 0 && activeTab === "pending" && (
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
        {selectedProfiles.length > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium">{selectedProfiles.length} profiles selected</span>
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
        {isLoadingProfiles || isLoadingSearch ? (
          // Loading state
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
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
            {displayProfiles && displayProfiles.length > 0 ? (
              displayProfiles.map((profile) => {
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
                                    ? `Verified: ${formatDate(profile.kyc_verification_date)}`
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

                                      toast({
                                        title: "Success",
                                        description: "User has been verified successfully.",
                                      })

                                      refetch()
                                    } catch (error: any) {
                                      toast({
                                        title: "Error",
                                        description: error.data?.error || "Failed to verify user.",
                                        variant: "destructive",
                                      })
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

                          {activeTab !== "pending" && getStatusBadge(profile.kyc_status.status)}
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
                  {searchTerm
                    ? "No results found"
                    : activeTab === "pending"
                      ? "No pending verifications"
                      : activeTab === "approved"
                        ? "No verified users"
                        : "No rejected verifications"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try a different search term"
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
