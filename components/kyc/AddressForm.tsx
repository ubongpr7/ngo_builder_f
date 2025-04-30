"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddressFormData } from "../interfaces/kyc-forms"
import {
  useGetCountriesQuery,
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetCitiesQuery,
} from "@/redux/features/common/typeOF"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"

interface AddressFormProps {
  formData: AddressFormData
  updateFormData: (data: Partial<AddressFormData>) => void
  onComplete: () => void
  userId:string,
  profileId:string
}

export default function AddressForm({ formData, updateFormData, onComplete,userId,profileId }: AddressFormProps) {
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery()

  const { data: regions, isLoading: isLoadingRegions } = useGetRegionsQuery(formData.country || 0, {
    skip: !formData.country,
  })

  // Fetch subregions based on selected region
  const { data: subregions, isLoading: isLoadingSubregions } = useGetSubregionsQuery(formData.region || 0, {
    skip: !formData.region,
  })

  // Fetch cities based on selected subregion
  const { data: cities, isLoading: isLoadingCities } = useGetCitiesQuery(formData.subregion || 0, {
    skip: !formData.subregion,
  })

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (formData.country) {
      // If country changes, reset region, subregion, and city
      if (!formData.region || !regions?.some((r) => r.id === formData.region)) {
        updateFormData({
          region: null,
          subregion: null,
          city: null,
        })
      }
    }
  }, [formData.country, regions])

  useEffect(() => {
    if (formData.region) {
      // If region changes, reset subregion and city
      if (!formData.subregion || !subregions?.some((sr) => sr.id === formData.subregion)) {
        updateFormData({
          subregion: null,
          city: null,
        })
      }
    }
  }, [formData.region, subregions])

  useEffect(() => {
    if (formData.subregion) {
      // If subregion changes, reset city
      if (!formData.city || !cities?.some((c) => c.id === formData.city)) {
        updateFormData({ city: null })
      }
    }
  }, [formData.subregion, cities])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.country) {
      newErrors.country = "Country is required"
    }

    if (!formData.region) {
      newErrors.region = "Region/State is required"
    }

    if (!formData.subregion) {
      newErrors.subregion = "Subregion/LGA is required"
    }

    if (!formData.city) {
      newErrors.city = "City/Town is required"
    }

    if (!formData.street || !formData.street.trim()) {
      newErrors.street = "Street is required"
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
        id:profileId,
        data:{address: {
          country: formData.country,
          region: formData.region,
          subregion: formData.subregion,
          city: formData.city,
          street: formData.street,
          street_number: formData.street_number,
          apt_number: formData.apt_number,
          postal_code: formData.postal_code,
        }},
      }).unwrap()

      onComplete()
    } catch (error) {
      console.error("Failed to update address:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={formData.country?.toString() || ""}
            onValueChange={(value) => updateFormData({ country: Number.parseInt(value) })}
            disabled={isLoadingCountries}
          >
            <SelectTrigger id="country" className={errors.country ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region/State</Label>
          <Select
            value={formData.region?.toString() || ""}
            onValueChange={(value) => updateFormData({ region: Number.parseInt(value) })}
            disabled={isLoadingRegions || !formData.country}
          >
            <SelectTrigger id="region" className={errors.region ? "border-red-500" : ""}>
              <SelectValue placeholder={formData.country ? "Select your region" : "Select country first"} />
            </SelectTrigger>
            <SelectContent>
              {regions?.map((region) => (
                <SelectItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subregion">Subregion/LGA</Label>
          <Select
            value={formData.subregion?.toString() || ""}
            onValueChange={(value) => updateFormData({ subregion: Number.parseInt(value) })}
            disabled={isLoadingSubregions || !formData.region}
          >
            <SelectTrigger id="subregion" className={errors.subregion ? "border-red-500" : ""}>
              <SelectValue placeholder={formData.region ? "Select your subregion" : "Select region first"} />
            </SelectTrigger>
            <SelectContent>
              {subregions?.map((subregion) => (
                <SelectItem key={subregion.id} value={subregion.id.toString()}>
                  {subregion.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subregion && <p className="text-red-500 text-sm">{errors.subregion}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City/Town</Label>
          <Select
            value={formData.city?.toString() || ""}
            onValueChange={(value) => updateFormData({ city: Number.parseInt(value) })}
            disabled={isLoadingCities || !formData.subregion}
          >
            <SelectTrigger id="city" className={errors.city ? "border-red-500" : ""}>
              <SelectValue placeholder={formData.subregion ? "Select your city" : "Select subregion first"} />
            </SelectTrigger>
            <SelectContent>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="street_number">Street Number</Label>
          <Input
            id="street_number"
            type="number"
            value={formData.street_number?.toString() || ""}
            onChange={(e) => updateFormData({ street_number: e.target.value ? Number.parseInt(e.target.value) : null })}
            placeholder="Enter street number (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apt_number">Apartment Number</Label>
          <Input
            id="apt_number"
            type="number"
            value={formData.apt_number?.toString() || ""}
            onChange={(e) => updateFormData({ apt_number: e.target.value ? Number.parseInt(e.target.value) : null })}
            placeholder="Enter apartment number (optional)"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Street Name</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => updateFormData({ street: e.target.value })}
            placeholder="Enter street name"
            className={errors.street ? "border-red-500" : ""}
          />
          {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ""}
            onChange={(e) => updateFormData({ postal_code: e.target.value })}
            placeholder="Enter postal code (optional)"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}
