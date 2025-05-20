"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Media {
  type: string
  url: string
  caption?: string
}

interface MediaGalleryProps {
  media: Media[]
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media?.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media?.length - 1 ? 0 : prev + 1))
  }

  // For single image
  if (media?.length === 1) {
    return (
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogTrigger asChild>
          <div className="relative h-96 w-full rounded-lg overflow-hidden cursor-pointer">
            <Image
              src={media[0].url || "/placeholder.svg"}
              alt={media[0].caption || "Project update image"}
              fill
              className="object-cover"
            />
            {media[0].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                {media[0].caption}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <div className="relative h-[80vh] w-full">
            <Image
              src={media[0].url || "/placeholder.svg"}
              alt={media[0].caption || "Project update image"}
              fill
              className="object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-black/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            {media[0].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center">
                {media[0].caption}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // For multiple images
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {media.map((item, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden cursor-pointer ${
              index === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2" : ""
            }`}
            style={{ height: index === 0 ? "300px" : "150px" }}
            onClick={() => {
              setCurrentIndex(index)
              setIsLightboxOpen(true)
            }}
          >
            <Image
              src={item.url || "/placeholder.svg"}
              alt={item.caption || `Project update image ${index + 1}`}
              fill
              className="object-cover"
            />
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">{item.caption}</div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <div className="relative h-[80vh] w-full">
            <Image
              src={media[currentIndex].url || "/placeholder.svg"}
              alt={media[currentIndex].caption || `Project update image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-black/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-black/20"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-black/20"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            {media[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center">
                {media[currentIndex].caption}
              </div>
            )}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1">
              {media.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(index)
                  }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
