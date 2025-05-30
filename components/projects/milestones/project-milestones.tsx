"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Flag,
  Users,
  Trash2,
  Edit,
  BarChart,
  ExternalLink,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useGetMilestonesByProjectQuery } from "@/redux/features/projects/milestoneApiSlice"
import { AddEditMilestoneDialog } from "./add-edit-milestone-dialog"
import { AssignUsersMilestoneDialog } from "./assign-users-milestone-dialog"
import { UpdateMilestoneStatusDialog } from "./update-milestone-status-dialog"
import { CompleteMilestoneDialog } from "./complete-milestone-dialog"
import { DeleteMilestoneDialog } from "./delete-milestone-dialog"
import { MilestoneStatistics } from "./milestone-statistics"

interface ProjectMilestonesProps {
  projectId: number
  isManager?: boolean
  is_DB_admin?: boolean
  isTeamMember?: boolean
}

export function ProjectMilestones({ projectId, isManager, is_DB_admin, isTeamMember }: ProjectMilestonesProps) {
  const { data: milestones = [], isLoading, refetch } = useGetMilestonesByProjectQuery(projectId)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showStats, setShowStats] = useState(false)

  // Filter milestones based on search term and active tab
  const filteredMilestones = milestones.filter((milestone) => {
    const matchesSearch =
      milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && milestone.status.toLowerCase() === activeTab.toLowerCase()
  })

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "delayed":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
  }

  // Calculate days remaining or overdue
  const getDaysRemaining = (dueDate: string, completionDate: string | null | undefined, status: string) => {
    const today = new Date()
    const due = new Date(dueDate)

    if (status === "completed" && completionDate) {
      const completed = new Date(completionDate)
      const diffDays = Math.round((completed.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays > 0) {
        return <span className="text-red-500">{diffDays} days late</span>
      } else if (diffDays < 0) {
        return <span className="text-green-500">{Math.abs(diffDays)} days early</span>
      } else {
        return <span className="text-green-500">On time</span>
      }
    }

    if (today > due && status !== "completed") {
      const diffDays = Math.round((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
      return <span className="text-red-500">{diffDays} days overdue</span>
    }

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return <span>{diffDays} days remaining</span>
  }

  // Handle successful operations
  const handleSuccess = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading milestones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Project Milestones</h2>
          <p className="text-gray-500">Track key milestones and deliverables</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowStats(!showStats)} className={showStats ? "bg-blue-50" : ""}>
            <BarChart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{showStats ? "Hide Statistics" : "Show Statistics"}</span>
          </Button>
          {(isManager || is_DB_admin || isTeamMember) && (
            <AddEditMilestoneDialog
              projectId={projectId}
              onSuccess={handleSuccess}
              trigger={
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Flag className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Milestone</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              }
            />
          )}
        </div>
      </div>

      {showStats && <MilestoneStatistics projectId={projectId} />}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search milestones..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredMilestones?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Milestones Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No milestones match your search criteria. Try a different search term."
                : "No milestones have been created for this project yet."}
            </p>
            {(isManager || is_DB_admin || isTeamMember) && (
              <AddEditMilestoneDialog
                projectId={projectId}
                onSuccess={handleSuccess}
                trigger={
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Flag className="mr-2 h-4 w-4" />
                    Add First Milestone
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMilestones?.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <CardTitle>{milestone.title}</CardTitle>
                    <CardDescription>Due: {new Date(milestone.due_date).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityBadgeColor(milestone.priority)}>
                      {milestone.priority?.charAt(0).toUpperCase() + milestone.priority?.slice(1)}
                    </Badge>
                    <Badge className={getStatusBadgeColor(milestone.status)}>{formatStatus(milestone.status)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{milestone.description}</p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm mb-2 gap-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    {getDaysRemaining(milestone.due_date, milestone.completion_date, milestone.status)}
                  </div>
                  {milestone.completion_date && (
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Completed: {new Date(milestone.completion_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {milestone.status !== "completed" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{milestone.completion_percentage || 0}%</span>
                    </div>
                    <Progress value={milestone.completion_percentage || 0} className="h-2" />
                  </div>
                )}

                {milestone.assigned_to && milestone.assigned_to?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium mb-2 flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-500" />
                      Assigned To
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {milestone.assigned_to?.map((user) => (
                        <Badge key={user.id} variant="outline" className="bg-gray-50">
                          {user.first_name} {user.last_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {milestone.deliverables && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium mb-1">Deliverables</div>
                    <p className="text-sm text-gray-700">{milestone.deliverables}</p>
                  </div>
                )}

                {milestone.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{milestone.notes}</p>
                  </div>
                )}
              </CardContent>
              {(isManager || is_DB_admin || isTeamMember) && (
                <CardFooter className="flex flex-wrap justify-end gap-2">
                  {/* Link to milestone detail page */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                          asChild
                        >
                          <Link href={`/dashboard/projects/${projectId}/milestones/${milestone.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button variant="outline" size="sm" className="sm:hidden" asChild>
                    <Link href={`/dashboard/projects/${projectId}/milestones/${milestone.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Details
                    </Link>
                  </Button>

                  
                  <UpdateMilestoneStatusDialog
                    milestone={milestone}
                    onSuccess={handleSuccess}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className=" bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Status
                      </Button>
                    }
                  />

                  {milestone.status !== "completed" && (
                    <>

                      <CompleteMilestoneDialog
                        milestone={milestone}
                        onSuccess={handleSuccess}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className=" bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        }
                      />
                    </>
                  )}

                  <AddEditMilestoneDialog
                    projectId={projectId}
                    milestone={milestone}
                    onSuccess={handleSuccess}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className=" bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    }
                  />

                  <AssignUsersMilestoneDialog
                    milestone={milestone}
                    onSuccess={handleSuccess}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className=" bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Assign
                      </Button>
                    }
                    projectId={projectId}
                  />

                  <DeleteMilestoneDialog
                    milestone={milestone}
                    onSuccess={handleSuccess}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className=" bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    }
                  />
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
