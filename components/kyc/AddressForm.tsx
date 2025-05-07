"use client"

import { useState, useEffect, useRef } from "react"
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
import { useAddAddressMutation, useUpdateAddressMutation } from "@/redux/features/profile/profileRelatedAPISlice"

interface AddressFormProps {
  formData: AddressFormData
  updateFormData: (data: Partial<AddressFormData>) => void
  onComplete: () => void
  addressId: string
  profileId: string
}

export default function AddressForm({ formData, updateFormData, onComplete, addressId, profileId }: AddressFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addAddress, { isLoading: isLoadingAddAddress }] = useAddAddressMutation()
  const [updateProfile, { isLoading: isLoadingUpdateProfile }] = useUpdateAddressMutation()
  const isMounted = useRef(false)
  
  // Country query
  const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery()
  
  // Region query with forced refetch
  const { data: regions, isLoading: isLoadingRegions } = useGetRegionsQuery(formData.country || 0, {
    skip: !formData.country,
    refetchOnMountOrArgChange: true,
  })
  
  // Subregion query with forced refetch
  const { data: subregions, isLoading: isLoadingSubregions } = useGetSubregionsQuery(formData.region || 0, {
    skip: !formData.region,
    refetchOnMountOrArgChange: true,
  })
  
  // City query with forced refetch
  const { data: cities, isLoading: isLoadingCities } = useGetCitiesQuery(formData.subregion || 0, {
    skip: !formData.subregion,
    refetchOnMountOrArgChange: true,
  })

  const isLoading = isLoadingAddAddress || isLoadingUpdateProfile

  // Reset logic for dependent fields
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    if (formData.country) {
      updateFormData({
        region: null,
        subregion: null,
        city: null,
      })
    }
  }, [formData.country])

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
      console.error("Failed to update address:", error)
    }
  }

  // Helper function to find entity name
  const getEntityName = (id: number | null, data: Array<{ id: number; name: string }> | undefined) => 
    data?.find(entity => entity.id === id)?.name

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Select */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={formData.country?.toString() || ""}
            onValueChange={value => updateFormData({ country: Number(value) })}
            disabled={isLoadingCountries}
          >
            <SelectTrigger id="country" className={errors.country ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map(country => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
        </div>

        {/* Region Select */}
        <div className="space-y-2">
          <Label htmlFor="region">Region/State</Label>
          <Select
            value={formData.region?.toString() || ""}
            onValueChange={value => updateFormData({ region: Number(value) })}
            disabled={isLoadingRegions || !formData.country}
          >
            <SelectTrigger id="region" className={errors.region ? "border-red-500" : ""}>
              <SelectValue 
                placeholder={
                  isLoadingRegions && formData.region 
                    ? "Loading saved region..." 
                    : formData.region
                      ? getEntityName(formData.region, regions) || "Invalid region"
                      : "Select region"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {regions?.map(region => (
                <SelectItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
        </div>

        {/* Subregion Select */}
        <div className="space-y-2">
          <Label htmlFor="subregion">Subregion/LGA</Label>
          <Select
            value={formData.subregion?.toString() || ""}
            onValueChange={value => updateFormData({ subregion: Number(value) })}
            disabled={isLoadingSubregions || !formData.region}
          >
            <SelectTrigger id="subregion" className={errors.subregion ? "border-red-500" : ""}>
              <SelectValue 
                placeholder={
                  isLoadingSubregions && formData.subregion 
                    ? "Loading saved subregion..." 
                    : formData.subregion
                      ? getEntityName(formData.subregion, subregions) || "Invalid subregion"
                      : "Select subregion"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subregions?.map(subregion => (
                <SelectItem key={subregion.id} value={subregion.id.toString()}>
                  {subregion.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subregion && <p className="text-red-500 text-sm">{errors.subregion}</p>}
        </div>

        {/* City Select */}
        <div className="space-y-2">
          <Label htmlFor="city">City/Town</Label>
          <Select
            value={formData.city?.toString() || ""}
            onValueChange={value => updateFormData({ city: Number(value) })}
            disabled={isLoadingCities || !formData.subregion}
          >
            <SelectTrigger id="city" className={errors.city ? "border-red-500" : ""}>
              <SelectValue 
                placeholder={
                  isLoadingCities && formData.city 
                    ? "Loading saved city..." 
                    : formData.city
                      ? getEntityName(formData.city, cities) || "Invalid city"
                      : "Select city"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cities?.map(city => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        {/* Street Number */}
        <div className="space-y-2">
          <Label htmlFor="street_number">Street Number</Label>
          <Input
            id="street_number"
            type="number"
            value={formData.street_number?.toString() || ""}
            onChange={e => updateFormData({ street_number: e.target.value ? Number(e.target.value) : null })}
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
            onChange={e => updateFormData({ apt_number: e.target.value ? Number(e.target.value) : null })}
            placeholder="Enter apartment number (optional)"
            min="0"
          />
        </div>

        {/* Street Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Street Name</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={e => updateFormData({ street: e.target.value })}
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
            onChange={e => updateFormData({ postal_code: e.target.value })}
            placeholder="Enter postal code (optional)"
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