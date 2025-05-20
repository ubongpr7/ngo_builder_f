"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  ImageIcon,
  Video,
  Music,
  File,
  Plus,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react"
import { MediaUploadDialog } from "@/components/media/media-upload-dialog"
import {
  useGetMediaByMilestoneQuery,
   useGetMilestoneImagesQuery,
   useGetMilestoneVideosQuery,
  useGetMilestoneDocumentsQuery,
  useGetDeliverableMediaQuery,
  useAddMilestoneMediaMutation,
  useUpdateMilestoneMediaMutation,
  useDeleteMilestoneMediaMutation,
  useToggleDeliverableMutation,
} from "@/redux/features/projects/milestoneApiSlice"
import type { MilestoneMedia } from "@/types/media"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"

interface MilestoneDocumentsProps {
  milestoneId: number
  projectId: number
}

export function MilestoneDocuments({ milestoneId, projectId }: MilestoneDocumentsProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MilestoneMedia | null>(null)

  // Queries
  const { data: allMedia, isLoading: isLoadingAll, refetch: refetchAll } = useGetMediaByMilestoneQuery(milestoneId)
  const {
    data: images,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useGetMilestoneImagesQuery({ milestoneId })
  const {
    data: videos,
    isLoading: isLoadingVideos,
    refetch: refetchVideos,
  } = useGetMilestoneVideosQuery({ milestoneId })
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useGetMilestoneDocumentsQuery({ milestoneId })
  const {
    data: deliverables,
    isLoading: isLoadingDeliverables,
    refetch: refetchDeliverables,
  } = useGetDeliverableMediaQuery(milestoneId)

  // Mutations
  const [addMilestoneMedia, { isLoading: isAdding }] = useAddMilestoneMediaMutation()
  const [updateMilestoneMedia, { isLoading: isUpdating }] = useUpdateMilestoneMediaMutation()
  const [deleteMilestoneMedia, { isLoading: isDeleting }] = useDeleteMilestoneMediaMutation()
  const [toggleDeliverable, { isLoading: isTogglingDeliverable }] = useToggleDeliverableMutation()

  // Handle media upload
  const handleMediaUpload = async (formData: FormData) => {
    try {
      await addMilestoneMedia(formData).unwrap()
      toast({
        title: "Media uploaded",
        description: "The media file has been uploaded successfully.",
      })
      refetchAll()
      refetchByType(activeTab)
    } catch (error) {
      console.error("Failed to upload media:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading the media file.",
        variant: "destructive",
      })
    }
  }

  // Handle media update
  const handleMediaUpdate = async (formData: FormData) => {
    if (!selectedMedia) return

    try {
      await updateMilestoneMedia({
        id: selectedMedia.id,
        media: formData,
      }).unwrap()

      toast({
        title: "Media updated",
        description: "The media file has been updated successfully.",
      })

      refetchAll()
      refetchByType(activeTab)
      setSelectedMedia(null)
    } catch (error) {
      console.error("Failed to update media:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating the media file.",
        variant: "destructive",
      })
    }
  }

  // Handle media deletion
  const handleMediaDelete = async () => {
    if (!selectedMedia) return

    try {
      await deleteMilestoneMedia(selectedMedia.id).unwrap()

      toast({
        title: "Media deleted",
        description: "The media file has been deleted successfully.",
      })

      refetchAll()
      refetchByType(activeTab)
      setSelectedMedia(null)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete media:", error)
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the media file.",
        variant: "destructive",
      })
    }
  }

  // Handle deliverable toggle
  const handleToggleDeliverable = async (media: MilestoneMedia) => {
    try {
      await toggleDeliverable(media.id).unwrap()

      toast({
        title: media.represents_deliverable ? "Removed from deliverables" : "Added to deliverables",
        description: `The media file has been ${media.represents_deliverable ? "removed from" : "added to"} milestone deliverables.`,
      })

      refetchAll()
      refetchByType(activeTab)
    } catch (error) {
      console.error("Failed to toggle deliverable status:", error)
      toast({
        title: "Action failed",
        description: "There was an error updating the deliverable status.",
        variant: "destructive",
      })
    }
  }

  // Refetch based on active tab
  const refetchByType = (type: string) => {
    switch (type) {
      case "images":
        refetchImages()
        break
      case "videos":
        refetchVideos()
        break
      case "documents":
        refetchDocuments()
        break
      case "deliverables":
        refetchDeliverables()
        break
      default:
        refetchAll()
    }
  }

  // Get current media list based on active tab
  const getCurrentMedia = (): MilestoneMedia[] => {
    switch (activeTab) {
      case "images":
        return images || []
      case "videos":
        return videos || []
      case "documents":
        return documents || []
      case "deliverables":
        return deliverables || []
      default:
        return allMedia || []
    }
  }

  // Check if loading based on active tab
  const isLoading = (): boolean => {
    switch (activeTab) {
      case "images":
        return isLoadingImages
      case "videos":
        return isLoadingVideos
      case "documents":
        return isLoadingDocuments
      case "deliverables":
        return isLoadingDeliverables
      default:
        return isLoadingAll
    }
  }

  // Get icon based on media type
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

  // Get file extension from URL
  const getFileExtension = (url: string): string => {
    return url.split(".").pop()?.toLowerCase() || ""
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Milestone Documents</h2>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading() ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : getCurrentMedia().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No documents found</h3>
                <p className="text-gray-500 text-center mb-6">
                  {activeTab === "all"
                    ? "No documents have been uploaded for this milestone yet."
                    : activeTab === "deliverables"
                      ? "No deliverables have been uploaded for this milestone yet."
                      : `No ${activeTab.slice(0, -1)} files have been uploaded for this milestone yet.`}
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentMedia().map((media) => (
                <Card
                  key={media.id}
                  className={`overflow-hidden ${media.represents_deliverable ? "ring-2 ring-green-500" : ""}`}
                >
                  <div className="relative">
                    {media.media_type === "image" ? (
                      <div className="h-48 bg-gray-100 relative">
                        <img
                          src={media.file_url || "/placeholder.svg"}
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : media.media_type === "video" ? (
                      <div className="h-48 bg-gray-800 flex items-center justify-center">
                        <video src={media.file_url} className="w-full h-full object-cover" controls />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          {getMediaTypeIcon(media.media_type)}
                          <p className="mt-2 text-sm font-medium">{getFileExtension(media.file_url || "")}</p>
                        </div>
                      </div>
                    )}

                    {media.represents_deliverable && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Deliverable
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium line-clamp-1">{media.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <File className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(media.file_url, "_blank")}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMedia(media)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleDeliverable(media)}>
                            {media.represents_deliverable ? (
                              <>
                                <Circle className="h-4 w-4 mr-2" />
                                Remove from Deliverables
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Deliverable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMedia(media)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {media.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{media.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        {getMediaTypeIcon(media.media_type)}
                        <span className="ml-1 capitalize">{media.media_type}</span>
                      </div>
                      <span>{formatDistanceToNow(new Date(media.uploaded_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSubmit={handleMediaUpload}
        title="Milestone Document"
        mediaType="milestone"
        milestoneId={milestoneId}
        projectId={projectId}
      />

      {/* Edit Dialog */}
      {selectedMedia && (
        <MediaUploadDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedMedia(null)
          }}
          onSubmit={handleMediaUpdate}
          title="Milestone Document"
          mediaType="milestone"
          initialData={selectedMedia}
          milestoneId={milestoneId}
          projectId={projectId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMedia(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMediaDelete} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
