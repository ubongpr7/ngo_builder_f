"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProfileImageUploader } from "./ProfileImageUploader"
import { Camera } from "lucide-react"

interface ProfileImageUploaderButtonProps {
  userId: string
  profileId: string
  currentImage?: string | null
  userName?: string
  onSuccess?: () => void
  buttonText?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    absolute?: boolean
}

export function ProfileImageUploaderButton({
  userId,
  profileId,
  currentImage,
  userName,
  onSuccess,
  buttonText = "Update Profile Picture",
  buttonVariant = "outline",
    absolute = true,
}: ProfileImageUploaderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localImage, setLocalImage] = useState<string | null>(currentImage || null)

  const handleSuccess = (imageUrl: string) => {
    setLocalImage(imageUrl)
    if (onSuccess) onSuccess()
  }

  return (
    <>
    <div onClick={() => setIsOpen(true)} className={ `absolute ${absolute?"bottom-0 right-0":"bottom-50 right-50"}  bg-green-600 rounded-full p-1.5 cursor-pointer shadow-md`}>
        <Camera className={`${absolute?"h-4 w-4": "h-10 w-10"} text-white`} />
    </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-gray-50">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>Upload a new profile picture or drag and drop an image file.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6">
            <ProfileImageUploader
              userId={userId}
              profileId={profileId}
              currentImage={localImage}
              userName={userName}
              onSuccess={handleSuccess}
              size="lg"
            />

            <p className="text-sm text-gray-500 mt-4 text-center">
              Recommended: Square image, at least 400x400 pixels.
              <br />
              Supports JPG, PNG, GIF and WebP formats.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
