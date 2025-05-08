"use client"

import { useState } from "react"
import { useGetUserLoggedInProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, CheckCircle, Edit, AlertTriangle, ExternalLink, Linkedin, Link2 } from "lucide-react"
import { UserProfile } from "@/components/interfaces/profile"
import { Address } from "@/components/models/user-profile"
import { AddressFormData } from "@/components/interfaces/kyc-forms"
export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: userProfile, isLoading, error } = useGetUserLoggedInProfileDetailsQuery('')

  // Format date
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
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Calculate profile completeness
  const calculateProfileCompleteness = (profile:UserProfile) => {
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
  const getRoleBadges = (profile:UserProfile) => {
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
  const formatAddress = (address:AddressFormData) => {
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
  const getInitials = (profile:UserProfile) => {
    if (!profile) return "U"

    const firstName = profile.first_name || ""
    const lastName = profile.last_name || ""

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader className="relative">
            <div className="absolute right-6 top-6">
              <Skeleton className="h-9 w-28" />
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64 mb-2" />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-36 mt-2" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Skeleton className="h-10 w-full mb-8" />
            <div className="space-y-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array(2)
                      .fill(0)
                      .map((_, j) => (
                        <div key={j}>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ))}
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
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
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

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="relative">
          <div className="absolute right-6 top-6">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                "Cancel"
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1" /> Edit Profile
                </>
              )}
            </Button>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.profile_image || "/placeholder.svg"} alt={profileData.first_name} />
                <AvatarFallback>{getInitials(profileData)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-1 cursor-pointer">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl text-center md:text-left">
                {profileData.first_name} {profileData.last_name}
              </CardTitle>
              <CardDescription className="text-lg text-center md:text-left">
                {profileData.position} {profileData.organization ? `at ${profileData.organization}` : ""}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {profileData.membership_type && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                    {typeof profileData.membership_type === "object"
                      ? profileData.membership_type.name
                      : profileData.membership_type}
                  </Badge>
                )}
                {profileData.is_kyc_verified && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
                {roleBadges.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center md:text-left">
                Member since {formatDate(profileData.created_at)}
              </p>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm font-medium">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="professional">Professional Details</TabsTrigger>
              <TabsTrigger value="contact">Contact & Address</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Full Name</h3>
                  <p>
                    {profileData.first_name} {profileData.last_name}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Email Address</h3>
                  <p>{profileData.email}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Date of Birth</h3>
                  <p>
                    {profileData.user_date_of_birth || profileData.date_of_birth
                      ? formatDate(profileData.user_date_of_birth || profileData.date_of_birth)
                      : "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Gender</h3>
                  <p>{profileData.sex || "Not provided"}</p>
                </div>

                {profileData.disability && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-500 mb-1">Disability</h3>
                    <p>
                      {typeof profileData.disability === "object"
                        ? profileData.disability.name
                        : profileData.disability}
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Bio</h3>
                  <p className="whitespace-pre-wrap">{profileData.bio || "No bio provided"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Organization/Company</h3>
                  <p>{profileData.organization || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Position/Title</h3>
                  <p>{profileData.position || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Industry</h3>
                  <p>
                    {profileData.industry_details
                      ? profileData.industry_details.name
                      : typeof profileData.industry === "object"
                        ? profileData.industry.name
                        : "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Company Size</h3>
                  <p>{profileData.company_size || "Not provided"}</p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Company Website</h3>
                  {profileData.company_website ? (
                    <a
                      href={profileData.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      {profileData.company_website}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Areas of Expertise</h3>
                  {profileData.expertise_details && profileData.expertise_details.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profileData.expertise_details.map((item) => (
                        <Badge key={item.id} variant="outline">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p>No expertise areas provided</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Phone Number</h3>
                  <p>{profileData.phone_number || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Email Address</h3>
                  <p>{profileData.email}</p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Address</h3>
                  <p>
                    {profileData.address_details ? formatAddress(profileData.address_details) : "No address provided"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">LinkedIn Profile</h3>
                  {profileData.linkedin_profile ? (
                    <a
                      href={profileData.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn Profile
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Profile Link</h3>
                  {profileData.profile_link ? (
                    <a
                      href={profileData.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      Personal Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {isEditing && (
          <CardFooter className="flex justify-end space-x-4 border-t p-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
