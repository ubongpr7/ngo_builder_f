"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload } from "lucide-react"
import type { IdentityVerificationFormData } from "../interfaces/kyc-forms"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice" 





interface IdentityVerificationFormProps {
  formData: IdentityVerificationFormData
  updateFormData: (data: Partial<IdentityVerificationFormData>) => void
  onComplete: () => void
  userId:string,
  profileId:string
}

export default function IdentityVerificationForm({
  formData,
  updateFormData,
  onComplete,
  userId,
  profileId
}: IdentityVerificationFormProps) {
  const [submitKYC, { isLoading }] = useUpdateProfileMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Refs for file inputs
  const frontImageRef = useRef<HTMLInputElement>(null)
  const backImageRef = useRef<HTMLInputElement>(null)
  const selfieImageRef = useRef<HTMLInputElement>(null)

  // Preview states
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null)
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null)
  const [selfieImagePreview, setSelfieImagePreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "selfie") => {
    const file = e.target.files?.[0] || null

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)

      // Update preview state
      if (type === "front") {
        setFrontImagePreview(previewUrl)
        updateFormData({ id_document_image_front: file })
      } else if (type === "back") {
        setBackImagePreview(previewUrl)
        updateFormData({ id_document_image_back: file })
      } else if (type === "selfie") {
        setSelfieImagePreview(previewUrl)
        updateFormData({ selfie_image: file })
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.id_document_type) {
      newErrors.id_document_type = "Document type is required"
    }

    if (!formData.id_document_number.trim()) {
      newErrors.id_document_number = "Document number is required"
    }

    if (!formData.id_document_image_front) {
      newErrors.id_document_image_front = "Front image of ID document is required"
    }

    if (!formData.id_document_image_back) {
      newErrors.id_document_image_back = "Back image of ID document is required"
    }

    if (!formData.selfie_image) {
      newErrors.selfie_image = "Selfie with ID is required"
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
      const formDataObj = new FormData()
      formDataObj.append("id_document_type", formData.id_document_type)
      formDataObj.append("id_document_number", formData.id_document_number)

      if (formData.id_document_image_front) {
        formDataObj.append("id_document_image_front", formData.id_document_image_front)
      }

      if (formData.id_document_image_back) {
        formDataObj.append("id_document_image_back", formData.id_document_image_back)
      }

      if (formData.selfie_image) {
        formDataObj.append("selfie_image", formData.selfie_image)
      }

      await submitKYC({id:profileId,data:formDataObj}).unwrap()
      onComplete()
    } catch (error) {
      console.error("Failed to submit KYC documents:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>ID Document Type</Label>
          <RadioGroup
            value={formData.id_document_type}
            onValueChange={(value) => updateFormData({ id_document_type: value })}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="passport" id="passport" />
              <Label htmlFor="passport">Passport</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="national-id" id="national-id" />
              <Label htmlFor="national-id">National ID Card</Label>
            </div>
          </RadioGroup>
            
          {errors.id_document_type && <p className="text-red-500 text-sm">{errors.id_document_type}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_document_number">ID Document Number</Label>
          <Input
            id="id_document_number"
            value={formData.id_document_number}
            onChange={(e) => updateFormData({ id_document_number: e.target.value })}
            placeholder="Enter your ID document number"
            className={errors.id_document_number ? "border-red-500" : ""}
          />
          {errors.id_document_number && <p className="text-red-500 text-sm">{errors.id_document_number}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>ID Document (Front)</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${
                errors.id_document_image_front ? "border-red-500" : ""
              }`}
              onClick={() => frontImageRef.current?.click()}
            >
              {frontImagePreview ? (
                <div className="relative w-full">
                  <img
                    src={frontImagePreview || "/placeholder.svg"}
                    alt="ID Front Preview"
                    className="mx-auto max-h-40 object-contain"
                  />
                  <p className="text-xs text-center mt-2">Click to change</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or PDF (max. 5MB)</p>
                </>
              )}
              <Input
                ref={frontImageRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, "front")}
              />
            </div>
            {errors.id_document_image_front && <p className="text-red-500 text-sm">{errors.id_document_image_front}</p>}
          </div>

          <div className="space-y-2">
            <Label>ID Document (Back)</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${
                errors.id_document_image_back ? "border-red-500" : ""
              }`}
              onClick={() => backImageRef.current?.click()}
            >
              {backImagePreview ? (
                <div className="relative w-full">
                  <img
                    src={backImagePreview || "/placeholder.svg"}
                    alt="ID Back Preview"
                    className="mx-auto max-h-40 object-contain"
                  />
                  <p className="text-xs text-center mt-2">Click to change</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or PDF (max. 5MB)</p>
                </>
              )}
              <Input
                ref={backImageRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, "back")}
              />
            </div>
            {errors.id_document_image_back && <p className="text-red-500 text-sm">{errors.id_document_image_back}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Selfie with ID</Label>
          <div
            className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${
              errors.selfie_image ? "border-red-500" : ""
            }`}
            onClick={() => selfieImageRef.current?.click()}
          >
            {selfieImagePreview ? (
              <div className="relative w-full">
                <img
                  src={selfieImagePreview || "/placeholder.svg"}
                  alt="Selfie Preview"
                  className="mx-auto max-h-40 object-contain"
                />
                <p className="text-xs text-center mt-2">Click to change</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload a photo of yourself holding your ID</p>
                <p className="text-xs text-gray-400">PNG or JPG (max. 5MB)</p>
              </>
            )}
            <Input
              ref={selfieImageRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "selfie")}
            />
          </div>
          {errors.selfie_image && <p className="text-red-500 text-sm">{errors.selfie_image}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit & Continue"}
        </Button>
      </div>
    </form>
  )
}
