"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import type { RolesFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"

interface RolesFormProps {
  formData: RolesFormData
  updateFormData: (data: Partial<RolesFormData>) => void
  onComplete: () => void
  userId: string
  profileId: string
}

export default function RolesForm({ formData, updateFormData, onComplete, userId, profileId }: RolesFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCount, setSelectedCount] = useState(0)

  // Count selected roles whenever formData changes
  useEffect(() => {
    const count = Object.entries(formData).reduce((acc, [key, value]) => {
      // Skip is_standard_member when counting role selections
      if (key !== "is_standard_member" && value === true) {
        return acc + 1
      }
      return acc
    }, 0)
    setSelectedCount(count)
  }, [formData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Count selected roles (excluding is_standard_member)
    const selectedRoles = Object.entries(formData).filter(
      ([key, value]) => key !== "is_standard_member" && value === true,
    )

    if (selectedRoles.length === 0 && !formData.is_standard_member) {
      newErrors.roles = "Please select at least one role or choose Standard Member"
    }

    if (selectedRoles.length > 2) {
      newErrors.roles = "Please select at most 2 roles"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRoleChange = (role: keyof RolesFormData, checked: boolean) => {
    // If this would exceed 2 selections and it's being checked, prevent it
    const currentCount = selectedCount
    if (role !== "is_standard_member" && checked && currentCount >= 2) {
      setErrors({ roles: "You can select at most 2 roles" })
      return
    }

    // Clear errors when making a valid selection
    if (errors.roles) {
      setErrors({})
    }

    updateFormData({ [role]: checked })
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
          is_donor: formData.is_donor,
          is_volunteer: formData.is_volunteer,
          is_partner: formData.is_partner,
          is_DB_executive: formData.is_DB_executive,
          is_ceo: formData.is_ceo,
          is_standard_member: formData.is_standard_member,
          is_DB_staff: formData.is_DB_staff,
          is_DB_admin: formData.is_DB_admin,
          is_benefactor: formData.is_benefactor,
        },
      }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update roles:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Role Selection</AlertTitle>
          <AlertDescription className="text-blue-700">
            You can select up to 2 roles that best describe your involvement with our organization. Alternatively, you
            can choose to be a Standard Member.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-medium">Roles You're Interested In</Label>
            <span className={`text-sm font-medium ${selectedCount > 2 ? "text-red-500" : "text-gray-500"}`}>
              {selectedCount}/2 roles selected
            </span>
          </div>

          {errors.roles && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">{errors.roles}</p>
          )}

          <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="standard-member"
                checked={formData.is_standard_member || false}
                onCheckedChange={(checked) => updateFormData({ is_standard_member: checked as boolean })}
              />
              <label htmlFor="standard-member" className="text-sm font-medium cursor-pointer">
                Standard Member (General membership without specific role)
              </label>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Leadership Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-3 rounded-md border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ceo"
                  checked={formData.is_ceo || false}
                  onCheckedChange={(checked) => handleRoleChange("is_ceo", checked as boolean)}
                />
                <label htmlFor="ceo" className="text-sm cursor-pointer">
                  CEO
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="db-executive"
                  checked={formData.is_DB_executive || false}
                  onCheckedChange={(checked) => handleRoleChange("is_DB_executive", checked as boolean)}
                />
                <label htmlFor="db-executive" className="text-sm cursor-pointer">
                  DB Executive
                </label>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">Staff Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-3 rounded-md border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="db-staff"
                  checked={formData.is_DB_staff || false}
                  onCheckedChange={(checked) => handleRoleChange("is_DB_staff", checked as boolean)}
                />
                <label htmlFor="db-staff" className="text-sm cursor-pointer">
                  DB Staff
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="db-admin"
                  checked={formData.is_DB_admin || false}
                  onCheckedChange={(checked) => handleRoleChange("is_DB_admin", checked as boolean)}
                />
                <label htmlFor="db-admin" className="text-sm cursor-pointer">
                  DB Administrator
                </label>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">Support Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white p-3 rounded-md border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="volunteer"
                  checked={formData.is_volunteer || false}
                  onCheckedChange={(checked) => handleRoleChange("is_volunteer", checked as boolean)}
                />
                <label htmlFor="volunteer" className="text-sm cursor-pointer">
                  Volunteer
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="donor"
                  checked={formData.is_donor || false}
                  onCheckedChange={(checked) => handleRoleChange("is_donor", checked as boolean)}
                />
                <label htmlFor="donor" className="text-sm cursor-pointer">
                  Donor
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partner"
                  checked={formData.is_partner || false}
                  onCheckedChange={(checked) => handleRoleChange("is_partner", checked as boolean)}
                />
                <label htmlFor="partner" className="text-sm cursor-pointer">
                  Partner
                </label>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">Other Roles</h3>
            <div className="grid grid-cols-1 gap-4 bg-white p-3 rounded-md border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="benefactor"
                  checked={formData.is_benefactor || false}
                  onCheckedChange={(checked) => handleRoleChange("is_benefactor", checked as boolean)}
                />
                <label htmlFor="benefactor" className="text-sm cursor-pointer">
                  Benefactor
                </label>
              </div>
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
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Registration"}
        </Button>
      </div>
    </form>
  )
}
