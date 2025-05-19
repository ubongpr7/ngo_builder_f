"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Trash2,
  Edit,
  Calendar,
  Flag,
  BarChart,
  ArrowLeft,
  FileText,
  MessageSquare,
  LinkIcon,
  ExternalLink,
  Download,
  Upload,
  PlusCircle,
} from "lucide-react"
import { useGetMilestoneByIdQuery } from "@/redux/features/projects/milestoneApiSlice"
import { TaskList } from "../task/taskList"
import { AddEditMilestoneDialog } from "./add-edit-milestone-dialog"
import { AssignUsersMilestoneDialog } from "./assign-users-milestone-dialog"
import { UpdateMilestoneStatusDialog } from "./update-milestone-status-dialog"
import { CompleteMilestoneDialog } from "./complete-milestone-dialog"
import { DeleteMilestoneDialog } from "./delete-milestone-dialog"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MilestoneDetailProps {
  milestoneId: number
  projectId: number
  isManager: boolean
  is_DB_admin: boolean
  isTeamMember: boolean
}

export function MilestoneDetail({
  milestoneId,
  projectId,
  isManager,
  is_DB_admin,
  isTeamMember,
}: MilestoneDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showStats, setShowStats] = useState(false)

  const {
    data: milestone,
    isLoading,
    error,
    refetch,
  } = useGetMilestoneByIdQuery(milestoneId, {
    refetchOnMountOrArgChange: true,
  })

  const canEdit = isManager || is_DB_admin || isTeamMember

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
    return status?.charAt(0).toUpperCase() + status?.slice(1).replace("_", " ")
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

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Handle successful operations
  const handleSuccess = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !milestone) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Milestone not found</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            The milestone you are looking for does not exist or you do not have permission to view it.
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{milestone.title}</h1>
            <Badge className={getStatusBadgeColor(milestone.status)}>{formatStatus(milestone.status)}</Badge>
            <Badge className={getPriorityBadgeColor(milestone.priority)}>
              {milestone.priority?.charAt(0).toUpperCase() + milestone.priority?.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-500">
            Part of project:{" "}
            <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline">
              {milestone.project?.title}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/projects/${projectId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Project
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Return to project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canEdit && (
            <TooltipProvider>
              <div className="flex items-center gap-2">
                {/* Update Status Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <UpdateMilestoneStatusDialog
                      milestone={milestone}
                      onSuccess={handleSuccess}
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update Status</p>
                  </TooltipContent>
                </Tooltip>

                {/* Mark Complete Button - Only show if not completed */}
                {milestone.status !== "completed" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CompleteMilestoneDialog
                        milestone={milestone}
                        onSuccess={handleSuccess}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark Complete</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Edit Milestone Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AddEditMilestoneDialog
                      projectId={projectId}
                      milestone={milestone}
                      onSuccess={handleSuccess}
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Milestone</p>
                  </TooltipContent>
                </Tooltip>

                {/* Assign Users Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AssignUsersMilestoneDialog
                      milestone={milestone}
                      onSuccess={handleSuccess}
                      projectId={projectId}
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:text-purple-700"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assign Users</p>
                  </TooltipContent>
                </Tooltip>

                {/* Delete Milestone Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeleteMilestoneDialog
                      milestone={milestone}
                      onSuccess={() => {
                        // Navigate back to project page after deletion
                        window.location.href = `/dashboard/projects/${projectId}`
                      }}
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Milestone</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Milestone Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700">{milestone.description || "No description provided."}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {milestone.start_date ? formatDate(milestone.start_date) : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDate(milestone.due_date)}
                    </p>
                  </div>
                </div>

                {milestone.completion_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Date</h3>
                    <p className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {formatDate(milestone.completion_date)}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Deliverables</h3>
                  <p className="text-gray-700">{milestone.deliverables || "No deliverables specified."}</p>
                </div>

                {milestone.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{milestone.notes}</p>
                    </div>
                  </>
                )}

                {milestone.external_links && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">External Links</h3>
                      <div className="space-y-2">
                        {milestone.external_links.split(",").map((link, index) => (
                          <div key={index} className="flex items-center">
                            <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <a
                              href={link.trim().startsWith("http") ? link.trim() : `https://${link.trim()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {link.trim()}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Timeline</h3>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {getDaysRemaining(milestone.due_date, milestone.completion_date, milestone.status)}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                      <span className="text-sm font-medium">{milestone.completion_percentage || 0}%</span>
                    </div>
                    <Progress value={milestone.completion_percentage || 0} className="h-2" />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tasks</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-gray-500">Total</p>
                        <p className="font-medium">{milestone.tasks_count || 0}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded-md">
                        <p className="text-gray-500">Completed</p>
                        <p className="font-medium">{milestone.completed_tasks_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Card */}
              {milestone.assigned_to && milestone.assigned_to.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>People assigned to this milestone</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {milestone.assigned_to.map((user) => (
                        <div key={user.id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profile_image || ""} />
                            <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {canEdit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AssignUsersMilestoneDialog
                              milestone={milestone}
                              onSuccess={handleSuccess}
                              trigger={
                                <Button variant="outline" size="sm" className="w-full">
                                  <Users className="mr-2 h-4 w-4" />
                                  Manage Team
                                </Button>
                              }
                              projectId={projectId}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add or remove team members</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tasks</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                        <BarChart className="mr-2 h-4 w-4" />
                        {showStats ? "Hide Statistics" : "Show Statistics"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showStats ? "Hide task statistics" : "Show task statistics"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              {/* Task List Component */}
              <TaskList
                milestoneId={milestoneId}
                projectId={projectId}
                isManager={isManager}
                is_DB_admin={is_DB_admin}
                isTeamMember={isTeamMember}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People assigned to this milestone</CardDescription>
            </CardHeader>
            <CardContent>
              {milestone.assigned_to && milestone.assigned_to.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {milestone.assigned_to.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-center p-4">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={user.profile_image || ""} />
                            <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.role && (
                              <Badge variant="outline" className="mt-1">
                                {user.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Team Members Assigned</h3>
                  <p className="text-gray-500 mb-4">There are no team members assigned to this milestone yet.</p>
                  {canEdit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AssignUsersMilestoneDialog
                            milestone={milestone}
                            onSuccess={handleSuccess}
                            trigger={
                              <Button>
                                <Users className="mr-2 h-4 w-4" />
                                Assign Team Members
                              </Button>
                            }
                            projectId={projectId}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add team members to this milestone</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </CardContent>
            {canEdit && milestone.assigned_to && milestone.assigned_to.length > 0 && (
              <CardFooter>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AssignUsersMilestoneDialog
                        milestone={milestone}
                        onSuccess={handleSuccess}
                        trigger={
                          <Button variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Team Members
                          </Button>
                        }
                        projectId={projectId}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add or remove team members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Files and documents related to this milestone</CardDescription>
                </div>
                {canEdit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload a new document</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {milestone.documents && milestone.documents.length > 0 ? (
                <div className="space-y-4">
                  {milestone.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded by {doc.uploaded_by} on {formatDate(doc.upload_date)}
                          </p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Documents</h3>
                  <p className="text-gray-500 mb-4">There are no documents attached to this milestone yet.</p>
                  {canEdit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload First Document
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload your first document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Discussions about this milestone</CardDescription>
            </CardHeader>
            <CardContent>
              {milestone.comments && milestone.comments.length > 0 ? (
                <div className="space-y-4">
                  {milestone.comments.map((comment, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={comment.user.profile_image || ""} />
                          <AvatarFallback>
                            {getInitials(`${comment.user.first_name} ${comment.user.last_name}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {comment.user.first_name} {comment.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Comments</h3>
                  <p className="text-gray-500 mb-4">There are no comments on this milestone yet.</p>
                </div>
              )}

              {canEdit && (
                <div className="mt-4 pt-4 border-t">
                  <textarea
                    className="w-full p-3 border rounded-md min-h-[100px]"
                    placeholder="Add a comment..."
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Comment
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Post your comment</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
