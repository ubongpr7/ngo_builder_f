"use client"
import { useState } from "react"
import { useGetPreviewInProfileRolesQuery, useGetUserLoggedInProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Edit, AlertTriangle, ExternalLink, Linkedin, Link2, Phone, Mail, Shield } from "lucide-react"
import type { UserProfile } from "@/components/interfaces/profile"
import type { AddressFormData } from "@/components/interfaces/kyc-forms"
import Link from "next/link"
import { ProfileImageUploaderButton } from "@/components/kyc/ProfileImageUploaderButton"
import { VerificationBadge } from "@/components/profile/VerificationBadge"
import { useParams } from "next/navigation"

export default function ProfilePage() {
  const { reference } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const { data: userProfile, isLoading, error, refetch } = useGetPreviewInProfileRolesQuery(reference)

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (error) {
      return dateString
    }
  }

  const calculateProfileCompleteness = (profile: UserProfile) => {
    if (!profile) return 0

    const profileData = profile 

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
    )?.length
    return Math.round((completedFields / requiredFields?.length) * 100)
  }

  // Get role badges
  const getRoleBadges = (profile: UserProfile) => {
    if (!profile) return []

    // Use profile_data for roles
    const profileData = profile 

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

    if (profileData.role_summary && profileData.role_summary?.length > 0) {
      return profileData.role_summary
    }

    return roles
  }
  interface Address {
    street_number?: string
    street?: string
    city?: string | { name: string }
    subregion?: string | { name: string }
    region?: string | { name: string }
    country?: string | { name: string }
    postal_code?: string
  }

  const formatAddress = (address: Address) => {
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

    const profileData = profile 

    if (profileData.is_kyc_verified) {
      return {
        isVerified: true,
        status: "verified",
        date: profileData.kyc_verification_date ? formatDate(profileData.kyc_verification_date) : null,
      }
    }

    // If the user has submitted KYC but not yet verified
    if (
      profileData.kyc_status?.status === "pending" ||
      (profileData.id_document_type &&
        profileData.id_document_number &&
        profileData.id_document_image_front &&
        profileData.selfie_image)
    ) {
      return { isVerified: false, status: "pending" }
    }

    // If the user's verification was rejected
    if (profileData.kyc_rejection_reason) {
      return { isVerified: false, status: "rejected" }
    }

    // Default: not verified
    return { isVerified: false, status: "unverified" }
  }

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-4 px-4 sm:py-6 sm:px-6">
        <Card className="overflow-hidden">
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
                ?.map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    
    return (
      <div className="container max-w-3xl mx-auto py-4 px-4 sm:py-6 sm:px-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle></AlertTitle>
          <AlertDescription>Failed to load profile data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract profile data, handling both direct and nested structures
  const profile = userProfile
  const profileData = profile.profile_data || profile
  const completeness = calculateProfileCompleteness(profile)
  const roleBadges = getRoleBadges(profile)
  const verification = getVerificationStatus(profile)

  return (
    <div className="container max-w-3xl mx-auto py-4 px-4 sm:py-6 sm:px-6">
      <Card className="overflow-hidden">
        <CardHeader className="relative pb-0">

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Avatar className="h-24 w-24 border-2 border-white shadow-sm">
                <AvatarImage src={profileData.profile_image || "/placeholder.svg"} alt={profileData.first_name} />
                <AvatarFallback className="bg-green-100 text-green-800 text-xl font-semibold">
                  {getInitials(profileData)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-1.5 cursor-pointer shadow-md">
                
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {profileData.first_name} {profileData.last_name}
            </CardTitle>

            <CardDescription className="text-base mt-1">
              {profileData.position} {profileData.organization ? `at ${profileData.organization}` : ""}
            </CardDescription>

            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {roleBadges?.map((role) => (
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
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="personal" className="text-xs py-1.5 px-1 sm:text-sm">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="professional" className="text-xs py-1.5 px-1 sm:text-sm">
                Professional
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs py-1.5 px-1 sm:text-sm">
                Contact
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

                  {!verification.isVerified && verification.status !== "pending" && (
                    <div className="mt-2">
                      <Link href="/kyc" className="text-xs text-green-600 hover:text-green-700 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Complete identity verification
                      </Link>
                    </div>
                  )}

                  {verification.status === "pending" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Your verification is being processed. This usually takes 1-2 business days.
                    </p>
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
                  {profileData.expertise_details && profileData.expertise_details?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profileData.expertise_details?.map((item:{name:string, id:number}) => (
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
