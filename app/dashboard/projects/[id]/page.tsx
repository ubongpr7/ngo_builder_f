"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "react-toastify"
import {
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Target,
} from "lucide-react"

import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectTeam } from "@/components/projects/teams/project-team"
import { ProjectMilestones } from "@/components/projects/milestones/project-milestones"
import { ProjectUpdates } from "@/components/projects/updates/project-updates"
import { ProjectExpenses } from "@/components/projects/expenses/project-expenses"

import { useGetProjectByIdQuery, useUpdateProjectMutation } from "@/redux/features/projects/projectsAPISlice"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "@/components/permissionHander"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { ProjectDocuments } from "@/components/projects/project-documents"

export default function ProjectDetail() {
  const { id } = useParams()
  const projectId = Number(id)

  const { data: project, isLoading, isError, refetch } = useGetProjectByIdQuery(projectId)
  const [activeTab, setActiveTab] = useState("overview")
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const isManager = usePermissions(userRoles, {
    requiredRoles: ["is_ceo"],
    requireKYC: true,
    customCheck: (user) => user.user_id === project?.manager_details?.id,
  })
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const isTeamMember = usePermissions(userRoles, {
    requiredRoles: [],
    requireKYC: true,
    customCheck: (user) => !!project?.team_members?.some((member) => member?.id === user.user_id),
  })

  const [editProjectOpen, setEditProjectOpen] = useState(false)

  const refreshProject = () => {
    refetch()
  }
  const [updateProject] = useUpdateProjectMutation()

  const handleApprove = async (projectId: number) => {
    try {
      await updateProject({ id: projectId, data: { status: "planning" } }).unwrap()
      toast.success("The project proposal has been approved and is now in planning status.", {
        
      })
      refetch()
    } catch (error) {
      console.error("Failed to approve project:", error)
      toast.error("Failed to approve project. Please try again.", {
        
      })
    }
  }

  const handleReject = async (projectId: number) => {
    try {
      await updateProject({ id: projectId, data: { status: "cancelled" } }).unwrap()
      toast.success("The project proposal has been rejected.", {
        
      })
      refetch()
    } catch (error) {
      toast.error("Failed to reject project. Please try again.", {
        
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading project details...</span>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-4">
          The project you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  // Calculate budget progress
  const calculateBudgetProgress = () => {
    if (project.status === "completed") return 100
    if (project.status === "planned" || project.status === "cancelled" || project.status === "submitted") return 0

    // Calculate based on budget utilization
    if (project.funds_spent && project.budget) {
      const budgetProgress = (project.funds_spent / project.budget) * 100
      return Math.min(budgetProgress, 100)
    }

    return 0
  }

  const getMilestoneProgress = () => {
    if (project.milestones_count) {
      const percentage = (Number(project.milestones_completed_count || 0) / Number(project.milestones_count || 1)) * 100
      return percentage
    }
    if (project.status === "planned" || project.status === "cancelled" || project.status === "submitted") return 0

    const today = new Date()
    const startDate = new Date(project.start_date ?? "")
    const endDate = new Date(project.target_end_date ?? "")

    if (today < startDate) return 0
    if (today > endDate) return 100

    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsedDuration = today.getTime() - startDate.getTime()

    return Math.round((elapsedDuration / totalDuration) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "on_hold":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      case "submitted":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const budgetProgress = calculateBudgetProgress()
  const milestoneProgress = getMilestoneProgress()

  return (
    <div className="space-y-6 mt-1 mb-2">
      {/* Project Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("_", " ")}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {formatDate(project.start_date ?? "")} - {formatDate(project.target_end_date ?? "")}
            </div>
            {project.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {project.location}
              </div>
            )}
            <div className="flex items-center">
              <Briefcase className="mr-1 h-4 w-4" />
              {project.project_type.charAt(0).toUpperCase() + project.project_type.slice(1)}
            </div>
            {project.category && (
              <div className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                {project.category_details?.name}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Show approval buttons for admins when project is submitted */}
          {project.status === "submitted" && is_DB_admin && (
            <>
              <Button onClick={() => handleApprove(project.id)} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button onClick={() => handleReject(project.id)} className="bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      {project && (isManager || is_DB_admin) && (
        <EditProjectDialog
          project={project}
          open={editProjectOpen}
          onOpenChange={setEditProjectOpen}
          onSuccess={refreshProject}
        />
      )}

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
                    Budget Utilization
                  </span>
                  <span className="font-medium">{budgetProgress.toFixed(2)}%</span>
                </div>
                <Progress
                  value={budgetProgress}
                  className="h-2"
                  indicatorClassName={budgetProgress > 100 ? "bg-red-500" : "bg-blue-500"}
                />
                <p className="text-sm text-gray-500">
                  {project.status === "completed"
                    ? "Budget fully utilized"
                    : project.status === "planned" || project.status === "submitted"
                      ? "No funds spent yet"
                      : `${formatCurrency(project.funds_spent)} spent of ${formatCurrency(project.budget)} budget`}
                </p>
              </div>

              {/* Milestone Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Target className="h-4 w-4 mr-1 text-green-500" />
                    Milestone Completion
                  </span>
                  <span className="font-medium">{Number(milestoneProgress).toFixed(2)}%</span>
                </div>
                <Progress value={Number(milestoneProgress)} className="h-2" indicatorClassName="bg-green-500" />
                <p className="text-sm text-gray-500">
                  {project.status === "completed"
                    ? "All milestones completed"
                    : project.status === "planned" || project.status === "submitted"
                      ? "Project not yet started"
                      : `${Number(milestoneProgress).toFixed(2)}% of milestones completed`}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Budget</div>
              <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
              <div className="flex justify-between text-sm">
                <span>Spent: {formatCurrency(project.funds_spent)}</span>
                <span className={project.funds_spent > project.budget ? "text-red-500" : "text-green-500"}>
                  {Math.round((project.funds_spent / project.budget) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Timeline</div>
              <div className="text-2xl font-bold">
                {project.status === "completed"
                  ? `${Math.round((new Date(project.actual_end_date || project.target_end_date).getTime() - new Date(project.start_date ?? "").getTime()) / (1000 * 60 * 60 * 24))} days`
                  : `${Math.round((new Date(project.target_end_date).getTime() - new Date(project.start_date ?? "").getTime()) / (1000 * 60 * 60 * 24))} days`}
              </div>
              <div className="text-sm">
                {project.status === "completed"
                  ? `Completed ${formatDate(project.actual_end_date || project.target_end_date)}`
                  : `Due ${formatDate(project.target_end_date)}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {project.status === "submitted" && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4 flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-purple-800">Project Proposal Submitted</h3>
            <div className="mt-1 text-sm text-purple-700">
              <p>
                This project proposal is awaiting administrative approval. Once approved, you'll be able to start
                planning and implementation.
              </p>
            </div>
            {is_DB_admin && (
              <div className="mt-4">
                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      handleApprove(project.id)
                    }}
                  >
                    Approve Proposal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleReject(project.id)
                    }}
                  >
                    Reject Proposal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview project={project} isManager={isManager} is_DB_admin={is_DB_admin} />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <ProjectTeam projectId={projectId} isManager={isManager} is_DB_admin={is_DB_admin} />
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <ProjectMilestones
            projectId={projectId}
            isManager={isManager}
            is_DB_admin={is_DB_admin}
            isTeamMember={isTeamMember}
          />
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <ProjectUpdates
            projectId={projectId}
            isManager={isManager}
            is_DB_admin={is_DB_admin}
            isTeamMember={isTeamMember}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ProjectExpenses
            projectId={projectId}
            projectCurrencyCode={project.?currency?.code || "USD"}
            isManager={isManager}
            is_DB_admin={is_DB_admin}
            isTeamMember={isTeamMember}
          />
        </TabsContent>
        {/* Commented out tabs
        <TabsContent value="assets" className="space-y-4">
          <ProjectAssets projectId={projectId} />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <ProjectComments projectId={projectId} />
        </TabsContent>

        */}
        <TabsContent value="documents" className="space-y-4">
          <ProjectDocuments projectId={projectId} canEdit={isManager || is_DB_admin|| isTeamMember} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
