"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Upload } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function KYCForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would submit the form data to your backend
    alert("KYC information submitted successfully!")
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Please provide your information to complete your membership registration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="professional">Professional Details</TabsTrigger>
              <TabsTrigger value="verification">Identity Verification</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Enter your full name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+234 123 456 7890" required />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select your date of birth"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter your address" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter your city" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nigeria">Nigeria</SelectItem>
                        <SelectItem value="ghana">Ghana</SelectItem>
                        <SelectItem value="kenya">Kenya</SelectItem>
                        <SelectItem value="south-africa">South Africa</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself" className="min-h-[100px]" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => document.getElementById("professional-tab")?.click()}>
                    Next: Professional Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="professional" id="professional-tab" className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Membership Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your membership type" />
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
                    <Input id="organization" placeholder="Enter your organization name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Title</Label>
                    <Input id="position" placeholder="Enter your position or title" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
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

                  <div className="space-y-2">
                    <Label>Areas of Expertise (Select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="leadership" />
                        <label htmlFor="leadership" className="text-sm">
                          Leadership
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="entrepreneurship" />
                        <label htmlFor="entrepreneurship" className="text-sm">
                          Entrepreneurship
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="finance" />
                        <label htmlFor="finance" className="text-sm">
                          Finance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="marketing" />
                        <label htmlFor="marketing" className="text-sm">
                          Marketing
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="technology" />
                        <label htmlFor="technology" className="text-sm">
                          Technology
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="community" />
                        <label htmlFor="community" className="text-sm">
                          Community Development
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Roles You're Interested In</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="project-manager" />
                        <label htmlFor="project-manager" className="text-sm">
                          Project Manager
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="donor" />
                        <label htmlFor="donor" className="text-sm">
                          Donor
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="volunteer" />
                        <label htmlFor="volunteer" className="text-sm">
                          Volunteer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="partner" />
                        <label htmlFor="partner" className="text-sm">
                          Partner
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mentor" />
                        <label htmlFor="mentor" className="text-sm">
                          Mentor
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("personal-tab")?.click()}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => document.getElementById("verification-tab")?.click()}>
                    Next: Identity Verification
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="verification" id="verification-tab" className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>ID Document Type</Label>
                    <RadioGroup defaultValue="passport" className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="passport" id="passport" />
                        <Label htmlFor="passport">Passport</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="national-id" id="national-id" />
                        <Label htmlFor="national-id">National ID Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="drivers-license" id="drivers-license" />
                        <Label htmlFor="drivers-license">Driver's License</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id-number">ID Document Number</Label>
                    <Input id="id-number" placeholder="Enter your ID document number" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>ID Document (Front)</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG or PDF (max. 5MB)</p>
                        <Input type="file" className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>ID Document (Back)</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG or PDF (max. 5MB)</p>
                        <Input type="file" className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Selfie with ID</Label>
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload a photo of yourself holding your ID</p>
                      <p className="text-xs text-gray-400">PNG or JPG (max. 5MB)</p>
                      <Input type="file" className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <label htmlFor="terms" className="text-sm">
                        I confirm that the information provided is accurate and I agree to the{" "}
                        <a href="/terms" className="text-green-600 hover:underline">
                          Terms and Conditions
                        </a>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("professional-tab")?.click()}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Submit Application
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
