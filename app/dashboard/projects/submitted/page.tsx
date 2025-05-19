"use client"

import { useState } from "react"
import { useGetProjectsQuery, useUpdateProjectMutation } from "@/redux/features/projects/projectsAPISlice"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "@/components/permissionHander"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Calendar, MapPin, DollarSign } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface AdminProjectProposalsProps {
  limit?: number
}

export default function AdminProjectProposals() {
  const { toast } = useToast()
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const isAdmin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const [processingIds, setProcessingIds] = useState<number[]>([])
  const { data: projects = [], isLoading, refetch } = useGetProjectsQuery({ status: "submitted", limit: 10 })
  const [updateProject] = useUpdateProjectMutation()

  if (!isAdmin) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading project proposals...</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No project proposals to review at this time.</p>
        </CardContent>
      </Card>
    )
  }

  const handleApprove = async (projectId: number) => {
    try {
      setProcessingIds((prev) => [...prev, projectId])
      await updateProject({ id: projectId, data:{status: "planning" }}).unwrap()
      toast({
        title: "Project approved",
        description: "The project proposal has been approved and is now in planning status.",
      })
      refetch()
    } catch (error) {
      console.error("Failed to approve project:", error)
      toast({
        title: "Error",
        description: "Failed to approve project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== projectId))
    }
  }

  const handleReject = async (projectId: number) => {
    try {
      setProcessingIds((prev) => [...prev, projectId])
      await updateProject({ id: projectId, data:{status: "cancelled"} }).unwrap()
      toast({
        title: "Project rejected",
        description: "The project proposal has been rejected.",
      })
      refetch()
    } catch (error) {
      console.error("Failed to reject project:", error)
      toast({
        title: "Error",
        description: "Failed to reject project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== projectId))
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Project Proposals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Submitted</Badge>
              </div>
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {format(parseISO(project.start_date), "MMM d, yyyy")} -{" "}
                    {format(parseISO(project.target_end_date), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(project.budget)}
                  </span>
                </div>
                <div className="text-gray-500">
                  <span className="font-medium">Proposed by:</span> {project.manager_details?.first_name}{" "}
                  {project.manager_details?.last_name}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex justify-between w-full gap-2">
                <Button
                  variant="outline"
                  className="w-1/2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleReject(project.id)}
                  disabled={processingIds.includes(project.id)}
                >
                  {processingIds.includes(project.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </>
                  )}
                </Button>
                <Button
                  className="w-1/2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(project.id)}
                  disabled={processingIds.includes(project.id)}
                >
                  {processingIds.includes(project.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" /> Approve
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
