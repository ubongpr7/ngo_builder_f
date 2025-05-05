"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PersonalInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateUserMutation } from "@/redux/features/users/userApiSlice"
import { useGetDisabilitiesQuery } from "@/redux/features/profile/profileRelatedAPISlice"

interface PersonalInfoFormProps {
  formData: PersonalInfoFormData
  updateFormData: (data: Partial<PersonalInfoFormData>) => void
  onComplete: () => void
  profileId: string
  userId: string
}

interface FormErrors {
  first_name?: string
  last_name?: string
  sex?: string
  disability?: string
}

interface Disability {
  id: string
  name: string
  description?: string
}

export default function PersonalInfoForm({ formData, updateFormData, onComplete, profileId, userId }: PersonalInfoFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateUserMutation()
  const [errors, setErrors] = useState<FormErrors>({})
  const { data: disabilities, isLoading: disabilitiesLoading } = useGetDisabilitiesQuery('')

  // Initialize disabled based on whether disability exists
  useEffect(() => {
    if (formData.disability && !formData.disabled) {
      updateFormData({ disabled: true })
    }
  }, [formData.disability, formData.disabled, updateFormData])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required"
    }

    if (!formData.sex) {
      newErrors.sex = "Please select an option"
    }

    if (formData.disabled && !formData.disability) {
      newErrors.disability = "Please select a disability"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await updateUserProfile(
        {
          id: userId,
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            sex: formData.sex,
            disabled: formData.disabled,
            disability: formData.disabled ? formData.disability : null,
          }
        }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update personal information:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ first_name: e.target.value })}
            placeholder="Enter your first name"
            className={errors.first_name ? "border-red-500" : ""}
          />
          {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ last_name: e.target.value })}
            placeholder="Enter your last name"
            className={errors.last_name ? "border-red-500" : ""}
          />
          {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
        </div>
      </div>

      {/* Sex Selection */}
      <div className="space-y-3">
        <Label htmlFor="sex">Sex</Label>
        <RadioGroup
          value={formData.sex || ""}
          onValueChange={(value: string) => updateFormData({ sex: value })}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="cursor-pointer">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="cursor-pointer">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not_to_mention" id="not_to_mention" />
            <Label htmlFor="not_to_mention" className="cursor-pointer">Prefer not to say</Label>
          </div>
        </RadioGroup>
        {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
      </div>

      {/* Disability Section */}
      <div className="space-y-3">
        <Label>Do you have any disabilities?</Label>
        <RadioGroup
          value={formData.disabled ? "yes" : "no"}
          onValueChange={(value: string) => {
            const isDisabled = value === "yes"
            updateFormData({
              disabled: isDisabled,
              // Clear disability if "no" is selected
              ...(isDisabled ? {} : { disability: undefined }),
            })
          }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="disabled-yes" />
            <Label htmlFor="disabled-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="disabled-no" />
            <Label htmlFor="disabled-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Disability Selection - Only shown if user has selected "Yes" for disabilities */}
      {formData.disabled && (
        <div className="space-y-3">
          <Label htmlFor="disability">Select Disability</Label>
          <Select
            value={formData.disability || ''}
            onValueChange={(value: string) => updateFormData({ disability: value })}
          >
            <SelectTrigger className={errors.disability ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a disability" />
            </SelectTrigger>
            <SelectContent>
              {!disabilities ? (
                <SelectItem value="loading" disabled>
                  Loading disabilities...
                </SelectItem>
              ) : disabilities.length > 0 ? (
                disabilities.map((disability: Disability) => (
                  <SelectItem key={disability.id} value={disability.id}>
                    {disability.name}{disability.description && ` (${disability.description})`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No disabilities available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.disability && <p className="text-red-500 text-sm">{errors.disability}</p>}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}