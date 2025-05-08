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

// Define role groups
const roleGroups = {
  leadership: ["is_ceo", "is_DB_executive"],
  staff: ["is_DB_staff", "is_DB_admin"],
  support: ["is_volunteer", "is_donor", "is_partner"],
}

export default function RolesForm({
  formData,
  updateFormData,
  onComplete,
  userId,
  profileId,
}: RolesFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateProfileMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCount, setSelectedCount] = useState(0)

  useEffect(() => {
    const count = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key !== "is_standard_member" && value === true) {
        return acc + 1
      }
      return acc
    }, 0)
    setSelectedCount(count)
  }, [formData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

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
    if (role !== "is_standard_member" && checked && selectedCount >= 2) {
      setErrors({ roles: "You can select at most 2 roles" })
      return
    }

    // Check if this role is in a group, and if so, clear other selections in that group
    for (const group of Object.values(roleGroups)) {
      if (group.includes(role)) {
        const updates: Partial<RolesFormData> = {}
        group.forEach((item) => {
          updates[item as keyof RolesFormData] = item === role ? checked : false
        })
        updateFormData(updates)
        return
      }
    }

    // Not part of grouped role
    updateFormData({ [role]: checked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await updateUserProfile({
        id: profileId,
        data: { ...formData },
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
            You can select up to 2 roles. Roles in the same category are mutually exclusive.
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

          {/* Leadership Roles */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">Leadership Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-3 rounded-md border">
            {roleGroups.leadership.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof RolesFormData] || false}
                  onCheckedChange={(checked) =>
                    handleRoleChange(key as keyof RolesFormData, checked as boolean)
                  }
                />
                <label htmlFor={key} className="text-sm cursor-pointer capitalize">
                  {key.replace("is_", "").replace("_", " ").replace("DB", "DBEF ")}
                </label>
              </div>
            ))}
          </div>

          {/* Staff Roles */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">Staff Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-3 rounded-md border">
            {roleGroups.staff.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof RolesFormData] || false}
                  onCheckedChange={(checked) =>
                    handleRoleChange(key as keyof RolesFormData, checked as boolean)
                  }
                />
                <label htmlFor={key} className="text-sm cursor-pointer capitalize">
                  {key.replace("is_", "").replace("_", " ")}
                </label>
              </div>
            ))}
          </div>

          {/* Support Roles */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">Support Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white p-3 rounded-md border">
            {roleGroups.support.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof RolesFormData] || false}
                  onCheckedChange={(checked) =>
                    handleRoleChange(key as keyof RolesFormData, checked as boolean)
                  }
                />
                <label htmlFor={key} className="text-sm cursor-pointer capitalize">
                  {key.replace("is_", "").replace("_", " ")}
                </label>
              </div>
            ))}
          </div>

          {/* Other Roles */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">Other Roles</h3>
          <div className="grid grid-cols-1 gap-4 bg-white p-3 rounded-md border">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_benefactor"
                checked={formData.is_benefactor || false}
                onCheckedChange={(checked) => handleRoleChange("is_benefactor", checked as boolean)}
              />
              <label htmlFor="is_benefactor" className="text-sm cursor-pointer">
                Benefactor
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
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Registration"}
        </Button>
      </div>
    </form>
  )
}
