"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, FileText, DollarSign, MessageSquare, AlertTriangle, Loader2, FileImage } from "lucide-react"

// Mock data for now - will be replaced with actual API call
const mockUpdates = [
  {
    id: 1,
    date: "2023-05-15",
    summary: "Completed initial project planning phase. Team has been assembled and roles assigned.",
    achievements: "Successfully defined project scope and timeline.",
    challenges: "Difficulty in securing all required resources.",
    next_steps: "Begin implementation of first milestone.",
    funds_spent_today: 500,
    submitted_by_details: {
      first_name: "John",
      last_name: "Doe",
    },
    created_at: "2023-05-15T14:30:00Z",
    media_files: [
      {
        id: 1,
        media_type: "image",
        file_url: "/project-meeting.png",
        caption: "Planning meeting with team",
      },
      {
        id: 2,
        media_type: "document",
        file_url: "#",
        caption: "Project plan document",
      },
    ],
  },
  {
    id: 2,
    date: "2023-05-16",
    summary: "Started work on first milestone. Team is making good progress.",
    achievements: "Completed 20% of first milestone tasks.",
    next_steps: "Continue implementation and prepare for first review.",
    funds_spent_today: 300,
    submitted_by_details: {
      first_name: "Jane",
      last_name: "Smith",
    },
    created_at: "2023-05-16T16:45:00Z",
  },
]

interface ProjectUpdatesProps {
  projectId: number
}

export function ProjectUpdates({ projectId }: ProjectUpdatesProps) {
  // In a real implementation, this would use your API
  // const { data: updates = [], isLoading } = useGetMediaByProjectQuery(projectId)
  const updates = mockUpdates
  const isLoading = false

  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  // Filter updates based on search term and date filter
  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (update.challenges && update.challenges.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (update.achievements && update.achievements.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (update.next_steps && update.next_steps.toLowerCase().includes(searchTerm.toLowerCase()))

    if (dateFilter === "all") return matchesSearch

    const updateDate = new Date(update.date)
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (dateFilter === "today") {
      return (
        matchesSearch &&
        updateDate.getDate() === today.getDate() &&
        updateDate.getMonth() === today.getMonth() &&
        updateDate.getFullYear() === today.getFullYear()
      )
    }

    if (dateFilter === "week") {
      return matchesSearch && updateDate >= lastWeek
    }

    if (dateFilter === "month") {
      return matchesSearch && updateDate >= lastMonth
    }

    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading project updates...</span>
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
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <FileImage className="mr-2 h-4 w-4" />
          Add Update
        </Button>
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
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setDateFilter}>
          <TabsList>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredUpdates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Updates Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No updates match your search criteria. Try a different search term."
                : "No updates have been submitted for this project yet."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <FileImage className="mr-2 h-4 w-4" />
              Submit First Update
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredUpdates.map((update) => (
            <Card key={update.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-lg">{new Date(update.date).toLocaleDateString()}</CardTitle>
                    </div>
                    <CardDescription>
                      Submitted by {update.submitted_by_details?.first_name} {update.submitted_by_details?.last_name}
                    </CardDescription>
                  </div>
                  {update.funds_spent_today > 0 && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      <DollarSign className="mr-1 h-3 w-3" />${update.funds_spent_today.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium mb-1">Summary</div>
                  <p className="text-gray-700 whitespace-pre-line">{update.summary}</p>
                </div>

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

                {update.media_files && update.media_files.length > 0 && (
                  <div>
                    <div className="font-medium mb-2">Media Files</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {update.media_files.map((media, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden bg-gray-100 border">
                            {media.media_type === "image" ? (
                              <img
                                src={media.file_url || `/placeholder.svg?height=200&width=200&query=project`}
                                alt={media.caption || "Project update image"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {media.caption && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                              <p className="text-white text-xs text-center">{media.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">{new Date(update.created_at).toLocaleString()}</div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
