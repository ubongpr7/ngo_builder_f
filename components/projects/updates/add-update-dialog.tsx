"use client"

import { useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2, Upload, X, ImageIcon, FileText, Video, Mic, AlertCircle } from 'lucide-react'
import { 
  useCreateUpdateMutation,
  useAddMediaMutation
} from "@/redux/features/projects/updateApiSlice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  achievements: z.string().optional(),
  challenges: z.string().optional(),
  next_steps: z.string().optional(),
  funds_spent_today: z.coerce.number().min(0, "Amount must be positive or zero"),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Date is required",
  }).refine(date => {
    // Ensure date is not in the future
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    return date <= today
  }, "Date cannot be in the future"),
})

type FormValues = z.infer<typeof formSchema>

interface AddUpdateDialogProps {
  projectId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddUpdateDialog({ projectId, open, onOpenChange, onSuccess }: AddUpdateDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<{ file: File; preview: string; type: string; caption: string }[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [createUpdate] = useCreateUpdateMutation()
  const [addMedia] = useAddMediaMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: "",
      achievements: "",
      challenges: "",
      next_steps: "",
      funds_spent_today: 0,
      date: new Date(),
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files?.length > 0) {
      const newFiles = Array.from(e.target.files)
      setMediaFiles(prev => [...prev, ...newFiles])
      
      // Create previews
      newFiles.forEach(file => {
        const fileType = file.type.split('/')[0]
        let preview = ''
        let type = 'document'
        
        if (fileType === 'image') {
          preview = URL.createObjectURL(file)
          type = 'image'
        } else if (fileType === 'video') {
          preview = URL.createObjectURL(file)
          type = 'video'
        } else if (fileType === 'audio') {
          type = 'audio'
        } else {
          type = 'document'
        }
        
        setMediaPreviews(prev => [...prev, { 
          file, 
          preview, 
          type, 
          caption: file.name 
        }])
      })
    }
  }

  const removeMedia = (index: number) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateCaption = (index: number, caption: string) => {
    setMediaPreviews(prev => 
      prev?.map((item, i) => 
        i === index ? { ...item, caption } : item
      )
    )
  }

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      case 'video':
        return <Video className="h-6 w-6 text-red-500" />
      case 'audio':
        return <Mic className="h-6 w-6 text-green-500" />
      default:
        return <FileText className="h-6 w-6 text-amber-500" />
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setUploadProgress(0)
    
    try {
      // First create the update
      const updateData = {
        project: projectId,
        date: data.date.toISOString().split('T')[0],
        summary: data.summary,
        achievements: data.achievements || "",
        challenges: data.challenges || "",
        next_steps: data.next_steps || "",
        funds_spent_today: data.funds_spent_today,
      }
      
      const response = await createUpdate(updateData).unwrap()
      const updateId = response.id
      
      // Then upload media files if any
      if (mediaFiles?.length > 0) {
        const totalFiles = mediaFiles?.length
        let uploadedFiles = 0
        
        for (const [index, fileData] of mediaPreviews.entries()) {
          const formData = new FormData()
          formData.append('update', updateId.toString())
          formData.append('file', fileData.file)
          
          // Determine media type
          let mediaType = 'document'
          const fileType = fileData.file.type.split('/')[0]
          if (fileType === 'image') mediaType = 'image'
          else if (fileType === 'video') mediaType = 'video'
          else if (fileType === 'audio') mediaType = 'audio'
          
          formData.append('media_type', mediaType)
          formData.append('caption', fileData.caption || fileData.file.name)
          
          await addMedia(formData).unwrap()
          
          uploadedFiles++
          setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100))
        }
      }
      
      toast({
        title: "Update Added",
        description: "The project update has been successfully added.",
      })
      
      reset()
      setMediaFiles([])
      setMediaPreviews([])
      onOpenChange(false)
      onSuccess?.()
      
    } catch (error) {
      console.error("Failed to add update:", error)
      toast({
        title: "Error",
        description: "Failed to add update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setMediaFiles([])
      setMediaPreviews([])
      setActiveTab("details")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Project Update</DialogTitle>
          <DialogDescription>
            Share today's progress, achievements, and challenges with your team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Update Details</TabsTrigger>
            <TabsTrigger value="media">
              Media Files {mediaPreviews?.length > 0 && `(${mediaPreviews?.length})`}
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DateInput 
                        id="date" 
                        value={field.value} 
                        onChange={field.onChange}
                        maxDate={new Date()} // Restrict to today and earlier
                      />
                    )}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="funds_spent_today">Funds Spent Today ($)</Label>
                  <Input 
                    id="funds_spent_today" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    {...register("funds_spent_today")} 
                  />
                  {errors.funds_spent_today && (
                    <p className="text-sm text-red-500">{errors.funds_spent_today.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea 
                  id="summary" 
                  {...register("summary")} 
                  rows={4}
                  placeholder="Provide a summary of today's progress and activities"
                />
                {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea 
                  id="achievements" 
                  {...register("achievements")} 
                  rows={3}
                  placeholder="What milestones or goals were achieved today?"
                />
                {errors.achievements && <p className="text-sm text-red-500">{errors.achievements.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges</Label>
                <Textarea 
                  id="challenges" 
                  {...register("challenges")} 
                  rows={3}
                  placeholder="What obstacles or challenges were encountered?"
                />
                {errors.challenges && <p className="text-sm text-red-500">{errors.challenges.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea 
                  id="next_steps" 
                  {...register("next_steps")} 
                  rows={3}
                  placeholder="What are the planned next steps or focus areas?"
                />
                {errors.next_steps && <p className="text-sm text-red-500">{errors.next_steps.message}</p>}
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="flex justify-center">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-1">Upload Media Files</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports images, videos, documents, and audio files
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {mediaPreviews?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Selected Files ({mediaPreviews?.length})</h3>
                  <div className="space-y-3">
                    {mediaPreviews?.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-md bg-gray-50">
                        <div className="flex-shrink-0">
                          {item.type === 'image' ? (
                            <div className="h-16 w-16 rounded overflow-hidden bg-white">
                              <img 
                                src={item.preview || "/placeholder.svg"} 
                                alt={item.caption} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-16 rounded bg-white flex items-center justify-center">
                              {getMediaTypeIcon(item.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            {getMediaTypeIcon(item.type)}
                            <span className="text-sm font-medium truncate">
                              {item.file.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <Input
                            placeholder="Add caption"
                            value={item.caption}
                            onChange={(e) => updateCaption(index, e.target.value)}
                            className="text-sm h-8"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          onClick={() => removeMedia(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mediaPreviews?.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No media files selected</AlertTitle>
                  <AlertDescription>
                    Media files are optional. You can add images, videos, documents, or audio files to provide visual context to your update.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <DialogFooter className="mt-6">
              {activeTab === "details" ? (
                <>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("media")} disabled={isSubmitting}>
                    Next: Add Media
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setActiveTab("details")} disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Submitting..."}
                      </>
                    ) : (
                      "Submit Update"
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
