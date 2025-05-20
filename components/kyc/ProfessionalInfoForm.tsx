"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DropdownOption, ProfessionalInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"
import { useGetIndustryQuery } from "@/redux/features/profile/profileRelatedAPISlice"
import { Loader2 } from "lucide-react"
import { ReactSelectField, type SelectOption } from "@/components/ui/react-select-field"

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
  const [selectedIndustry, setSelectedIndustry] = useState<string | "">("")
  const [apiError, setApiError] = useState<string | null>(null)
  const initialIndustryRef = useRef<string | null>(formData.industry || "")

  useEffect(() => {
    if (industries && industries?.length > 0 && !isInitialized) {
      if (initialIndustryRef.current !== "") {
        const industryExists = industries.some(
          (industry: { id: string; name: string }) => industry.id === initialIndustryRef.current,
        )
        if (industryExists) {
          setSelectedIndustry(initialIndustryRef.current || "")
        } else {
          setSelectedIndustry("")
          updateFormData({ industry: "" })
        }
      }
      setIsInitialized(true)
    }
  }, [industries, isInitialized, updateFormData])

  useEffect(() => {
    if (isInitialized && formData.industry !== selectedIndustry) {
      setSelectedIndustry(formData.industry ? formData.industry : "")
    }
  }, [formData.industry, isInitialized, selectedIndustry])

  useEffect(() => {
    if (industry_id) {
      setSelectedIndustry(industry_id.toString())
      updateFormData({ industry: industry_id.toString() })
    }
  }, [industry_id, !isInitialized])

  // Convert industries to select options
  const industryOptions: SelectOption[] = industries
    ? industries?.map((industry: { id: number; name: string }) => ({
        value: industry.id.toString(),
        label: industry.name,
      }))
    : []

  // Company size options
  const companySizeOptions: SelectOption[] = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1001+", label: "1001+ employees" },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.industry) {
      newErrors.industry = "Industry is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors)?.length === 0
  }

  const handleIndustryChange = (option: SelectOption | null) => {
    const value = option ? option.value : ""
    setSelectedIndustry(value)
    updateFormData({ industry: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

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
      let errorMessage = "Failed to save data. Please try again."
      if (error.data?.detail) {
        errorMessage = error.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      setApiError(errorMessage)
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

  const getIndustryName = (id: number | null) => {
    if (!id || !industries) return "None"
    const industry = industries.find((ind: DropdownOption) => ind.id === id)
    return industry ? industry.name : "Unknown"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded hidden">
        <div>
          Selected Industry: {selectedIndustry} ({getIndustryName(Number(selectedIndustry))})
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
          <ReactSelectField
            options={industryOptions}
            value={formData.industry ? industryOptions.find((option) => option.value === formData.industry) : null}
            onChange={handleIndustryChange}
            placeholder="Select industry"
            isDisabled={!isInitialized}
            error={errors.industry}
            isSearchable
            isClearable
          />
          {errors.industry && <p className="text-red-500 text-sm">{errors.industry}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <ReactSelectField
            options={companySizeOptions}
            value={
              formData.company_size ? companySizeOptions.find((option) => option.value === formData.company_size) : null
            }
            onChange={(option) =>
              updateFormData({
                company_size: option && !Array.isArray(option) && "value" in option ? option.value : "",
              })
            }
            placeholder="Select company size"
            isClearable
          />
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
