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
  Star,
  StarOff,
  Loader2,
} from "lucide-react"
import { MediaUploadDialog } from "@/components/media/media-upload-dialog"
import {
  useGetMediaByProjectQuery,
   useGetProjectImagesQuery,
   useGetProjectVideosQuery,
  useGetProjectDocumentsQuery,
  useAddProjectMediaMutation,
  useUpdateProjectMediaMutation,
  useDeleteProjectMediaMutation,
  useToggleFeaturedMutation,
} from "@/redux/features/projects/projectsAPISlice"

import type { ProjectMedia } from "@/types/media"
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

interface ProjectDocumentsProps {
  projectId: number
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<ProjectMedia | null>(null)

  // Queries
  const { data: allMedia, isLoading: isLoadingAll, refetch: refetchAll } = useGetMediaByProjectQuery(projectId)
  const { data: images, isLoading: isLoadingImages, refetch: refetchImages } = useGetProjectImagesQuery( projectId )
  const { data: videos, isLoading: isLoadingVideos, refetch: refetchVideos } = useGetProjectVideosQuery( projectId )
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useGetProjectDocumentsQuery(projectId )

  // Mutations
  const [addProjectMedia, { isLoading: isAdding }] = useAddProjectMediaMutation()
  const [updateProjectMedia, { isLoading: isUpdating }] = useUpdateProjectMediaMutation()
  const [deleteProjectMedia, { isLoading: isDeleting }] = useDeleteProjectMediaMutation()
  const [toggleFeatured, { isLoading: isTogglingFeatured }] = useToggleFeaturedMutation()

  // Handle media upload
  const handleMediaUpload = async (formData: FormData) => {
    try {
      await addProjectMedia(formData).unwrap()
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
      await updateProjectMedia({
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
      await deleteProjectMedia(selectedMedia.id).unwrap()

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

  // Handle featured toggle
  const handleToggleFeatured = async (media: ProjectMedia) => {
    try {
      await toggleFeatured(media.id).unwrap()

      toast({
        title: media.is_featured ? "Removed from featured" : "Added to featured",
        description: `The media file has been ${media.is_featured ? "removed from" : "added to"} featured items.`,
      })

      refetchAll()
      refetchByType(activeTab)
    } catch (error) {
      console.error("Failed to toggle featured status:", error)
      toast({
        title: "Action failed",
        description: "There was an error updating the featured status.",
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
      default:
        refetchAll()
    }
  }

  // Get current media list based on active tab
  const getCurrentMedia = (): ProjectMedia[] => {
    switch (activeTab) {
      case "images":
        return images || []
      case "videos":
        return videos || []
      case "documents":
        return documents || []
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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Documents</h2>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
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
                    ? "No documents have been uploaded for this project yet."
                    : `No ${activeTab.slice(0, -1)} files have been uploaded for this project yet.`}
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
                <Card key={media.id} className={`overflow-hidden ${media.is_featured ? "ring-2 ring-primary" : ""}`}>
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

                    {media.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
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
                          <DropdownMenuItem onClick={() => handleToggleFeatured(media)}>
                            {media.is_featured ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Remove from Featured
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Add to Featured
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
        title="Project Document"
        mediaType="project"
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
          title="Project Document"
          mediaType="project"
          initialData={selectedMedia}
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
