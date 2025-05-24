"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { ExpertiseFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"
import { useGetExpertiseAreasQuery } from "@/redux/features/profile/profileRelatedAPISlice"
import { Loader2 } from 'lucide-react'

interface ExpertiseFormProps {
  formData: ExpertiseFormData
  updateFormData: (data: Partial<ExpertiseFormData>) => void
  onComplete: () => void
  userId: string,
  profileId: string
}

const MAX_SELECTIONS = 5

export default function ExpertiseForm({ formData, updateFormData, onComplete, userId, profileId }: ExpertiseFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const { data: expertiseAreas, isLoading: isLoadingExpertise } = useGetExpertiseAreasQuery('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Initialize maxReached based on the initial formData
  const [maxReached, setMaxReached] = useState(formData.expertise?.length >= MAX_SELECTIONS)
  
  // Update maxReached whenever formData.expertise changes
  useEffect(() => {
    setMaxReached(formData.expertise?.length >= MAX_SELECTIONS)
  }, [formData.expertise])

  const handleExpertiseChange = (expertiseId: number) => {
    const updatedExpertise = [...formData.expertise]
    const isSelected = updatedExpertise.includes(expertiseId)

    if (isSelected) {
      // Remove if already selected
      const index = updatedExpertise.indexOf(expertiseId)
      updatedExpertise.splice(index, 1)
      // maxReached will be updated by the useEffect
    } else {
      // Add if not selected and under the limit
      if (updatedExpertise?.length < MAX_SELECTIONS) {
        updatedExpertise.push(expertiseId)
        // maxReached will be updated by the useEffect
      } else {
        setErrors({
          ...errors,
          maxLimit: `You can only select up to ${MAX_SELECTIONS} areas of expertise`
        })
        return
      }
    }

    // Clear max limit error if we're under the limit
    if (updatedExpertise?.length < MAX_SELECTIONS) {
      const { maxLimit, ...restErrors } = errors
      setErrors(restErrors)
    }

    updateFormData({ expertise: updatedExpertise })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.expertise?.length === 0) {
      newErrors.expertise = "Please select at least one area of expertise"
    }

    if (formData.expertise?.length > MAX_SELECTIONS) {
      newErrors.maxLimit = `You can only select up to ${MAX_SELECTIONS} areas of expertise`
    }

    setErrors(newErrors)
    return Object.keys(newErrors)?.length === 0
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
          expertise: formData.expertise,
        }
      }).unwrap()

      onComplete()
    } catch (error) {
    }
  }

  if (isLoadingExpertise) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading expertise areas...</span>
      </div>
    )
  }

  const selectedCount = formData.expertise?.length
  const remainingSelections = MAX_SELECTIONS - selectedCount

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Areas of Expertise (Select all that apply)</Label>
            <span className={`text-sm ${remainingSelections === 0 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
              {selectedCount} of {MAX_SELECTIONS} selected
            </span>
          </div>
          
          {errors.expertise && <p className="text-red-500 text-sm">{errors.expertise}</p>}
          {errors.maxLimit && <p className="text-red-500 text-sm">{errors.maxLimit}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {expertiseAreas?.map((expertise: { id: number; name: string }) => {
              const isChecked = formData.expertise.includes(expertise.id)
              const isDisabled = maxReached && !isChecked
              
              return (
                <div key={expertise.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`expertise-${expertise.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleExpertiseChange(expertise.id)}
                    disabled={isDisabled}
                  />
                  <label 
                    htmlFor={`expertise-${expertise.id}`} 
                    className={`text-sm cursor-pointer ${isDisabled ? 'text-gray-400' : ''}`}
                  >
                    {expertise.name}
                  </label>
                </div>
              )
            })}
          </div>
          
          {maxReached && (
            <p className="text-amber-600 text-sm mt-2">
              Maximum selection limit reached. Uncheck an item to select a different one.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}