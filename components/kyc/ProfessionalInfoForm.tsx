"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
  industry_id?: string
}

export default function ProfessionalInfoForm({
  formData,
  updateFormData,
  onComplete,
  profileId,
  industry_id = "",
}: ProfessionalInfoFormProps) {
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const { data: industries, isLoading: isLoadingIndustries } = useGetIndustryQuery("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState<string | ''>('')
  const [apiError, setApiError] = useState<string | null>(null)
  const initialIndustryRef = useRef<string | null>(formData.industry || '')

  useEffect(() => {
    if (industries && industries.length > 0 && !isInitialized) {

      // Only try to set the industry if we have an initial value
      if (initialIndustryRef.current !== '') {
        // Check if the industry exists in the available options
        const industryExists = industries.some((industry: { id: string; name: string }) => industry.id === initialIndustryRef.current)

        if (industryExists) {
          setSelectedIndustry(initialIndustryRef.current)
        } else {
          setSelectedIndustry('')
          updateFormData({ industry: '' })
        }
      }

      setIsInitialized(true)
    }
  }, [industries, isInitialized, updateFormData])

  // Update the selected industry when formData changes (after initialization)
  useEffect(() => {
    if (isInitialized && formData.industry !== selectedIndustry) {
      setSelectedIndustry(formData.industry ? formData.industry : '')
    }
  }, [formData.industry, isInitialized, selectedIndustry])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.industry) {
      newErrors.industry = "Industry is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleIndustryChange = (value: string) => {
    const industryId = Number.parseInt(value)
    setSelectedIndustry(industryId.toString())
    updateFormData({ industry: industryId.toString() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    // Ensure industry is a number
    const industryId =
      typeof formData.industry === "string" ? Number.parseInt(formData.industry, 10) : formData.industry

    const dataToSubmit = {
      organization: formData.organization,
      position: formData.position,
      industry: industryId,
      company_size: formData.company_size,
      company_website: formData.company_website,
    }


    try {
      const response = await updateUserProfile({
        id: profileId,
        data: dataToSubmit,
      }).unwrap()

      onComplete()
    } catch (error: any) {

      // Extract error message for display
      let errorMessage = "Failed to save data. Please try again."
      if (error.data?.detail) {
        errorMessage = error.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }

      setApiError(errorMessage)
    }
  }
  useEffect(() => {
    if (industry_id) {
      setSelectedIndustry(industry_id.toString())
      updateFormData({ industry: industry_id.toString() })
    }
  }, [industry_id, !isInitialized])
  // Show loading state while data is being fetched
  if (isLoadingIndustries) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading industry data...</span>
      </div>
    )
  }

  // Get the industry name for debugging
  const getIndustryName = (id: number | null) => {
    if (!id || !industries) return "None"
    const industry = industries.find((ind: DropdownOption) => ind.id === id)
    return industry ? industry.name : "Unknown"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Debug info - can be removed in production */}
      <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded hidden">
        <div>
          Selected Industry: {selectedIndustry} ({getIndustryName(selectedIndustry)})
        </div>
        <div>Form Industry: {formData.industry}</div>
        <div>Initial Industry: {initialIndustryRef.current}</div>
        <div>Initialized: {isInitialized ? "Yes" : "No"}</div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error saving data</p>
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      <div className="space-y-6">
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
          <Label htmlFor="industry">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={isInitialized ? selectedIndustry?.toString() || "" : ""}
            onValueChange={handleIndustryChange}
            disabled={!isInitialized}
          >
            <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries && industries.length > 0 ? (
                industries.map((industry: { id: number; name: string }) => (
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

        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <Select
            value={formData.company_size || ""}
            onValueChange={(value) => updateFormData({ company_size: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1001+">1001+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_website">Company Website</Label>
          <Input
            id="company_website"
            value={formData.company_website || ""}
            onChange={(e) => updateFormData({ company_website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}
