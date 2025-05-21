"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageIcon,
  Video,
  Music,
  File,
  ExternalLink,
} from "lucide-react"
import type { ProjectMedia, MilestoneMedia } from "@/types/media"

interface ViewMediaDialogProps {
  isOpen: boolean
  onClose: () => void
  media: ProjectMedia | MilestoneMedia
  allMedia?: (ProjectMedia | MilestoneMedia)[]
}

export function ViewMediaDialog({ isOpen, onClose, media, allMedia = [] }: ViewMediaDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    return allMedia.findIndex((m) => m.id === media.id)
  })

  const currentMedia = currentIndex >= 0 && currentIndex < allMedia.length ? allMedia[currentIndex] : media

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < allMedia.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "audio":
        return <Music className="h-5 w-5" />
      case "document":
      case "blueprint":
      case "contract":
      case "diagram":
      case "report":
        return <FileText className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const renderMedia = () => {
    const fileUrl = currentMedia.file_url || currentMedia.file
    const mediaType = currentMedia.media_type

    if (mediaType === "image") {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={fileUrl || "/placeholder.svg"}
            alt={currentMedia.title || "Image"}
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>
      )
    } else if (mediaType === "video") {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <video src={fileUrl} controls className="max-h-[70vh] max-w-full" />
        </div>
      )
    } else if (mediaType === "audio") {
      return (
        <div className="w-full flex flex-col items-center justify-center p-8">
          <Music className="h-24 w-24 text-muted-foreground mb-4" />
          <audio src={fileUrl} controls className="w-full" />
        </div>
      )
    } else {
      // For documents and other file types
      return (
        <div className="w-full flex flex-col items-center justify-center p-8">
          {getMediaTypeIcon(mediaType)}
          <h3 className="text-xl font-medium mt-4">{currentMedia.title}</h3>
          <p className="text-muted-foreground mb-6">{currentMedia.description}</p>
          <div className="flex space-x-4">
            <Button onClick={() => window.open(fileUrl, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in new tab
            </Button>
            <Button variant="outline" onClick={() => window.open(fileUrl, "_blank")}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            {getMediaTypeIcon(currentMedia.media_type)}
            <h2 className="text-xl font-semibold ml-2">{currentMedia.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(currentMedia.file_url || currentMedia.file, "_blank")}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative">
          {renderMedia()}

          {allMedia.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={handleNext}
                disabled={currentIndex >= allMedia.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="p-4 border-t">
          <p className="text-sm text-muted-foreground">{currentMedia.description}</p>
          {allMedia.length > 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              {currentIndex + 1} of {allMedia.length}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
