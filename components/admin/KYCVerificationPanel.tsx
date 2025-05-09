"use client"

import { useState } from "react"
import {
  useGetPendingKYCSubmissionsQuery,
  useVerifyKYCMutation,
  useGetKYCDocumentsQuery,
} from "@/redux/features/admin/kyc-verification"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, FileText, Clock } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

export default function KYCVerificationPanel() {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  const { data: pendingSubmissions, isLoading, refetch } = useGetPendingKYCSubmissionsQuery('')
  const { data: kycDocuments } = useGetKYCDocumentsQuery(selectedProfileId || 0, {
    skip: !selectedProfileId,
  })
  const [verifyKYC, { isLoading: isVerifying }] = useVerifyKYCMutation()

  const handleApprove = async () => {
    if (!selectedProfileId) return

    try {
      await verifyKYC({
        profileId: selectedProfileId,
        data: { action: "approve" },
      }).unwrap()

      toast({
        title: "KYC Approved",
        description: "The user has been successfully verified.",
        variant: "default",
      })

      setSelectedProfileId(null)
      refetch()
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was an error approving the KYC verification.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!selectedProfileId || !rejectionReason.trim()) return

    try {
      await verifyKYC({
        profileId: selectedProfileId,
        data: {
          action: "reject",
          reason: rejectionReason.trim(),
        },
      }).unwrap()

      toast({
        title: "KYC Rejected",
        description: "The user verification has been rejected.",
        variant: "default",
      })

      setSelectedProfileId(null)
      setRejectionReason("")
      setShowRejectionForm(false)
      refetch()
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the KYC verification.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingProfiles = pendingSubmissions?.results || []

  return (
    <div className="p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">KYC Verification Panel</CardTitle>
          <CardDescription>Review and verify user KYC submissions</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Verifications</CardTitle>
              <CardDescription>{pendingProfiles.length} submissions awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProfiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No pending KYC submissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProfiles.map((profile: any) => (
                    <div
                      key={profile.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProfileId === profile.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedProfileId(profile.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.profile_image || "/placeholder.svg"} alt={profile.first_name} />
                          <AvatarFallback>
                            {profile.first_name?.[0]}
                            {profile.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {profile.first_name} {profile.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Submitted: {formatDate(profile.kyc_submission_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedProfileId && kycDocuments ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Documents</CardTitle>
                <CardDescription>Review the submitted documents and verify the user</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="documents">
                  <TabsList className="mb-4">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="details">User Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">ID Document</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kycDocuments.id_document_image_front && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Front Side</p>
                              <img
                                src={kycDocuments.id_document_image_front || "/placeholder.svg"}
                                alt="ID Front"
                                className="w-full h-auto rounded-md border"
                              />
                            </div>
                          )}

                          {kycDocuments.id_document_image_back && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Back Side</p>
                              <img
                                src={kycDocuments.id_document_image_back || "/placeholder.svg"}
                                alt="ID Back"
                                className="w-full h-auto rounded-md border"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Document Type</p>
                            <p className="font-medium">{kycDocuments.id_document_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Document Number</p>
                            <p className="font-medium">{kycDocuments.id_document_number}</p>
                          </div>
                        </div>
                      </div>

                      {kycDocuments.selfie_image && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Selfie Verification</h3>
                          <img
                            src={kycDocuments.selfie_image || "/placeholder.svg"}
                            alt="Selfie"
                            className="max-w-[200px] h-auto rounded-md border"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      {/* User details would go here - we'd need to fetch the selected profile */}
                      <p className="text-sm text-gray-500">Additional user details would be displayed here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                {showRejectionForm ? (
                  <div className="w-full space-y-4">
                    <Textarea
                      placeholder="Please provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRejectionForm(false)
                          setRejectionReason("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={!rejectionReason.trim() || isVerifying}
                      >
                        {isVerifying ? "Rejecting..." : "Confirm Rejection"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-3 w-full">
                    <Button variant="outline" onClick={() => setSelectedProfileId(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => setShowRejectionForm(true)} disabled={isVerifying}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={isVerifying}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isVerifying ? "Approving..." : "Approve"}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Profile Selected</h3>
                  <p className="text-gray-500 mt-2">Select a profile from the list to review their KYC documents</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
