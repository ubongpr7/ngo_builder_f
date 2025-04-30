"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { ExpertiseFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"
import { useGetExpertiseAreasQuery } from "@/redux/features/profile/profileRelatedAPISlice"

interface ExpertiseFormProps {
  formData: ExpertiseFormData
  updateFormData: (data: Partial<ExpertiseFormData>) => void
  onComplete: () => void
}

export default function ExpertiseForm({ formData, updateFormData, onComplete }: ExpertiseFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const { data: expertiseAreas, isLoading: isLoadingExpertise } = useGetExpertiseAreasQuery('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleExpertiseChange = (expertiseId: number) => {
    const updatedExpertise = [...formData.expertise]

    if (updatedExpertise.includes(expertiseId)) {
      // Remove if already selected
      const index = updatedExpertise.indexOf(expertiseId)
      updatedExpertise.splice(index, 1)
    } else {
      // Add if not selected
      updatedExpertise.push(expertiseId)
    }

    updateFormData({ expertise: updatedExpertise })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.expertise.length === 0) {
      newErrors.expertise = "Please select at least one area of expertise"
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
        id: 9,
        data:{
        expertise: formData.expertise,
        }
      }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update expertise:", error)
    }
  }

  if (isLoadingExpertise) {
    return <div>Loading expertise areas...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Areas of Expertise (Select all that apply)</Label>
          {errors.expertise && <p className="text-red-500 text-sm">{errors.expertise}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {expertiseAreas?.map((expertise) => (
              <div key={expertise.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`expertise-${expertise.id}`}
                  checked={formData.expertise.includes(expertise.id)}
                  onCheckedChange={() => handleExpertiseChange(expertise.id)}
                />
                <label htmlFor={`expertise-${expertise.id}`} className="text-sm cursor-pointer">
                  {expertise.name}
                </label>
              </div>
            ))}
          </div>
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
