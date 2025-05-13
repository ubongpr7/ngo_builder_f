"use client"

import { useState } from "react"
import { Download, X, ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { useGetMediaByUpdateQuery } from "@/redux/features/projects/updateApiSlice"
import type { ProjectMedia } from "@/types/project"

interface ViewMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  media: ProjectMedia
}

export function ViewMediaDialog({ open, onOpenChange, media }: ViewMediaDialogProps) {
  const { toast } = useToast()
  const [fullscreen, setFullscreen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Get all media from the same update to enable navigation
  const { data: updateMedia = [] } = useGetMediaByUpdateQuery(media.update_id, { skip: !open })

  // Find the index of the current media
  const mediaIndex = updateMedia.findIndex((m) => m.id === media.id)

  // Set the current index when the dialog opens
  useState(() => {
    if (open && mediaIndex !== -1) {
      setCurrentIndex(mediaIndex)
    }
  })

  // Navigate to previous media
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Navigate to next media
  const handleNext = () => {
    if (currentIndex < updateMedia.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  // Download media
  const handleDownload = async () => {
    if (!updateMedia.length || currentIndex >= updateMedia.length) return

    const currentMedia = updateMedia[currentIndex]
    if (!currentMedia) return

    try {
      // Fetch the file from S3
      const response = await fetch(currentMedia.file_url)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = currentMedia.title || `file-${currentMedia.id}`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your file is being downloaded.",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: "There was a problem downloading your file.",
        variant: "destructive",
      })
    }
  }

  // Determine media type and render appropriate component
  const renderMedia = () => {
    if (!updateMedia.length || currentIndex >= updateMedia.length) return null

    const currentMedia = updateMedia[currentIndex]
    const fileUrl = currentMedia.file_url
    const fileType = currentMedia.file_type || ""

    if (fileType.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center overflow-auto h-[70vh]">
          <img
            src={fileUrl || "/placeholder.svg"}
            alt={currentMedia.title || "Image"}
            className="object-contain transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
      )
    } else if (fileType.startsWith("video/")) {
      return (
        <div className="flex items-center justify-center">
          <video src={fileUrl} controls className={`max-h-[70vh] ${fullscreen ? "w-full" : "max-w-full"}`} />
        </div>
      )
    } else if (fileType.startsWith("application/pdf")) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <iframe
            src={`${fileUrl}#view=FitH`}
            className="w-full h-full border-0"
            title={currentMedia.title || "PDF Document"}
          />
        </div>
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium mb-2">{currentMedia.title}</p>
          <p className="text-sm text-muted-foreground mb-4">This file type cannot be previewed</p>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download File
          </Button>
        </div>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${fullscreen ? "max-w-[95vw] h-[95vh]" : "max-w-4xl"}`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{updateMedia[currentIndex]?.title || "Media Preview"}</DialogTitle>
          <div className="flex items-center space-x-2">
            {updateMedia[currentIndex]?.file_type?.startsWith("image/") && (
              <>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={resetZoom}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative">
          {updateMedia.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm"
                onClick={handleNext}
                disabled={currentIndex === updateMedia.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {renderMedia()}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {updateMedia.length > 0 && (
              <>
                {currentIndex + 1} of {updateMedia.length}
                {updateMedia[currentIndex]?.description && (
                  <p className="mt-1">{updateMedia[currentIndex].description}</p>
                )}
              </>
            )}
          </div>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
