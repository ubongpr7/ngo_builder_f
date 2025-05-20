"use client"

import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
import { isValidPhoneNumber } from "libphonenumber-js"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ContactInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"

// Dynamically import PhoneInput to avoid SSR issues
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
  loading: () => <div className="border rounded p-2 h-10 flex items-center text-gray-400">Loading phone input...</div>,
})

// Import the styles for the phone input
import "react-phone-number-input/style.css"

interface ContactInfoFormProps {
  formData: ContactInfoFormData
  updateFormData: (data: Partial<ContactInfoFormData>) => void
  onComplete: () => void
  userId: string
  profileId: string
}

export default function ContactInfoForm({
  formData,
  updateFormData,
  onComplete,
  userId,
  profileId,
}: ContactInfoFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required"
    } else if (!isValidPhoneNumber(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number"
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
          phone_number: formData.phone_number,
          bio: formData.bio,
        },
      }).unwrap()

      onComplete()
    } catch (error) {
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <div className={cn(
              "border rounded p-2", 
              errors.phone_number ? "border-red-500" : "border-gray-300" 
            )}>
            <PhoneInput
              international
              defaultCountry="NG" // Default to Nigeria, change as needed
              value={formData.phone_number}
              onChange={(value) => updateFormData({ phone_number: value || "" })}
              placeholder="Enter phone number"
              className="w-full"
              inputClassName="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio || ""}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            placeholder="Tell us about yourself"
            className="min-h-[100px]"
          />
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
