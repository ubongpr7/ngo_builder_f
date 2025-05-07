"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DropdownOption, ProfessionalInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"
import { useGetIndustryQuery } from "@/redux/features/profile/profileRelatedAPISlice"
import { Loader2 } from "lucide-react"

interface ProfessionalInfoFormProps {
  formData: ProfessionalInfoFormData
  updateFormData: (data: Partial<ProfessionalInfoFormData>) => void
  onComplete: () => void
  profileId: string
}

export default function ProfessionalInfoForm({
  formData,
  updateFormData,
  onComplete,
  profileId,
}: ProfessionalInfoFormProps) {
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const { data: industries, isLoading: isLoadingIndustries } = useGetIndustryQuery("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  
  // State to track if we've validated initial industry
  const [hasValidatedInitial, setHasValidatedInitial] = useState(false)

  // Main validation effect
  useEffect(() => {
    if (isLoadingIndustries || !industries) return
    
    // Check if initial industry exists in loaded options
    if (!hasValidatedInitial) {
      const initialIndustry = formData.industry
      const industryExists = initialIndustry !== null && 
        industries.some((ind: DropdownOption) => ind.id === initialIndustry)
      
      if (initialIndustry && !industryExists) {
        // Reset invalid industry
        updateFormData({ industry: null })
      }
      setHasValidatedInitial(true)
    }

    // Always ensure selected industry matches form data
    const currentIndustry = formData.industry
    const isValid = currentIndustry === null || 
      industries.some((ind: DropdownOption) => ind.id === currentIndustry)
    
    if (!isValid) {
      updateFormData({ industry: null })
    }
  }, [industries, isLoadingIndustries, formData.industry, hasValidatedInitial, updateFormData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.industry) newErrors.industry = "Industry is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleIndustryChange = (value: string) => {
    const industryId = Number.parseInt(value)
    updateFormData({ industry: industryId })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) return

    try {
      await updateUserProfile({
        id: profileId,
        data: {
          organization: formData.organization,
          position: formData.position,
          industry: formData.industry,
          company_size: formData.company_size,
          company_website: formData.company_website,
        },
      }).unwrap()

      onComplete()
    } catch (error: any) {
      console.error("Update failed:", error)
      setApiError(error.data?.detail || "Failed to save professional information")
    }
  }

  if (isLoadingIndustries) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading industry data...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error saving data</p>
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* ... other form fields remain the same ... */}

        <div className="space-y-2">
          <Label htmlFor="industry">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.industry?.toString() || ""}
            onValueChange={handleIndustryChange}
            disabled={!hasValidatedInitial}
          >
            <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
              <SelectValue placeholder={hasValidatedInitial ? "Select your industry" : "Loading industries..."} />
            </SelectTrigger>
            <SelectContent>
              {industries?.map((industry: DropdownOption) => (
                <SelectItem key={industry.id} value={industry.id.toString()}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-red-500 text-sm">{errors.industry}</p>}
        </div>

        {/* ... rest of the form ... */}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}