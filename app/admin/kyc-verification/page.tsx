"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertCircle, Search, Eye, Flag, AlertTriangle } from 'lucide-react'
import { format } from "date-fns"
import { 
    useGetAllKYCSubmissionsQuery,
     useUpdateKYCStatusMutation, 
     useGetKYCDocumentsQuery, 
     useSearchKYCSubmissionsQuery,
      KYCUser } from "@/redux/features/admin/kyc-verification"
import { toast } from "@/components/ui/use-toast"

export default function KYCVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false)
  const [flagReason, setFlagReason] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch KYC submissions
  const { data: allSubmissions, isLoading, refetch } = useGetAllKYCSubmissionsQuery()
  
  // Search results
  const { data: searchResults, refetch: refetchSearch } = useSearchKYCSubmissionsQuery(searchTerm, {
    skip: !searchTerm
  })
  
  // Get KYC documents for selected user
  const { data: kycDocuments } = useGetKYCDocumentsQuery(selectedUser?.id || 0, {
    skip: !selectedUser
  })
  
  // Update KYC status mutation
  const [updateKYCStatus, { isLoading: isUpdating }] = useUpdateKYCStatusMutation()

  // Prepare data for display
  const pendingUsers = allSubmissions?.pending || []
  const approvedUsers = allSubmissions?.approved || []
  const rejectedUsers = allSubmissions?.rejected || []
  const flaggedUsers = allSubmissions?.flagged || []
  const scammerUsers = allSubmissions?.scammer || []
  
  // Display search results if search term is present
  const displayedUsers = searchTerm 
    ? (searchResults?.results || []) 
    : activeTab === "pending" 
      ? pendingUsers 
      : activeTab === "approved" 
        ? approvedUsers 
        : activeTab === "rejected" 
          ? rejectedUsers 
          : activeTab === "flagged"
            ? flaggedUsers
            : scammerUsers

  // Handle approve action
  const handleApprove = async (user: KYCUser) => {
    try {
      await updateKYCStatus({
        profileId: user.id,
        data: { action: "approve" }
      }).unwrap()
      
      toast({
        title: "Verification Approved",
        description: `${user.first_name} ${user.last_name}'s verification has been approved.`,
        variant: "default",
      })
      
      refetch()
      if (searchTerm) refetchSearch()
      setSelectedUser(null)
      setIsViewDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve verification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (user: KYCUser) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }
    
    try {
      await updateKYCStatus({
        profileId: user.id,
        data: { 
          action: "reject",
          reason: rejectionReason.trim()
        }
      }).unwrap()
      
      toast({
        title: "Verification Rejected",
        description: `${user.first_name} ${user.last_name}'s verification has been rejected.`,
        variant: "default",
      })
      
      refetch()
      if (searchTerm) refetchSearch()
      setRejectionReason("")
      setSelectedUser(null)
      setIsRejectDialogOpen(false)
      setIsViewDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject verification. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  // Handle flag action
  const handleFlag = async (user: KYCUser) => {
    if (!flagReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for flagging this user.",
        variant: "destructive",
      })
      return
    }
    
    try {
      await updateKYCStatus({
        profileId: user.id,
        data: { 
          action: "flag",
          reason: flagReason.trim()
        }
      }).unwrap()
      
      toast({
        title: "User Flagged",
        description: `${user.first_name} ${user.last_name} has been flagged for review.`,
        variant: "default",
      })
      
      refetch()
      if (searchTerm) refetchSearch()
      setFlagReason("")
      setSelectedUser(null)
      setIsFlagDialogOpen(false)
      setIsViewDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag user. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  // Handle mark as scammer action
  const handleMarkAsScammer = async (user: KYCUser) => {
    try {
      await updateKYCStatus({
        profileId: user.id,
        data: { action: "mark_scammer" }
      }).unwrap()
      
      toast({
        title: "User Marked as Scammer",
        description: `${user.first_name} ${user.last_name} has been marked as a scammer.`,
        variant: "default",
      })
      
      refetch()
      if (searchTerm) refetchSearch()
      setSelectedUser(null)
      setIsViewDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark user as scammer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
      return "N/A"
    }
  }
  
  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'approved': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'flagged': return 'bg-orange-500'
      case 'scammer': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">KYC Verification Dashboard</h1>

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

      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2 bg-yellow-500">{pendingUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <Badge className="ml-2 bg-green-500">{approvedUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected <Badge className="ml-2 bg-red-500">{rejectedUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged <Badge className="ml-2 bg-orange-500">{flaggedUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="scammer">
            Scammer <Badge className="ml-2 bg-purple-500">{scammerUsers.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Content for all tabs */}
        <TabsContent value={activeTab}>
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading submissions...</p>
              </div>
            ) : displayedUsers.length > 0 ? (
              displayedUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.profile_image || undefined} alt={`${user.first_name} ${user.last_name}`} />
                          <AvatarFallback>
                            {getInitials(user.first_name, user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.first_name} {user.last_name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex flex-wrap items-center mt-1 gap-2">
                            <Badge variant="outline" className="text-xs">
                              {user.membershipType}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Submitted: {formatDate(user.submissionDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>

                        {user.kyc_status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(user)}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsRejectDialogOpen(true)
                              }}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
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
                    ? "No matching results" 
                    : activeTab === "pending" 
                      ? "No pending verifications" 
                      : activeTab === "approved" 
                        ? "No approved verifications" 
                        : activeTab === "rejected" 
                          ? "No rejected verifications"
                          : activeTab === "flagged"
                            ? "No flagged users"
                            : "No users marked as scammers"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "Try a different search term" 
                    : activeTab === "pending" 
                      ? "All KYC submissions have been processed" 
                      : activeTab === "approved" 
                        ? "No users have been verified yet" 
                        : activeTab === "rejected" 
                          ? "No users have been rejected yet"
                          : activeTab === "flagged"
                            ? "No users have been flagged for review"
                            : "No users have been marked as scammers"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>Review the submitted documents and information</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profile_image || undefined} alt={`${selectedUser.first_name} ${selectedUser.last_name}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.first_name, selectedUser.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h2>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center mt-1 gap-2">
                    <Badge variant="outline">{selectedUser.membershipType}</Badge>
                    <Badge className={getStatusBadgeColor(selectedUser.kyc_status)}>
                      {selectedUser.kyc_status.charAt(0).toUpperCase() + selectedUser.kyc_status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-500 font-medium">Name:</span> {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Email:</span> {selectedUser.email}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Membership:</span> {selectedUser.membershipType}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Document Type:</span> {kycDocuments?.id_document_type || 'Not provided'}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Document Number:</span> {kycDocuments?.id_document_number || 'Not provided'}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Submission Date:</span> {formatDate(selectedUser.submissionDate)}
                    </p>
                    {selectedUser.kyc_status === 'rejected' && selectedUser.kyc_rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-gray-700 font-medium">Rejection Reason:</p>
                        <p className="text-red-600">{selectedUser.kyc_rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-3">Document Images</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {kycDocuments?.id_document_image_front ? (
                      <div className="border rounded-md overflow-hidden">
                        <p className="text-xs bg-gray-100 p-1 text-center">ID Front</p>
                        <img 
                          src={kycDocuments.id_document_image_front || "/placeholder.svg"} 
                          alt="ID Front" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-md">
                        <p className="text-xs bg-gray-100 p-1 text-center">ID Front</p>
                        <div className="bg-gray-50 h-32 flex items-center justify-center">
                          <p className="text-xs text-gray-500">No image provided</p>
                        </div>
                      </div>
                    )}
                    
                    {kycDocuments?.id_document_image_back ? (
                      <div className="border rounded-md overflow-hidden">
                        <p className="text-xs bg-gray-100 p-1 text-center">ID Back</p>
                        <img 
                          src={kycDocuments.id_document_image_back || "/placeholder.svg"} 
                          alt="ID Back" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-md">
                        <p className="text-xs bg-gray-100 p-1 text-center">ID Back</p>
                        <div className="bg-gray-50 h-32 flex items-center justify-center">
                          <p className="text-xs text-gray-500">No image provided</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {kycDocuments?.selfie_image ? (
                    <div className="border rounded-md overflow-hidden mt-3">
                      <p className="text-xs bg-gray-100 p-1 text-center">Selfie with ID</p>
                      <img 
                        src={kycDocuments.selfie_image || "/placeholder.svg"} 
                        alt="Selfie with ID" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-md mt-3">
                      <p className="text-xs bg-gray-100 p-1 text-center">Selfie with ID</p>
                      <div className="bg-gray-50 h-32 flex items-center justify-center">
                        <p className="text-xs text-gray-500">No image provided</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedUser?.kyc_status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-orange-600"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsFlagDialogOpen(true)
                  }}
                >
                  <Flag className="h-4 w-4 mr-1" /> Flag for Review
                </Button>
                <Button 
                  variant="outline" 
                  className="text-purple-600"
                  onClick={() => handleMarkAsScammer(selectedUser)}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" /> Mark as Scammer
                </Button>
                <Button 
                  variant="outline" 
                  className="text-green-600"
                  onClick={() => handleApprove(selectedUser)}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsRejectDialogOpen(true)
                  }}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && handleReject(selectedUser)}
              disabled={!rejectionReason.trim() || isUpdating}
            >
              {isUpdating ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Flag Dialog */}
      <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag User for Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for flagging this user
            </DialogDescription>
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
              onClick={() => selectedUser && handleFlag(selectedUser)}
              disabled={!flagReason.trim() || isUpdating}
            >
              {isUpdating ? "Processing..." : "Flag User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
