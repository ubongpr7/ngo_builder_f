"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Search } from "lucide-react"
import { useGetKYCSubmissionsByStatusQuery, useSearchKYCSubmissionsQuery } from "@/redux/features/admin/kyc-verification"
import { UserVerificationButton } from "@/components/admin/UserVerificationButton"

export default function KYCVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch KYC submissions based on active tab
  const { data: profiles, isLoading: isLoadingProfiles, refetch } = useGetKYCSubmissionsByStatusQuery(activeTab)

  // Search functionality
  const { data: searchResults, isLoading: isLoadingSearch } = useSearchKYCSubmissionsQuery(searchTerm, {
    skip: !searchTerm,
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Get display data based on search or active tab
  const displayProfiles = searchTerm ? searchResults : profiles

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {/* Profile Lists */}
        <TabsContent value={activeTab}>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {displayProfiles && displayProfiles.length > 0 ? (
                displayProfiles.map((profile) => (
                  <Card key={profile.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
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
                                    ? `Verified: ${formatDate(profile.kyc_verification_date ?? undefined)}`
                                    : `Rejected: ${formatDate(profile.kyc_verification_date || profile.kyc_submission_date)}`}
                              </span>
                            </div>
                            {profile.kyc_rejection_reason && (
                              <p className="text-xs text-red-500 mt-1">Reason: {profile.kyc_rejection_reason}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <UserVerificationButton userId={profile.id} onVerificationChange={refetch} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
