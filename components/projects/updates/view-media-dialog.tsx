"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText, Mic } from 'lucide-react'

interface ViewMediaDialogProps {
  media: any
  open: boolean
  onOpenChange: (open: boolean) => void
  relatedMedia?: any[]
}

export function ViewMediaDialog({ media, open, onOpenChange, relatedMedia = [] }: ViewMediaDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  const allMedia = relatedMedia?.length > 0 ? relatedMedia : [media]
  const currentMedia = allMedia[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia?.length)
    resetView()
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia?.length) % allMedia?.length)
    resetView()
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const resetView = () => {
    setZoomLevel(1)
    setRotation(0)
  }
const handleDownload = async () => {
  try {
    const response = await fetch(currentMedia.file_url, {
      method: 'GET',
      headers: {
        // Optional: You can add authorization headers if your S3 requires them.
      },
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', currentMedia.caption || `${currentMedia.media_type}-file`)
    // link.setAttribute('target', '_blank')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Download failed", error)
  }
}

  const renderMediaContent = () => {
    switch (currentMedia.media_type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={currentMedia.file_url || "/placeholder.svg"}
              alt={currentMedia.caption || "Media"}
              className="max-h-full max-w-full transition-all duration-200 ease-in-out"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                objectFit: 'contain'
              }}
            />
          </div>
        )
      case 'video':
        return (
          <div className="flex items-center justify-center h-full">
            <video
              src={currentMedia.file_url}
              controls
              className="max-h-full max-w-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Mic className="h-24 w-24 text-green-500 mb-4" />
            <p className="text-lg font-medium mb-4">{currentMedia.caption || "Audio File"}</p>
            <audio
              src={currentMedia.file_url}
              controls
              className="w-full max-w-md"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        )
      case 'document':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText className="h-24 w-24 text-amber-500 mb-4" />
            <p className="text-lg font-medium mb-4">{currentMedia.caption || "Document File"}</p>
          {/* Add any additional document viewer here 
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Document
            </Button>
            */}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{currentMedia.caption || "Media Viewer"}</DialogTitle>
        </DialogHeader>

        <div className="relative h-[calc(90vh-8rem)] bg-gray-900 flex items-center justify-center overflow-hidden">
          {renderMediaContent()}

          {allMedia?.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <DialogFooter className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 p-4 border-t flex justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {allMedia?.length > 1 && (
              <span>
                {currentIndex + 1} of {allMedia?.length}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {currentMedia.media_type === 'image' && (
              <>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            {/* Add any additional media-specific actions here 
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            */}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
