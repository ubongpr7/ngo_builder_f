"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGetImagesQuery, useGetVideosQuery, useGetDocumentsQuery } from "@/redux/features/projects/updateApiSlice"
import type { ProjectMedia } from "@/types/project"
import { ViewMediaDialog } from "./view-media-dialog"
import { Loader2, FileText, ImageIcon, Film, Grid, List } from "lucide-react"

interface UpdateGalleryViewProps {
  projectId: number
}

export function UpdateGalleryView({ projectId }: UpdateGalleryViewProps) {
  const [activeTab, setActiveTab] = useState("images")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedMedia, setSelectedMedia] = useState<ProjectMedia | null>(null)
  const [viewMediaDialogOpen, setViewMediaDialogOpen] = useState(false)

  const { data: images, isLoading: imagesLoading } = useGetImagesQuery({ projectId })
  const { data: videos, isLoading: videosLoading } = useGetVideosQuery({ projectId })
  const { data: documents, isLoading: documentsLoading } = useGetDocumentsQuery({ projectId })

  const handleViewMedia = (media: ProjectMedia) => {
    setSelectedMedia(media)
    setViewMediaDialogOpen(true)
  }

  const renderMedia = (media: ProjectMedia[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!media || media?.length === 0) {
      return (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium">No media found</h3>
          <p className="text-muted-foreground mt-2">There are no media files in this category.</p>
        </div>
      )
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media?.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewMedia(item)}
            >
              <CardContent className="p-0">
                {item.file_type.startsWith("image/") ? (
                  <div className="aspect-square relative">
                    <img
                      src={item.file || "/placeholder.svg"}
                      alt={item.title || "Media"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : item.file_type.startsWith("video/") ? (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Film className="h-12 w-12 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{item.title || item.file_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    } else {
      return (
        <div className="space-y-2">
          {media?.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
              onClick={() => handleViewMedia(item)}
            >
              {item.file_type.startsWith("image/") ? (
                <div className="w-12 h-12 mr-3 rounded overflow-hidden">
                  <img
                    src={item.file || "/placeholder.svg"}
                    alt={item.title || "Media"}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : item.file_type.startsWith("video/") ? (
                <div className="w-12 h-12 mr-3 bg-muted flex items-center justify-center rounded">
                  <Film className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-12 h-12 mr-3 bg-muted flex items-center justify-center rounded">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title || item.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()} • {item.update_title || "Unknown update"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  const getActiveMedia = () => {
    switch (activeTab) {
      case "images":
        return images || []
      case "videos":
        return videos || []
      case "documents":
        return documents || []
      default:
        return []
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="images" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images
              {images && images?.length > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{images?.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Film className="h-4 w-4 mr-2" />
              Videos
              {videos && videos?.length > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{videos?.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
              {documents && documents?.length > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{documents?.length}</span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 ml-1"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TabsContent value="images" className="mt-0">
        {renderMedia(images, imagesLoading)}
      </TabsContent>
      <TabsContent value="videos" className="mt-0">
        {renderMedia(videos, videosLoading)}
      </TabsContent>
      <TabsContent value="documents" className="mt-0">
        {renderMedia(documents, documentsLoading)}
      </TabsContent>

      {selectedMedia && (
        <ViewMediaDialog
          isOpen={viewMediaDialogOpen}
          onClose={() => setViewMediaDialogOpen(false)}
          media={selectedMedia}
          allMedia={getActiveMedia()}
        />
      )}
    </div>
  )
}
