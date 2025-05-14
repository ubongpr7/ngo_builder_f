"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Calendar, FileText, DollarSign, MessageSquare, AlertTriangle, Loader2, FileImage, Edit, Trash2, Eye, Download, BarChart2, ImageIcon, Video, File, Mic, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { AddUpdateDialog } from "./add-update-dialog"
import { EditUpdateDialog } from "./edit-update-dialog"
import { ViewMediaDialog } from "./view-media-dialog"
import { DeleteUpdateDialog } from "./delete-update-dialog"
import { UpdateFilterDialog } from "./update-filter-dialog"
import { UpdateStatisticsDialog } from "./update-statistics-dialog"
import { 
  useGetUpdatesByProjectQuery,
  useGetUpdateStatisticsQuery,
  useDeleteUpdateMutation,
  useGetMediaByUpdateQuery
} from "@/redux/features/projects/updateApiSlice"
import { UpdateTimelineView } from "./update-timeline-view"
import { UpdateGalleryView } from "./update-gallery-view"

interface ProjectUpdatesProps {
  projectId: number
  isManager?: boolean
  is_DB_admin?: boolean
  isTeamMember?: boolean
}

export function ProjectUpdates({ projectId, isManager, is_DB_admin, isTeamMember }: ProjectUpdatesProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "timeline" | "gallery">("list")
  const [expandedUpdates, setExpandedUpdates] = useState<number[]>([])
  const [filters, setFilters] = useState<any>({})
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  // Dialog states
  const [addUpdateOpen, setAddUpdateOpen] = useState(false)
  const [editUpdateOpen, setEditUpdateOpen] = useState(false)
  const [viewMediaOpen, setViewMediaOpen] = useState(false)
  const [deleteUpdateOpen, setDeleteUpdateOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [statisticsOpen, setStatisticsOpen] = useState(false)
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)

  // API queries
  const {
    data: updates = [],
    isLoading,
    refetch,
    isFetching
  } = useGetUpdatesByProjectQuery(projectId)

  const { data: statistics } = useGetUpdateStatisticsQuery(projectId)
  const [deleteUpdate] = useDeleteUpdateMutation()

  // Filter updates based on search term and date filter
  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (update.challenges && update.challenges.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (update.achievements && update.achievements.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (update.next_steps && update.next_steps.toLowerCase().includes(searchTerm.toLowerCase()))

    // Apply date filter
    if (dateFilter !== "all") {
      const updateDate = new Date(update.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      if (dateFilter === "today") {
        return matchesSearch && 
          updateDate.getDate() === today.getDate() &&
          updateDate.getMonth() === today.getMonth() &&
          updateDate.getFullYear() === today.getFullYear()
      }

      if (dateFilter === "yesterday") {
        return matchesSearch && 
          updateDate.getDate() === yesterday.getDate() &&
          updateDate.getMonth() === yesterday.getMonth() &&
          updateDate.getFullYear() === yesterday.getFullYear()
      }

      if (dateFilter === "week") {
        return matchesSearch && updateDate >= lastWeek
      }

      if (dateFilter === "month") {
        return matchesSearch && updateDate >= lastMonth
      }
    }

    // Apply custom filters
    if (filters.minAmount && update.funds_spent_today < filters.minAmount) {
      return false
    }

    if (filters.maxAmount && update.funds_spent_today > filters.maxAmount) {
      return false
    }

    if (filters.startDate && new Date(update.date) < new Date(filters.startDate)) {
      return false
    }

    if (filters.endDate && new Date(update.date) > new Date(filters.endDate)) {
      return false
    }

    if (filters.submittedBy && update.submitted_by !== filters.submittedBy) {
      return false
    }

    if (filters.hasMedia === true && (!update.media_files || update.media_files.length === 0)) {
      return false
    }

    if (filters.hasMedia === false && update.media_files && update.media_files.length > 0) {
      return false
    }

    return matchesSearch
  })

  // Sort updates
  const sortedUpdates = [...filteredUpdates].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB
  })

  // Toggle update expansion
  const toggleUpdateExpansion = (updateId: number) => {
    setExpandedUpdates(prev => 
      prev.includes(updateId) 
        ? prev.filter(id => id !== updateId)
        : [...prev, updateId]
    )
  }

  // Handle edit update
  const handleEditUpdate = (update: any) => {
    setSelectedUpdate(update)
    setEditUpdateOpen(true)
  }

  // Handle delete update
  const handleDeleteUpdate = (update: any) => {
    setSelectedUpdate(update)
    setDeleteUpdateOpen(true)
  }

  // Handle view media
  const handleViewMedia = (media: any) => {
    setSelectedMedia(media)
    setViewMediaOpen(true)
  }

  // Handle download media
  const handleDownloadMedia = (media: any) => {
    // Create a temporary anchor element
    const link = document.createElement('a')
    link.href = media.file_url
    link.download = media.caption || `${media.media_type}-file`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle filter apply
  const handleFilterApply = (newFilters: any) => {
    setFilters(newFilters)
    setFilterDialogOpen(false)
  }

  // Handle filter clear
  const handleFilterClear = () => {
    setFilters({})
    setFilterDialogOpen(false)
  }

  // Get media type icon
  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      case 'video':
        return <Video className="h-8 w-8 text-red-500" />
      case 'document':
        return <FileText className="h-8 w-8 text-amber-500" />
      case 'audio':
        return <Mic className="h-8 w-8 text-green-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  // Calculate total funds spent
  const totalFundsSpent = filteredUpdates.reduce((sum, update) => sum + Number(update.funds_spent_today), 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Project Updates</h2>
          <p className="text-gray-500">Daily progress reports and updates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilterDialogOpen(true)}
            className={Object.keys(filters).length > 0 ? "border-blue-500 text-blue-600" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            {Object.keys(filters).length > 0 ? `Filters (${Object.keys(filters).length})` : "Filter"}
          </Button>
          {/* Uncomment if you want to add a refresh button
          <Button
            variant="outline"
            onClick={() => setStatisticsOpen(true)}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Statistics
          </Button>
          */}

          {(isManager  || isTeamMember) && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={() => setAddUpdateOpen(true)}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Add Update
            </Button>

          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search updates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setDateFilter}>
            <TabsList>
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("list")}
          >
            <FileText className="mr-2 h-4 w-4" />
            List View
          </Button>
          {/* Uncomment if you want to add a timeline view
          }
          <Button 
            variant={viewMode === "timeline" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("timeline")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Timeline
          </Button>
          <Button 
            variant={viewMode === "gallery" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("gallery")}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Gallery
          </Button>
          */}
        </div>
        <div className="text-sm text-gray-500">
          {filteredUpdates.length} updates • ${totalFundsSpent.toLocaleString()} total spent
        </div>
      </div>

      {/* Summary Card */}
      {statistics && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Total Updates</div>
                <div className="text-2xl font-bold">{statistics.total_updates || 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Updates This Week</div>
                <div className="text-2xl font-bold">{statistics.updates_this_week || 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Total Funds Spent</div>
                <div className="text-2xl font-bold">
                  $
                  {typeof statistics.total_funds_spent === "number"
                    ? statistics.total_funds_spent.toLocaleString()
                    : "0.00"}
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>
      )}

      {isFetching && !isLoading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
          <span className="text-gray-500">Refreshing updates...</span>
        </div>
      )}

      {filteredUpdates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Updates Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? "No updates match your search criteria. Try different search terms or filters."
                : "No updates have been submitted for this project yet."}
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={() => setAddUpdateOpen(true)}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Submit First Update
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "list" && (
            <div className="space-y-6">
              {sortedUpdates.map((update) => {
                const isExpanded = expandedUpdates.includes(update.id)
                return (
                  <Card key={update.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <CardTitle className="text-lg">{format(new Date(update.date), 'MMMM d, yyyy')}</CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <Avatar className="h-5 w-5 mr-1">
                              <AvatarImage src={update.submitted_by_details?.profile_image || "/placeholder.svg"} />
                              <AvatarFallback>
                                {update.submitted_by_details?.first_name?.[0] || ""}
                                {update.submitted_by_details?.last_name?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            Submitted by {update.submitted_by_details?.first_name} {update.submitted_by_details?.last_name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {update.funds_spent_today > 0 && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                              <DollarSign className="mr-1 h-3 w-3" />${Number(update.funds_spent_today).toLocaleString()}
                            </Badge>
                          )}
                          {(isManager || isTeamMember) && (

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUpdate(update)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Update
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleUpdateExpansion(update.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {isExpanded ? "Collapse" : "Expand"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUpdate(update)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Update
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="font-medium mb-1">Summary</div>
                        <p className={`text-gray-700 whitespace-pre-line ${!isExpanded && update.summary.length > 200 ? "line-clamp-3" : ""}`}>
                          {update.summary}
                        </p>
                        {!isExpanded && update.summary.length > 200 && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-blue-600" 
                            onClick={() => toggleUpdateExpansion(update.id)}
                          >
                            Read more
                          </Button>
                        )}
                      </div>

                      {isExpanded && (
                        <>
                          {update.achievements && (
                            <div>
                              <div className="font-medium mb-1">Achievements</div>
                              <p className="text-gray-700 whitespace-pre-line">{update.achievements}</p>
                            </div>
                          )}

                          {update.challenges && (
                            <div>
                              <div className="font-medium mb-1">Challenges</div>
                              <p className="text-gray-700 whitespace-pre-line">{update.challenges}</p>
                            </div>
                          )}

                          {update.next_steps && (
                            <div>
                              <div className="font-medium mb-1">Next Steps</div>
                              <p className="text-gray-700 whitespace-pre-line">{update.next_steps}</p>
                            </div>
                          )}
                        </>
                      )}

                      {update.media_files && update.media_files.length > 0 && (
                        <div>
                          <div className="font-medium mb-2">Media Files ({update.media_files.length})</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {update.media_files.slice(0, isExpanded ? undefined : 4).map((media, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-md overflow-hidden bg-gray-100 border">
                                  {media.media_type === "image" ? (
                                    <img
                                      src={media.file_url || `/placeholder.svg?height=200&width=200&query=project`}
                                      alt={media.caption || "Project update image"}
                                      className="w-full h-full object-cover cursor-pointer"
                                      onClick={() => handleViewMedia(media)}
                                    />
                                  ) : (
                                    <div 
                                      className="w-full h-full flex items-center justify-center cursor-pointer"
                                      onClick={() => handleViewMedia(media)}
                                    >
                                      {getMediaTypeIcon(media.media_type)}
                                    </div>
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="flex gap-1">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-white"
                                      onClick={() => handleViewMedia(media)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {/* Uncomment if you want to allow media deletion
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-white"
                                      onClick={() => handleDownloadMedia(media)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                     */}
                                  </div>
                                </div>
                                {media.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs text-center truncate">{media.caption}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                            {!isExpanded && update.media_files.length > 4 && (
                              <div 
                                className="aspect-square rounded-md overflow-hidden bg-gray-100 border flex items-center justify-center cursor-pointer"
                                onClick={() => toggleUpdateExpansion(update.id)}
                              >
                                <div className="text-center">
                                  <p className="text-lg font-medium text-gray-600">+{update.media_files.length - 4}</p>
                                  <p className="text-xs text-gray-500">more files</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-gray-500">
                        {format(new Date(update.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex gap-2">
                        {!isExpanded && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleUpdateExpansion(update.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        )}
                        {(isManager || isTeamMember) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUpdate(update)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>

                        )}
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          {viewMode === "timeline" && (
            <UpdateTimelineView 
              updates={sortedUpdates} 
              onViewMedia={handleViewMedia}
              onEditUpdate={handleEditUpdate}
              onDeleteUpdate={handleDeleteUpdate}
            />
          )}

          {viewMode === "gallery" && (
            <UpdateGalleryView 
              projectId={projectId} 
              onViewMedia={handleViewMedia}
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <AddUpdateDialog
        projectId={projectId}
        open={addUpdateOpen}
        onOpenChange={setAddUpdateOpen}
        onSuccess={refetch}
      />

      {selectedUpdate && (
        <>
          <EditUpdateDialog
            projectId={projectId}
            update={selectedUpdate}
            open={editUpdateOpen}
            onOpenChange={setEditUpdateOpen}
            onSuccess={refetch}
          />

          <DeleteUpdateDialog
            update={selectedUpdate}
            open={deleteUpdateOpen}
            onOpenChange={setDeleteUpdateOpen}
            onSuccess={refetch}
          />
        </>
      )}

      {selectedMedia && (
        <ViewMediaDialog
          media={selectedMedia}
          open={viewMediaOpen}
          onOpenChange={setViewMediaOpen}
        />
      )}

      <UpdateFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        initialFilters={filters}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        projectId={projectId}
      />

      <UpdateStatisticsDialog
        projectId={projectId}
        open={statisticsOpen}
        onOpenChange={setStatisticsOpen}
      />
    </div>
  )
}
