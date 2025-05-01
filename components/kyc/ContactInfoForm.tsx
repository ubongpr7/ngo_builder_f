"use client"

import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
import { isValidPhoneNumber } from 'libphonenumber-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ContactInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"

// Dynamically import PhoneInput to avoid SSR issues
const PhoneInput = dynamic(
  () => import('react-phone-number-input'),
  { 
    ssr: false,
    loading: () => <div className="border rounded p-2 h-10 flex items-center text-gray-400">Loading phone input...</div>
  }
);

// Import the styles for the phone input
import 'react-phone-number-input/style.css'

interface ContactInfoFormProps {
  formData: ContactInfoFormData
  updateFormData: (data: Partial<ContactInfoFormData>) => void
  onComplete: () => void
  userId: string,
  profileId: string
}

export default function ContactInfoForm({ formData, updateFormData, onComplete, userId, profileId }: ContactInfoFormProps) {
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
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          bio: formData.bio,
        }
      }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update contact information:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <div className={cn(errors.phone_number ? "border-red-500 rounded" : "")}>
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
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date_of_birth && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date_of_birth ? format(new Date(formData.date_of_birth), "PPP") : "Select your date of birth"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                onSelect={(date) =>
                  updateFormData({
                    date_of_birth: date ? format(date, "yyyy-MM-dd") : null,
                  })
                }
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={1940}
                toYear={new Date().getFullYear() - 18}
                defaultMonth={new Date(1990, 0)}
              />
            </PopoverContent>
          </Popover>
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
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}