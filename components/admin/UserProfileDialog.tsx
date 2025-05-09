"use client"

import type React from "react"

import { useState } from "react"
import { useGetUserProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useGetKYCDocumentsQuery, useVerifyKYCMutation } from "@/redux/features/admin/kyc-verification"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Linkedin,
  Link2,
  Phone,
  Mail,
  Shield,
  Flag,
  X,
  AlertCircle,
} from "lucide-react"
import type { UserProfile } from "@/components/interfaces/profile"
import type { AddressFormData } from "@/components/interfaces/kyc-forms"
import { VerificationBadge } from "@/components/profile/VerificationBadge"

interface UserProfileDialogProps {
  userId: number
  trigger?: React.ReactNode
  onVerificationChange?: () => void
  defaultOpen?: boolean
}

export function UserProfileDialog({
  userId,
  trigger,
  onVerificationChange,
  defaultOpen = false,
}: UserProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [activeTab, setActiveTab] = useState("personal")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false)
  const [flagReason, setFlagReason] = useState("")

  const { toast } = useToast()

  // Fetch user profile data
  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileDetailsQuery(userId, {
    skip: !userId || !isOpen,
  })

  // Fetch KYC documents
  const { data: kycDocuments, isLoading: isLoadingDocuments } = useGetKYCDocumentsQuery(userId, {
    skip: !userId || !isOpen,
  })

  // Verification mutation
  const [verifyKYC, { isLoading: isVerifying }] = useVerifyKYCMutation()

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString || "Not available"
    }
  }

  // Calculate profile completeness
  const calculateProfileCompleteness = (profile: UserProfile) => {
    if (!profile) return 0

    // Use profile_data for completeness calculation
    const profileData = profile.profile_data || profile

    const requiredFields = [
      profileData.first_name,
      profileData.last_name,
      profileData.email,
      profileData.user_date_of_birth || profileData.date_of_birth,
      profileData.phone_number,
      profileData.bio,
      profileData.address_details,
      profileData.organization,
      profileData.position,
      profileData.industry_details || (profileData.industry && typeof profileData.industry !== "number"),
    ]

    const completedFields = requiredFields.filter(
      (field) => field !== null && field !== undefined && field !== "",
    ).length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  // Get role badges
  const getRoleBadges = (profile: UserProfile) => {
    if (!profile) return []

    // Use profile_data for roles
    const profileData = profile.profile_data || profile

    const roles = []
    if (profileData.is_standard_member) roles.push("Standard Member")
    if (profileData.is_DB_executive) roles.push("DBEF Executive")
    if (profileData.is_ceo) roles.push("CEO")
    if (profileData.is_donor) roles.push("Donor")
    if (profileData.is_volunteer) roles.push("Volunteer")
    if (profileData.is_partner) roles.push("Partner")
    if (profileData.is_DB_staff) roles.push("DBEF Staff")
    if (profileData.is_DB_admin) roles.push("DBEF Admin")
    if (profileData.is_benefactor) roles.push("Benefactor")
    if (profileData.is_country_director) roles.push("Country Director")
    if (profileData.is_regional_head) roles.push("Regional Head")
    if (profileData.is_project_manager) roles.push("Project Manager")

    // If role_summary exists, use it instead
    if (profileData.role_summary && profileData.role_summary.length > 0) {
      return profileData.role_summary
    }

    return roles
  }

  // Format address
  const formatAddress = (address: AddressFormData) => {
    if (!address) return "No address provided"

    const parts = []
    if (address.street) {
      const streetNumber = address.street_number ? `${address.street_number} ` : ""
      parts.push(`${streetNumber}${address.street}`)
    }

    if (address.city) parts.push(typeof address.city === "object" ? address.city.name : address.city)
    if (address.subregion)
      parts.push(typeof address.subregion === "object" ? address.subregion.name : address.subregion)
    if (address.region) parts.push(typeof address.region === "object" ? address.region.name : address.region)
    if (address.country) parts.push(typeof address.country === "object" ? address.country.name : address.country)
    if (address.postal_code) parts.push(address.postal_code)

    return parts.join(", ")
  }

  // Get initials for avatar fallback
  const getInitials = (profile: UserProfile) => {
    if (!profile) return "U"

    const firstName = profile.first_name || ""
    const lastName = profile.last_name || ""

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"
  }

  // Get verification status
  const getVerificationStatus = (profile: UserProfile) => {
    if (!profile) return { isVerified: false, status: "unverified" }

    const profileData = profile.profile_data || profile

    if (profileData.is_kyc_verified) {
      return {
        isVerified: true,
        status: "approved",
        date: profileData.kyc_verification_date ? formatDate(profileData.kyc_verification_date) : null,
      }
    }

    // Check for kyc_status field first (new field)
    if (profileData.kyc_status) {
      return {
        isVerified: profileData.kyc_status === "approved",
        status: profileData.kyc_status,
        date: profileData.kyc_verification_date ? formatDate(profileData.kyc_verification_date) : null,
      }
    }

    // If the user has submitted KYC but not yet verified
    if (
      profileData.id_document_type &&
      profileData.id_document_number &&
      profileData.id_document_image_front &&
      profileData.selfie_image
    ) {
      return { isVerified: false, status: "pending" }
    }

    // If the user's verification was rejected
    if (profileData.kyc_rejection_reason) {
      return {
        isVerified: false,
        status: "rejected",
        reason: profileData.kyc_rejection_reason,
      }
    }

    // Default: not verified
    return { isVerified: false, status: "unverified" }
  }

  // Handle verification actions
  const handleVerification = async (action: "approve" | "reject" | "flag" | "mark_scammer", reason?: string) => {
    if ((action === "reject" || action === "flag") && !reason) {
      toast({
        title: "Error",
        description: `Please provide a reason for ${action === "reject" ? "rejection" : "flagging"}.`,
        variant: "destructive",
      })
      return
    }

    try {
      await verifyKYC({
        profileId: userId,
        data: {
          action,
          reason,
        },
      }).unwrap()

      toast({
        title: "Success",
        description: `User has been ${
          action === "approve"
            ? "verified"
            : action === "reject"
              ? "rejected"
              : action === "flag"
                ? "flagged"
                : "marked as scammer"
        } successfully.`,
      })

      // Reset states
      setRejectionReason("")
      setFlagReason("")
      setIsRejectDialogOpen(false)
      setIsFlagDialogOpen(false)

      // Refetch data
      refetch()

      // Notify parent component
      if (onVerificationChange) {
        onVerificationChange()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update verification status.",
        variant: "destructive",
      })
    }
  }

  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false)
    setActiveTab("personal")
    setRejectionReason("")
    setFlagReason("")
    setIsRejectDialogOpen(false)
    setIsFlagDialogOpen(false)
  }

  const profileContent = () => {
    if (isLoading) {
      return (
        <Card className="overflow-hidden border-0 shadow-none">
          <CardHeader className="pb-0">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-40 mb-3" />
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-36 mb-4" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load profile data. Please try again later.</AlertDescription>
        </Alert>
      )
    }

    // Extract profile data, handling both direct and nested structures
    const profile = userProfile
    const profileData = profile.profile_data || profile
    const completeness = calculateProfileCompleteness(profile)
    const roleBadges = getRoleBadges(profile)
    const verification = getVerificationStatus(profile)

    return (
      <Card className="overflow-hidden border-0 shadow-none">
        <CardHeader className="relative pb-0">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Avatar className="h-24 w-24 border-2 border-white shadow-sm">
                <AvatarImage src={profileData.profile_image || "/placeholder.svg"} alt={profileData.first_name} />
                <AvatarFallback className="bg-green-100 text-green-800 text-xl font-semibold">
                  {getInitials(profileData)}
                </AvatarFallback>
              </Avatar>

              {/* Verification badge on avatar */}
              {verification.isVerified && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold">
              {profileData.first_name} {profileData.last_name}
            </CardTitle>

            <CardDescription className="text-base mt-1">
              {profileData.position} {profileData.organization ? `at ${profileData.organization}` : ""}
            </CardDescription>

            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {roleBadges.map((role) => (
                <Badge key={role} variant="secondary" className="font-medium text-xs px-2 py-0.5">
                  {role}
                </Badge>
              ))}

              {/* Enhanced verification badge */}
              <VerificationBadge
                isVerified={verification.isVerified}
                verificationStatus={verification.status}
                verificationDate={verification.date}
                size="md"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">Member since {formatDate(profileData.created_at)}</p>
          </div>

          {/* Profile Completeness */}
          <div className="mt-6 bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium">Profile Completeness</span>
              <span className="text-xs font-medium">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-1.5" />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="personal" className="text-xs py-1.5 px-1 sm:text-sm">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="professional" className="text-xs py-1.5 px-1 sm:text-sm">
                Professional
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs py-1.5 px-1 sm:text-sm">
                Contact
              </TabsTrigger>
              <TabsTrigger value="kyc" className="text-xs py-1.5 px-1 sm:text-sm">
                KYC Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Name</h3>
                  <p className="text-sm">
                    {profileData.first_name} {profileData.last_name}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Email Address</h3>
                  <p className="text-sm">{profileData.email}</p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Date of Birth</h3>
                  <p className="text-sm">
                    {profileData.user_date_of_birth || profileData.date_of_birth
                      ? formatDate(profileData.user_date_of_birth || profileData.date_of_birth)
                      : "Not provided"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Gender</h3>
                  <p className="text-sm capitalize">{profileData.sex || "Not provided"}</p>
                </div>

                {profileData.disability && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Disability</h3>
                    <p className="text-sm">
                      {typeof profileData.disability === "object"
                        ? profileData.disability.name
                        : profileData.disability}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio</h3>
                  <p className="text-sm whitespace-pre-wrap">{profileData.bio || "No bio provided"}</p>
                </div>

                {/* Verification status section */}
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">Verification Status</h3>
                    <VerificationBadge
                      isVerified={verification.isVerified}
                      verificationStatus={verification.status}
                      verificationDate={verification.date}
                      size="sm"
                    />
                  </div>

                  {verification.status === "rejected" && verification.reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                      <p className="font-medium">Rejection reason:</p>
                      <p>{verification.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Organization/Company</h3>
                  <p className="text-sm">{profileData.organization || "Not provided"}</p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Position/Title</h3>
                  <p className="text-sm">{profileData.position || "Not provided"}</p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Industry</h3>
                  <p className="text-sm">
                    {profileData.industry_details
                      ? profileData.industry_details.name
                      : typeof profileData.industry === "object"
                        ? profileData.industry.name
                        : "Not provided"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Company Size</h3>
                  <p className="text-sm">{profileData.company_size || "Not provided"}</p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Company Website</h3>
                  {profileData.company_website ? (
                    <a
                      href={profileData.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <span className="truncate">{profileData.company_website}</span>
                      <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm">Not provided</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Areas of Expertise</h3>
                  {profileData.expertise_details && profileData.expertise_details.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profileData.expertise_details.map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs font-normal">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">No expertise areas provided</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Phone Number</h3>
                  {profileData.phone_number ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <a href={`tel:${profileData.phone_number}`} className="text-sm text-blue-600 hover:underline">
                        {profileData.phone_number}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm">Not provided</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Email Address</h3>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <a href={`mailto:${profileData.email}`} className="text-sm text-blue-600 hover:underline">
                      {profileData.email}
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Address</h3>
                  <p className="text-sm">
                    {profileData.address_details ? formatAddress(profileData.address_details) : "No address provided"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile</h3>
                  {profileData.linkedin_profile ? (
                    <a
                      href={profileData.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <p className="text-sm">Not provided</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Personal Website</h3>
                  {profileData.profile_link ? (
                    <a
                      href={profileData.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{profileData.profile_link}</span>
                      <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm">Not provided</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kyc" className="mt-4">
              {isLoadingDocuments ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                </div>
              ) : kycDocuments ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-md p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">KYC Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Document Type</p>
                        <p className="text-sm font-medium">{kycDocuments.id_document_type || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Document Number</p>
                        <p className="text-sm font-medium">{kycDocuments.id_document_number || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submission Date</p>
                        <p className="text-sm font-medium">{formatDate(kycDocuments.kyc_submission_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Verification Status</p>
                        <VerificationBadge
                          isVerified={verification.isVerified}
                          verificationStatus={verification.status}
                          verificationDate={verification.date}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Verification Documents</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <h4 className="text-xs font-medium text-center">ID Document (Front)</h4>
                        </div>
                        {kycDocuments.id_document_image_front ? (
                          <div className="p-2">
                            <img
                              src={kycDocuments.id_document_image_front || "/placeholder.svg"}
                              alt="ID Front"
                              className="w-full h-auto object-contain max-h-60"
                            />
                          </div>
                        ) : (
                          <div className="h-40 flex items-center justify-center bg-gray-50">
                            <p className="text-sm text-gray-400">No image provided</p>
                          </div>
                        )}
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <h4 className="text-xs font-medium text-center">ID Document (Back)</h4>
                        </div>
                        {kycDocuments.id_document_image_back ? (
                          <div className="p-2">
                            <img
                              src={kycDocuments.id_document_image_back || "/placeholder.svg"}
                              alt="ID Back"
                              className="w-full h-auto object-contain max-h-60"
                            />
                          </div>
                        ) : (
                          <div className="h-40 flex items-center justify-center bg-gray-50">
                            <p className="text-sm text-gray-400">No image provided</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-2">
                        <h4 className="text-xs font-medium text-center">Selfie with ID</h4>
                      </div>
                      {kycDocuments.selfie_image ? (
                        <div className="p-2">
                          <img
                            src={kycDocuments.selfie_image || "/placeholder.svg"}
                            alt="Selfie with ID"
                            className="w-full h-auto object-contain max-h-80"
                          />
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center bg-gray-50">
                          <p className="text-sm text-gray-400">No image provided</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {verification.status === "rejected" && verification.reason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-red-700 mb-2">Rejection Reason</h3>
                      <p className="text-sm text-red-600">{verification.reason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No KYC Documents</h3>
                  <p className="text-gray-500">This user has not submitted any KYC documents yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        {verification.status === "pending" && (
          <CardFooter className="flex flex-wrap justify-end gap-2 border-t p-4">
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600"
              onClick={() => setIsFlagDialogOpen(true)}
              disabled={isVerifying}
            >
              <Flag className="h-4 w-4 mr-1" /> Flag for Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600"
              onClick={() => handleVerification("approve")}
              disabled={isVerifying}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={() => setIsRejectDialogOpen(true)}
              disabled={isVerifying}
            >
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger || <Button variant="outline">View Profile</Button>}</DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" closeButton={false}>
          <div className="absolute right-4 top-4 z-10">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          {profileContent()}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this user's verification.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleVerification("reject", rejectionReason)}
              disabled={!rejectionReason.trim() || isVerifying}
            >
              {isVerifying ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Flag for Review</DialogTitle>
            <DialogDescription>Please provide a reason for flagging this user for further review.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for flagging..."
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => handleVerification("flag", flagReason)}
              disabled={!flagReason.trim() || isVerifying}
            >
              {isVerifying ? "Processing..." : "Flag User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
