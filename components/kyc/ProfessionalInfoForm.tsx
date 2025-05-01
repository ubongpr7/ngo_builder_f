"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProfessionalInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"
import { useGetIndustryQuery } from "@/redux/features/profile/profileRelatedAPISlice"
import { useGetMembershipQuery } from "@/redux/features/profile/profileRelatedAPISlice"
import { Loader2 } from 'lucide-react'

interface ProfessionalInfoFormProps {
  formData: ProfessionalInfoFormData
  updateFormData: (data: Partial<ProfessionalInfoFormData>) => void
  onComplete: () => void
  profileId: string
  userId: string
}

export default function ProfessionalInfoForm({ formData, updateFormData, onComplete, profileId, userId }: ProfessionalInfoFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const { data: industries, isLoading: isLoadingIndustries } = useGetIndustryQuery('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { data: membershipTypes, isLoading: isLoadingMembership } = useGetMembershipQuery('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.membership_type) {
      newErrors.membership_type = "Membership type is required"
    }

    if (!formData.industry) {
      newErrors.industry = "Industry is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await updateUserProfile({
        id: profileId,
        data: {
          membership_type: formData.membership_type,
          organization: formData.organization,
          position: formData.position,
          industry: formData.industry,
        }
      }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update professional information:", error)
    }
  }

  // Show loading state while data is being fetched
  if (isLoadingIndustries || isLoadingMembership) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading form data...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Membership Type</Label>
          <Select
            value={formData.membership_type?.toString() || ""}
            onValueChange={(value) => updateFormData({ membership_type: Number.parseInt(value) })}
          >
            <SelectTrigger className={errors.membership_type ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your membership type" />
            </SelectTrigger>
            <SelectContent>
              {membershipTypes && membershipTypes.length > 0 ? (
                membershipTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No membership types available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.membership_type && <p className="text-red-500 text-sm">{errors.membership_type}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization/Company</Label>
          <Input
            id="organization"
            value={formData.organization || ""}
            onChange={(e) => updateFormData({ organization: e.target.value })}
            placeholder="Enter your organization name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position/Title</Label>
          <Input
            id="position"
            value={formData.position || ""}
            onChange={(e) => updateFormData({ position: e.target.value })}
            placeholder="Enter your position or title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry?.toString() || ""}
            onValueChange={(value) => updateFormData({ industry: Number.parseInt(value) })}
          >
            <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries && industries.length > 0 ? (
                industries.map((industry) => (
                  <SelectItem key={industry.id} value={industry.id.toString()}>
                    {industry.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No industries available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-red-500 text-sm">{errors.industry}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}