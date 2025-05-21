"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, ImageIcon, Video, Music, File, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onChange: (file: File | null) => void
  value: File | null
  mediaType: string
  defaultPreview?: string
  className?: string
}

export function FileUpload({ onChange, value, mediaType, defaultPreview, className }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(defaultPreview || null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      onChange(file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      onChange(file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const getMediaTypeIcon = () => {
    switch (mediaType) {
      case "image":
        return <ImageIcon className="h-10 w-10 text-muted-foreground" />
      case "video":
        return <Video className="h-10 w-10 text-muted-foreground" />
      case "audio":
        return <Music className="h-10 w-10 text-muted-foreground" />
      case "document":
      case "blueprint":
      case "contract":
      case "diagram":
      case "report":
        return <FileText className="h-10 w-10 text-muted-foreground" />
      default:
        return <File className="h-10 w-10 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="file-upload">File</Label>

      {value || preview ? (
        <div className="relative border rounded-md p-2">
          <div className="flex items-center">
            {mediaType === "image" && preview ? (
              <div className="w-20 h-20 mr-3 rounded overflow-hidden bg-muted">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 mr-3 rounded bg-muted flex items-center justify-center">
                {getMediaTypeIcon()}
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium truncate">{value?.name || "Current file"}</p>
              <p className="text-sm text-muted-foreground">{value ? `${(value.size / 1024).toFixed(1)} KB` : ""}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="mt-1">
                Change file
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemove} className="h-8 w-8 absolute top-2 right-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
          <p className="text-xs text-muted-foreground">
            {mediaType === "image"
              ? "PNG, JPG or GIF up to 10MB"
              : mediaType === "video"
                ? "MP4, MOV or AVI up to 100MB"
                : mediaType === "audio"
                  ? "MP3, WAV or OGG up to 50MB"
                  : "PDF, DOC, DOCX, XLS, XLSX up to 10MB"}
          </p>
        </div>
      )}

      <Input
        ref={inputRef}
        id="file-upload"
        type="file"
        onChange={handleChange}
        className="hidden"
        accept={
          mediaType === "image"
            ? "image/*"
            : mediaType === "video"
              ? "video/*"
              : mediaType === "audio"
                ? "audio/*"
                : mediaType === "document"
                  ? ".pdf,.doc,.docx,.txt"
                  : mediaType === "blueprint" ||
                      mediaType === "contract" ||
                      mediaType === "diagram" ||
                      mediaType === "report"
                    ? ".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    : undefined
        }
      />
    </div>
  )
}
