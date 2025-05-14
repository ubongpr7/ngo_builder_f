"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, FileText, Briefcase, AlertTriangle, MessageSquare, Loader2, Edit } from "lucide-react"

import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectTeam } from "@/components/projects/teams/project-team"
import { ProjectMilestones } from "@/components/projects/milestones/project-milestones"
import { ProjectUpdates } from "@/components/projects/updates/project-updates"
import { ProjectExpenses } from "@/components/projects/expenses/project-expenses"

import { useGetProjectByIdQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "@/components/permissionHander"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"

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

  // State for edit project dialog
  const [editProjectOpen, setEditProjectOpen] = useState(false)

  // Function to refresh project data
  const refreshProject = () => {
    refetch()
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

  // Calculate project progress
  const calculateProgress = () => {
    if (project.status === "completed") return 100
    if (project.status === "planned" || project.status === "cancelled") return 0

    // Calculate based on budget utilization if available
    if (project.funds_spent && project.budget) {
      const budgetProgress = (project.funds_spent / project.budget) * 100
      return Math.min(budgetProgress, 100)
    }

    // Calculate based on timeline
    const today = new Date()
    const startDate = new Date(project.start_date ?? "")
    const endDate = new Date(project.target_end_date ?? "")

    if (today < startDate) return 0
    if (today > endDate) return 100

    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsedDuration = today.getTime() - startDate.getTime()

    return Math.round((elapsedDuration / totalDuration) * 100)
  }

  // Get status badge color
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

  const progress = calculateProgress()

  return (
    <div className="space-y-6">
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

          {/* Edit Project Button - Only show for managers and admins */}
            

          {/* Edit Project Dialog */}
          {(project &&(userRoles &&(userRoles.user_id === project.manager_details?.id || userRoles.is_DB_admin))) && (
            <EditProjectDialog
              project={project}
              open={editProjectOpen}
              onOpenChange={setEditProjectOpen}
              onSuccess={refreshProject}
            />
          )}
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500">
                {project.status === "completed"
                  ? "Project completed"
                  : project.status === "planned"
                    ? "Project in planning phase"
                    : `${progress}% complete based on timeline and budget`}
              </p>
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

      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
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
            isManager={isManager}
            is_DB_admin={is_DB_admin}
            isTeamMember={isTeamMember}
          />
        </TabsContent>
        {/*}
        <TabsContent value="assets" className="space-y-4">
          <ProjectAssets projectId={projectId} />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <ProjectComments projectId={projectId} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ProjectDocuments projectId={projectId} />
        </TabsContent>
        */}
      </Tabs>
    </div>
  )
}
