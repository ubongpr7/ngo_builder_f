"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReactSelectField, type SelectOption } from "@/components/ui/react-select-field"
import type { AddressFormData } from "../interfaces/kyc-forms"
import {
  useGetCountriesQuery,
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetCitiesQuery,
} from "@/redux/features/common/typeOF"
import { useAddAddressMutation, useUpdateAddressMutation } from "@/redux/features/profile/profileRelatedAPISlice"

interface AddressFormProps {
  formData: AddressFormData
  updateFormData: (data: Partial<AddressFormData>) => void
  onComplete: () => void
  addressId: string
  profileId: string
}

export default function AddressForm({ formData, updateFormData, onComplete, addressId, profileId }: AddressFormProps) {
  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // API mutations
  const [addAddress, { isLoading: isLoadingAddAddress }] = useAddAddressMutation()
  const [updateProfile, { isLoading: isLoadingUpdateProfile }] = useUpdateAddressMutation()

  // Loading state
  const isLoading = isLoadingAddAddress || isLoadingUpdateProfile

  // Fetch countries (always)
  const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery()

  // Fetch regions (only if country is selected)
  const { data: regions, isLoading: isLoadingRegions } = useGetRegionsQuery(formData.country || 0, {
    skip: !formData.country,
    refetchOnMountOrArgChange: true,
  })

  // Fetch subregions (only if region is selected)
  const { data: subregions, isLoading: isLoadingSubregions } = useGetSubregionsQuery(formData.region || 0, {
    skip: !formData.region,
    refetchOnMountOrArgChange: true,
  })

  // Fetch cities (only if subregion is selected)
  const { data: cities, isLoading: isLoadingCities } = useGetCitiesQuery(formData.subregion || 0, {
    skip: !formData.subregion,
    refetchOnMountOrArgChange: true,
  })

  // Convert data arrays to react-select options
  const countryOptions: SelectOption[] = countries
    ? countries.map((country) => ({
        value: country.id.toString(),
        label: country.name,
      }))
    : []

  const regionOptions: SelectOption[] = regions
    ? regions.map((region) => ({
        value: region.id.toString(),
        label: region.name,
      }))
    : []

  const subregionOptions: SelectOption[] = subregions
    ? subregions.map((subregion) => ({
        value: subregion.id.toString(),
        label: subregion.name,
      }))
    : []

  const cityOptions: SelectOption[] = cities
    ? cities.map((city) => ({
        value: city.id.toString(),
        label: city.name,
      }))
    : []

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.region) newErrors.region = "Region/State is required"
    if (!formData.subregion) newErrors.subregion = "Subregion/LGA is required"
    if (!formData.city) newErrors.city = "City/Town is required"
    if (!formData.street?.trim()) newErrors.street = "Street is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const addressData = {
        country: formData.country,
        region: formData.region,
        subregion: formData.subregion,
        city: formData.city,
        street: formData.street,
        street_number: formData.street_number,
        apt_number: formData.apt_number,
        postal_code: formData.postal_code,
      }

      if (addressId) {
        await updateProfile({
          userProfileId: profileId,
          addressId: addressId,
          address: addressData,
        }).unwrap()
      } else {
        await addAddress({
          userProfileId: profileId,
          address: addressData,
        }).unwrap()
      }

      onComplete()
    } catch (error) {
      console.error("Error saving address:", error)
    }
  }

  // Handle form reset
  const handleReset = () => {
    updateFormData({
      country: null,
      region: null,
      subregion: null,
      city: null,
      street: "",
      street_number: null,
      apt_number: null,
      postal_code: "",
    })
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Select */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <ReactSelectField
            options={countryOptions}
            value={countryOptions.find((option) => option.value === formData.country?.toString())}
            onChange={(option) => {
              // When country changes, reset all dependent fields
              updateFormData({
                country: option ? Number(option.value) : null,
                region: null,
                subregion: null,
                city: null,
              })
            }}
            placeholder={isLoadingCountries ? "Loading countries..." : "Select your country"}
            isDisabled={isLoadingCountries}
            error={errors.country}
            isSearchable
            isClearable
          />
          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
        </div>

        {/* Region Select */}
        <div className="space-y-2">
          <Label htmlFor="region">Region/State</Label>
          <ReactSelectField
            options={regionOptions}
            value={regionOptions.find((option) => option.value === formData.region?.toString())}
            onChange={(option) => {
              // When region changes, reset subregion and city
              updateFormData({
                region: option ? Number(option.value) : null,
                subregion: null,
                city: null,
              })
            }}
            placeholder={
              isLoadingRegions ? "Loading regions..." : !formData.country ? "Select country first" : "Select region"
            }
            isDisabled={isLoadingRegions || !formData.country}
            error={errors.region}
            isSearchable
            isClearable
          />
          {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
        </div>

        {/* Subregion Select */}
        <div className="space-y-2">
          <Label htmlFor="subregion">Subregion/LGA</Label>
          <ReactSelectField
            options={subregionOptions}
            value={subregionOptions.find((option) => option.value === formData.subregion?.toString())}
            onChange={(option) => {
              // When subregion changes, reset city
              updateFormData({
                subregion: option ? Number(option.value) : null,
                city: null,
              })
            }}
            placeholder={
              isLoadingSubregions
                ? "Loading subregions..."
                : !formData.region
                  ? "Select region first"
                  : "Select subregion"
            }
            isDisabled={isLoadingSubregions || !formData.region}
            error={errors.subregion}
            isSearchable
            isClearable
          />
          {errors.subregion && <p className="text-red-500 text-sm">{errors.subregion}</p>}
        </div>

        {/* City Select */}
        <div className="space-y-2">
          <Label htmlFor="city">City/Town</Label>
          <ReactSelectField
            options={cityOptions}
            value={cityOptions.find((option) => option.value === formData.city?.toString())}
            onChange={(option) => {
              updateFormData({
                city: option ? Number(option.value) : null,
              })
            }}
            placeholder={
              isLoadingCities ? "Loading cities..." : !formData.subregion ? "Select subregion first" : "Select city"
            }
            isDisabled={isLoadingCities || !formData.subregion}
            error={errors.city}
            isSearchable
            isClearable
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        {/* Street Number */}
        <div className="space-y-2">
          <Label htmlFor="street_number">Street Number</Label>
          <Input
            id="street_number"
            type="number"
            value={formData.street_number?.toString() || ""}
            onChange={(e) => updateFormData({ street_number: e.target.value ? Number(e.target.value) : null })}
            placeholder="Enter street number (optional)"
            min="0"
          />
        </div>

        {/* Apartment Number */}
        <div className="space-y-2">
          <Label htmlFor="apt_number">Apartment Number</Label>
          <Input
            id="apt_number"
            type="number"
            value={formData.apt_number?.toString() || ""}
            onChange={(e) => updateFormData({ apt_number: e.target.value ? Number(e.target.value) : null })}
            placeholder="Enter apartment number (optional)"
            min="0"
          />
        </div>

        {/* Street Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Street Name</Label>
          <Input
            id="street"
            value={formData.street || ""}
            onChange={(e) => updateFormData({ street: e.target.value })}
            placeholder="Enter street name"
            className={errors.street ? "border-red-500" : ""}
          />
          {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
        </div>

        {/* Postal Code */}
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

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
          Reset Form
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}
