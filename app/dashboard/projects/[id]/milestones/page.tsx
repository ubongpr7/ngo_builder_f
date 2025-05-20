"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Calendar, CheckCircle, AlertCircle, Clock, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetUserMilestonesQuery } from "@/redux/features/projects/milestoneApiSlice"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function MilestonesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})

  // Fetch milestones data
  const { data: milestones, isLoading, error } = useGetUserMilestonesQuery()

  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  // Group and filter milestones
  const groupedMilestones = useMemo(() => {
    if (!milestones) return {}

    // Filter milestones based on search query and active tab
    const filteredMilestones = milestones.filter((milestone) => {
      const matchesSearch =
        milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        milestone.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        milestone.project_details?.title.toLowerCase().includes(searchQuery.toLowerCase())

      if (activeTab === "all") return matchesSearch
      if (activeTab === "not_started") return matchesSearch && milestone.status === "pending"
      if (activeTab === "in_progress") return matchesSearch && milestone.status === "in_progress"
      if (activeTab === "completed") return matchesSearch && milestone.status === "completed"
      if (activeTab === "delayed") return matchesSearch && milestone.status === "delayed"
      if (activeTab === "overdue") return matchesSearch && milestone.is_overdue

      return matchesSearch
    })

    // Group by project
    const byProject: Record<string, any> = {}

    filteredMilestones.forEach((milestone) => {
      const projectId = milestone.project.toString()
      const projectTitle = milestone.project_details?.title || `Project ${projectId}`

      if (!byProject[projectId]) {
        byProject[projectId] = {
          id: projectId,
          title: projectTitle,
          milestones: {
            not_started: [],
            in_progress: [],
            completed: [],
            delayed: [],
            overdue: [],
          },
        }
      }

      // Add milestone to appropriate status group
      const status = milestone.is_overdue ? "overdue" : milestone.status
      byProject[projectId].milestones[status].push(milestone)
    })

    return byProject
  }, [milestones, searchQuery, activeTab])

  // Get status badge color
  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return "bg-red-500 text-white"

    switch (status) {
      case "not_started":
        return "bg-blue-200 text-blue-800"
      case "in_progress":
        return "bg-blue-500 text-white"
      case "completed":
        return "bg-green-500 text-white"
      case "delayed":
        return "bg-orange-500 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // Format status for display
  const formatStatus = (status: string, isOverdue: boolean) => {
    if (isOverdue) return "Overdue"

    switch (status) {
      case "not_started":
        return "Not Started"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "delayed":
        return "Delayed"
      default:
        return status
    }
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    if (progress >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  // Format due date
  const formatDueDate = (dateString: string) => {
    if (!dateString) return "No due date"

    const date = new Date(dateString)
    return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        {[1, 2, 3]?.map((i) => (
          <Card key={i} className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              {[1, 2]?.map((j) => (
                <div key={j} className="mb-4">
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading milestones</h3>
          <p className="mt-1 text-gray-500">There was a problem loading your milestones. Please try again later.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestone Tracking</h1>
          <p className="text-gray-600">Track key milestones across all your projects</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> New Milestone
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search milestones..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="not_started">Not Started</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {Object.keys(groupedMilestones)?.length > 0 ? (
        Object.values(groupedMilestones)?.map((project: any) => (
          <Collapsible
            key={project.id}
            className="mb-6"
            open={expandedProjects[project.id] !== false} // Default to open
            onOpenChange={() => toggleProject(project.id)}
          >
            <Card>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{Object.values(project.milestones).flat()?.length} Milestones</Badge>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Status sections */}
                  {(["not_started", "in_progress", "delayed", "overdue", "completed"] as const)?.map((status) => {
                    const statusMilestones = project.milestones[status]
                    if (statusMilestones?.length === 0) return null

                    return (
                      <div key={status} className="mb-6 last:mb-0">
                        <h3 className="text-lg font-semibold mb-3">
                          {status === "not_started"
                            ? "Not Started"
                            : status === "in_progress"
                              ? "In Progress"
                              : status === "overdue"
                                ? "Overdue"
                                : status.charAt(0).toUpperCase() + status.slice(1)}
                          <Badge variant="outline" className="ml-2">
                            {statusMilestones?.length}
                          </Badge>
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                          {statusMilestones?.map((milestone: any) => (
                            <Card key={milestone.id} className="overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                      {milestone.description || "No description provided"}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`mt-2 md:mt-0 ${getStatusColor(milestone.status, milestone.is_overdue)}`}
                                  >
                                    {formatStatus(milestone.status, milestone.is_overdue)}
                                  </Badge>
                                </div>

                                <div className="mb-4">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm font-medium">{milestone.completion_percentage}%</span>
                                  </div>
                                  <Progress
                                    value={milestone.completion_percentage}
                                    className={getProgressColor(milestone.completion_percentage)}
                                  />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>Due: {formatDueDate(milestone.due_date)}</span>
                                  </div>
                                  {milestone.days_remaining !== undefined && (
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>
                                        {milestone.days_remaining > 0
                                          ? `${milestone.days_remaining} days remaining`
                                          : milestone.days_remaining === 0
                                            ? "Due today"
                                            : `${Math.abs(milestone.days_remaining)} days overdue`}
                                      </span>
                                    </div>
                                  )}
                                  {milestone.assigned_to && milestone.assigned_to?.length > 0 && (
                                    <div className="flex items-center">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      <span>{milestone.assigned_to?.length} assignees</span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 flex justify-end">
                                  <Link href={`/dashboard/projects/${milestone.project}/milestones/${milestone.id}`}>
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))
      ) : (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No milestones found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  )
}
