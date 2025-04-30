"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { RolesFormData } from "@/components/interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"

interface RolesFormProps {
  formData: RolesFormData
  updateFormData: (data: Partial<RolesFormData>) => void
  onComplete: () => void
}

export default function RolesForm({ formData, updateFormData, onComplete }: RolesFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (
      !formData.is_project_manager &&
      !formData.is_donor &&
      !formData.is_volunteer &&
      !formData.is_partner &&
      !formData.is_mentor
    ) {
      newErrors.roles = "Please select at least one role"
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
        data: {
        is_mentor: formData.is_mentor,
        is_project_manager: formData.is_project_manager,
        is_donor: formData.is_donor,
        is_volunteer: formData.is_volunteer,
        is_partner: formData.is_partner,
        }
      }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update roles:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Roles You're Interested In</Label>
          {errors.roles && <p className="text-red-500 text-sm">{errors.roles}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="project-manager"
                checked={formData.is_project_manager}
                onCheckedChange={(checked) => updateFormData({ is_project_manager: checked as boolean })}
              />
              <label htmlFor="project-manager" className="text-sm cursor-pointer">
                Project Manager
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="donor"
                checked={formData.is_donor}
                onCheckedChange={(checked) => updateFormData({ is_donor: checked as boolean })}
              />
              <label htmlFor="donor" className="text-sm cursor-pointer">
                Donor
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="volunteer"
                checked={formData.is_volunteer}
                onCheckedChange={(checked) => updateFormData({ is_volunteer: checked as boolean })}
              />
              <label htmlFor="volunteer" className="text-sm cursor-pointer">
                Volunteer
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partner"
                checked={formData.is_partner}
                onCheckedChange={(checked) => updateFormData({ is_partner: checked as boolean })}
              />
              <label htmlFor="partner" className="text-sm cursor-pointer">
                Partner
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mentor"
                checked={formData.is_mentor}
                onCheckedChange={(checked) => updateFormData({ is_mentor: checked as boolean })}
              />
              <label htmlFor="mentor" className="text-sm cursor-pointer">
                Mentor
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-md mt-6">
          <h3 className="font-medium text-green-800 mb-2">Almost Done!</h3>
          <p className="text-green-700 text-sm">
            Thank you for providing your information. Once you submit this final section, your profile will be complete
            and your membership registration will be processed.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Registration"}
        </Button>
      </div>
    </form>
  )
}
