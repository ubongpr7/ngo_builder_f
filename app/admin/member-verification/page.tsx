"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { CheckCircle, XCircle, AlertCircle, Search, Eye } from "lucide-react"

// Mock data for demonstration
const pendingVerifications = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    membershipType: "Executive",
    submissionDate: "2023-04-15T10:30:00",
    documentType: "Passport",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    membershipType: "CEO",
    submissionDate: "2023-04-14T14:45:00",
    documentType: "National ID",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    membershipType: "Country Director",
    submissionDate: "2023-04-13T09:15:00",
    documentType: "Driver's License",
  },
]

const verifiedUsers = [
  {
    id: 4,
    name: "Alice Williams",
    email: "alice.williams@example.com",
    membershipType: "Partner",
    verificationDate: "2023-04-10T11:20:00",
    documentType: "Passport",
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    membershipType: "Sub-Head",
    verificationDate: "2023-04-09T16:30:00",
    documentType: "National ID",
  },
]

const rejectedUsers = [
  {
    id: 6,
    name: "Sarah Davis",
    email: "sarah.davis@example.com",
    membershipType: "Standard Member",
    rejectionDate: "2023-04-08T13:45:00",
    documentType: "Driver's License",
    rejectionReason: "Document expired",
  },
]

export default function KYCVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = (user: any) => {
    alert(`Approved verification for ${user.name}`)
    // In a real implementation, this would update the user's verification status
  }

  const handleReject = (user: any) => {
    alert(`Rejected verification for ${user.name}: ${rejectionReason}`)
    // In a real implementation, this would update the user's verification status
    setRejectionReason("")
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2 bg-yellow-500">{pendingVerifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified <Badge className="ml-2 bg-green-500">{verifiedUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected <Badge className="ml-2 bg-red-500">{rejectedUsers.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingVerifications.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="mr-2">
                            {user.membershipType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Submitted: {new Date(user.submissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Verification Details</DialogTitle>
                            <DialogDescription>Review the submitted documents and information</DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Personal Information</h4>
                                <p>
                                  <span className="text-gray-500">Name:</span> {user.name}
                                </p>
                                <p>
                                  <span className="text-gray-500">Email:</span> {user.email}
                                </p>
                                <p>
                                  <span className="text-gray-500">Membership:</span> {user.membershipType}
                                </p>
                                <p>
                                  <span className="text-gray-500">Document:</span> {user.documentType}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Document Images</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="border rounded p-2">
                                    <p className="text-xs text-center mb-1">ID Front</p>
                                    <div className="bg-gray-100 h-20 flex items-center justify-center">
                                      <p className="text-xs text-gray-500">Preview</p>
                                    </div>
                                  </div>
                                  <div className="border rounded p-2">
                                    <p className="text-xs text-center mb-1">ID Back</p>
                                    <div className="bg-gray-100 h-20 flex items-center justify-center">
                                      <p className="text-xs text-gray-500">Preview</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="border rounded p-2 mt-2">
                                  <p className="text-xs text-center mb-1">Selfie with ID</p>
                                  <div className="bg-gray-100 h-20 flex items-center justify-center">
                                    <p className="text-xs text-gray-500">Preview</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => handleApprove(user)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive">
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
                                  <Button variant="destructive" onClick={() => handleReject(user)}>
                                    Confirm Rejection
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => handleApprove(user)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>

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
                            <Button variant="destructive" onClick={() => handleReject(user)}>
                              Confirm Rejection
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingVerifications.length === 0 && (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No pending verifications</h3>
                <p className="text-gray-500">All KYC submissions have been processed</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="verified">
          <div className="grid gap-4">
            {verifiedUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="mr-2">
                            {user.membershipType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Verified: {new Date(user.verificationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge className="bg-green-500">Verified</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {verifiedUsers.length === 0 && (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No verified users</h3>
                <p className="text-gray-500">No users have been verified yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {rejectedUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="mr-2">
                            {user.membershipType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Rejected: {new Date(user.rejectionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-red-500 mt-1">Reason: {user.rejectionReason}</p>
                      </div>
                    </div>

                    <Badge className="bg-red-500">Rejected</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rejectedUsers.length === 0 && (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No rejected verifications</h3>
                <p className="text-gray-500">No users have been rejected yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
