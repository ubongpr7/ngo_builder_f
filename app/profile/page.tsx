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
import { formatDate } from "@/lib/utils"
import type { UserProfile } from "@/components/interfaces/profile"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: userProfile, isLoading, error } = useGetUserLoggedInProfileDetailsQuery('')

  // Calculate profile completeness
  const calculateProfileCompleteness = (profile: UserProfile | undefined) => {
    if (!profile) return 0

    const requiredFields = [
      profile.first_name,
      profile.last_name,
      profile.email,
      profile.date_of_birth,
      profile.phone_number,
      profile.bio,
      profile.address,
      profile.organization,
      profile.position,
      profile.industry,
    ]

    const completedFields = requiredFields.filter(
      (field) => field !== null && field !== undefined && field !== "",
    ).length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  // Get role badges
  const getRoleBadges = (profile: UserProfile | undefined) => {
    if (!profile) return []

    const roles = []
    if (profile.is_standard_member) roles.push("Standard Member")
    if (profile.is_DB_executive) roles.push("DBEF Executive")
    if (profile.is_ceo) roles.push("CEO")
    if (profile.is_donor) roles.push("Donor")
    if (profile.is_volunteer) roles.push("Volunteer")
    if (profile.is_partner) roles.push("Partner")
    if (profile.is_DB_staff) roles.push("DBEF Staff")
    if (profile.is_DB_admin) roles.push("DBEF Admin")
    if (profile.is_benefactor) roles.push("Benefactor")

    return roles
  }

  // Format address
  const formatAddress = (address: UserProfile["address"]) => {
    if (!address) return "No address provided"

    const parts = []
    if (address.street) {
      const streetNumber = address.street_number ? `${address.street_number} ` : ""
      parts.push(`${streetNumber}${address.street}`)
    }

    if (address.city?.name) parts.push(address.city.name)
    if (address.subregion?.name) parts.push(address.subregion.name)
    if (address.region?.name) parts.push(address.region.name)
    if (address.country?.name) parts.push(address.country.name)
    if (address.postal_code) parts.push(address.postal_code)

    return parts.join(", ")
  }

  // Get initials for avatar fallback
  const getInitials = (profile: UserProfile | undefined) => {
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

  const profile: UserProfile = userProfile || ({} as UserProfile)
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
                <AvatarImage src={profile.profile_image || "/placeholder.svg"} alt={profile.first_name} />
                <AvatarFallback>{getInitials(profile)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-1 cursor-pointer">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl text-center md:text-left">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <CardDescription className="text-lg text-center md:text-left">
                {profile.position} {profile.organization ? `at ${profile.organization}` : ""}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {profile.membership_type && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                    {profile.membership_type.name}
                  </Badge>
                )}
                {profile.is_kyc_verified && (
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
                Member since {formatDate(profile.created_at)}
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
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Email Address</h3>
                  <p>{profile.email}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Date of Birth</h3>
                  <p>{profile.date_of_birth ? formatDate(profile.date_of_birth) : "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Gender</h3>
                  <p>{profile.sex || "Not provided"}</p>
                </div>

                {profile.disability && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-500 mb-1">Disability</h3>
                    <p>{profile.disability.name}</p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Bio</h3>
                  <p className="whitespace-pre-wrap">{profile.bio || "No bio provided"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Organization/Company</h3>
                  <p>{profile.organization || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Position/Title</h3>
                  <p>{profile.position || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Industry</h3>
                  <p>{profile.industry?.name || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Company Size</h3>
                  <p>{profile.company_size || "Not provided"}</p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Company Website</h3>
                  {profile.company_website ? (
                    <a
                      href={profile.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      {profile.company_website}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Areas of Expertise</h3>
                  {profile.expertise && profile.expertise.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.expertise.map((item) => (
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
                  <p>{profile.phone_number || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Email Address</h3>
                  <p>{profile.email}</p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-500 mb-1">Address</h3>
                  <p>{profile.address ? formatAddress(profile.address) : "No address provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-1">LinkedIn Profile</h3>
                  {profile.linkedin_profile ? (
                    <a
                      href={profile.linkedin_profile}
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
                  {profile.profile_link ? (
                    <a
                      href={profile.profile_link}
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
