"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X, Save, Upload } from "lucide-react"
import { useUpdateProfileMutation } from "@/redux/features/profile/profileAPISlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

interface ProfileImageUploaderProps {
  userId: string
  profileId: string
  currentImage?: string | null
  userName?: string
  onSuccess?: (imageUrl: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ProfileImageUploader({
  userId,
  profileId,
  currentImage,
  userName = "",
  onSuccess,
  className = "",
  size = "md",
}: ProfileImageUploaderProps) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Size mappings
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  // Helper function to extract URL from various possible data structures
  const getImageUrl = (imageData: any): string | null => {
    if (!imageData) return null

    // Case 1: imageData is a string URL directly
    if (typeof imageData === "string") return imageData

    // Case 2: imageData is an object with a url property
    if (typeof imageData === "object" && "url" in imageData) return imageData.url

    // Case 3: imageData is an object with a different structure
    if (typeof imageData === "object") {
      // Check for common URL field names
      for (const field of ["url", "file", "path", "src", "image"]) {
        if (field in imageData && typeof imageData[field] === "string") {
          return imageData[field]
        }
      }
    }

    return null
  }

  // Initialize preview image from existing URL if available
  useEffect(() => {
    const imageUrl = getImageUrl(currentImage)
    if (imageUrl) setImagePreview(imageUrl)
  }, [currentImage])

  // Get initials for avatar fallback
  const getInitials = (): string => {
    if (!userName) return "U"

    const parts = userName.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      validateAndPreviewFile(file)
    }
  }

  const validateAndPreviewFile = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setSelectedFile(file)
    setHasChanges(true)
  }

  const handleSaveImage = async () => {
    if (!selectedFile) return

    try {
      const formDataObj = new FormData()
      formDataObj.append("profile_image", selectedFile)

      const result = await updateProfile({ id: profileId, data: formDataObj }).unwrap()

      // Call onSuccess callback with the new image URL if available
      const newImageUrl = getImageUrl(result?.profile_image) || imagePreview
      if (onSuccess && newImageUrl) onSuccess(newImageUrl)

      setHasChanges(false)

      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile image. Please try again.",
        variant: "destructive",
      })
      console.error("Error uploading profile image:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndPreviewFile(file)
    }
  }

  const handleRemoveImage = async () => {
    // If we have unsaved changes, just clear the preview
    if (hasChanges) {
      setImagePreview(getImageUrl(currentImage))
      setSelectedFile(null)
      setHasChanges(false)
      return
    }

    try {
      const formDataObj = new FormData()
      formDataObj.append("profile_image", "")

      await updateProfile({ id: profileId, data: formDataObj }).unwrap()
      setImagePreview(null)
      setSelectedFile(null)

      if (onSuccess) onSuccess("")

      toast({
        title: "Profile image removed",
        description: "Your profile image has been successfully removed.",
      })
    } catch (error) {
      toast({
        title: "Removal failed",
        description: "There was a problem removing your profile image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-col items-center">
        <div
          className={`relative ${sizeClasses[size]} cursor-pointer group mb-3`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Avatar
            className={`${sizeClasses[size]} border-2 border-white shadow-sm ${
              isDragging ? "ring-2 ring-green-500" : ""
            }`}
          >
            <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback className="bg-green-100 text-green-800 text-xl font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {imagePreview && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveImage()
              }}
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove image</span>
            </Button>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-60 rounded-full flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-8 px-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1" /> Select
          </Button>

          {hasChanges && (
            <Button
              type="button"
              size="sm"
              className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700"
              onClick={handleSaveImage}
              disabled={isLoading || !selectedFile}
            >
              <Save className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
