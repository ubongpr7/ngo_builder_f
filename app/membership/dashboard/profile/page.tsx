"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 123 456 7890",
    bio: "Executive with over 15 years of experience in technology and business development across Africa.",
    membershipType: "Executive",
    organization: "Tech Innovations Ltd",
    position: "Chief Technology Officer",
    industry: "Technology",
    expertise: ["Leadership", "Technology", "Entrepreneurship"],
    roles: ["Project Manager", "Mentor"],
    isKycVerified: true,
    profileImage: "/vibrant-street-market.png",
    dateOfBirth: "1980-05-15",
    address: "123 Main Street, Lagos, Nigeria",
    joinDate: "2022-10-15",
  }

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
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-1 cursor-pointer">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-lg">
                {user.position} at {user.organization}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                  {user.membershipType}
                </Badge>
                {user.isKycVerified && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="professional">Professional Details</TabsTrigger>
              <TabsTrigger value="verification">Verification Status</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={user.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={user.phone} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" defaultValue={user.dateOfBirth} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue={user.address} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" defaultValue={user.bio} className="min-h-[100px]" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Full Name</h3>
                    <p>{user.name}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Email Address</h3>
                    <p>{user.email}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Phone Number</h3>
                    <p>{user.phone}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Date of Birth</h3>
                    <p>{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-500 mb-1">Address</h3>
                    <p>{user.address}</p>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-500 mb-1">Bio</h3>
                    <p>{user.bio}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Membership Type</Label>
                      <Select defaultValue={user.membershipType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Member</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="ceo">CEO</SelectItem>
                          <SelectItem value="country-director">Country Director</SelectItem>
                          <SelectItem value="partner">Partnership Body</SelectItem>
                          <SelectItem value="sub-head">Sub-Head</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization/Company</Label>
                      <Input id="organization" defaultValue={user.organization} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position/Title</Label>
                      <Input id="position" defaultValue={user.position} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select defaultValue={user.industry}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="nonprofit">Non-profit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Membership Type</h3>
                    <p>{user.membershipType}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Organization/Company</h3>
                    <p>{user.organization}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Position/Title</h3>
                    <p>{user.position}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Industry</h3>
                    <p>{user.industry}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.expertise.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Roles</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium">KYC Verification Status: Verified</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">ID Document Type</h3>
                    <p>Passport</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">ID Document Number</h3>
                    <p>A12345678</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Verification Date</h3>
                    <p>April 10, 2023</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-500 mb-2">Submitted Documents</h3>
                  <div className="grid grid-cols-3 gap-4">
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
                    <div className="border rounded p-2">
                      <p className="text-xs text-center mb-1">Selfie with ID</p>
                      <div className="bg-gray-100 h-20 flex items-center justify-center">
                        <p className="text-xs text-gray-500">Preview</p>
                      </div>
                    </div>
                  </div>
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
