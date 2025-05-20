"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, FileText, ImageIcon, Video, Music, File } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { BaseMedia } from "@/types/project"

interface MediaUploadDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
  title: string
  mediaType?: "project" | "milestone"
  initialData?: Partial<BaseMedia>
  projectId?: number
  milestoneId?: number
}

export function MediaUploadDialog({
  open,
  onClose,
  onSubmit,
  title,
  mediaType = "project",
  initialData,
  projectId,
  milestoneId,
}: MediaUploadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mediaTitle, setMediaTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [caption, setCaption] = useState(initialData?.caption || "")
  const [type, setType] = useState(initialData?.media_type || "document")
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)
  const [isDeliverable, setIsDeliverable] = useState(initialData?.represents_deliverable || false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const validateFileType = (file: File, selectedType: string): boolean => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

    switch (selectedType) {
      case "image":
        return ["jpg", "jpeg", "png", "gif"].includes(fileExtension)
      case "video":
        return ["mp4", "mov", "avi", "wmv"].includes(fileExtension)
      case "document":
        return ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"].includes(fileExtension)
      case "audio":
        return ["mp3", "wav", "ogg"].includes(fileExtension)
      case "blueprint":
      case "contract":
      case "diagram":
      case "report":
        return ["pdf", "doc", "docx", "jpg", "jpeg", "png"].includes(fileExtension)
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!mediaTitle.trim()) {
      setError("Title is required")
      return
    }

    if (initialData?.id && !selectedFile && !initialData.file) {
      setError("Please select a file")
      return
    }

    if (selectedFile && !validateFileType(selectedFile, type)) {
      setError(`The selected file type is not valid for ${type}`)
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()

      if (mediaType === "project" && projectId) {
        formData.append("project", projectId.toString())
      } else if (mediaType === "milestone" && milestoneId) {
        formData.append("milestone", milestoneId.toString())
      }

      formData.append("title", mediaTitle)
      formData.append("media_type", type)

      if (description) formData.append("description", description)
      if (caption) formData.append("caption", caption)

      if (mediaType === "project") {
        formData.append("is_featured", isFeatured ? "true" : "false")
      } else if (mediaType === "milestone") {
        formData.append("represents_deliverable", isDeliverable ? "true" : "false")
      }

      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      if (initialData?.id) {
        formData.append("id", initialData.id.toString())
      }

      await onSubmit(formData)
      onClose()
    } catch (err) {
      console.error("Error submitting media:", err)
      setError("Failed to upload media. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMediaTypeIcon = () => {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Edit" : "Upload"} {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="media-type">Media Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="media-type" className="w-full">
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="blueprint">Blueprint</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="diagram">Diagram</SelectItem>
                <SelectItem value="report">Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="Enter media title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="block">
              File
            </Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                required={!initialData?.id}
              />
              {getMediaTypeIcon()}
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>

          {mediaType === "project" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
              />
              <Label htmlFor="is-featured">Featured (appears prominently in project views)</Label>
            </div>
          )}

          {mediaType === "milestone" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-deliverable"
                checked={isDeliverable}
                onCheckedChange={(checked) => setIsDeliverable(checked as boolean)}
              />
              <Label htmlFor="is-deliverable">This media represents a milestone deliverable</Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : initialData?.id ? "Update" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
