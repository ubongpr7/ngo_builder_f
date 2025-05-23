"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText } from "lucide-react"
import { useGetAllProjectsQuery } from "@/redux/features/projects/projectsAPISlice"
import { ProjectCard } from "@/components/projects/project-card"
import { AddProjectDialog } from "@/components/projects/add-project-dialog"
import type { Project } from "@/types/project"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectManagement() {
  const { data: projects = [], isLoading, isError, refetch } = useGetAllProjectsQuery("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  useEffect(() => {
    if (!projects) return

    const filtered = projects.filter((project: Project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        false

      if (activeTab === "all") return matchesSearch

      // Map API status values to UI tabs
      const statusMap: Record<string, string> = {
        active: "active",
        planning: "upcoming",
        submitted: "waiting_for_approval",
        on_hold: "upcoming",
        completed: "completed",
        cancelled: "completed",
      }

      return matchesSearch && statusMap[project.status.toLowerCase()] === activeTab.toLowerCase()
    })

    setFilteredProjects(filtered)
  }, [projects, searchTerm, activeTab])

  // Refetch data when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Management</h1>
          <p className="text-gray-500">Manage and track organizational projects</p>
        </div>
        {is_DB_admin && (
          <div className="mt-4 md:mt-0">
            <AddProjectDialog />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" disabled={isLoading}>
              All
            </TabsTrigger>
            <TabsTrigger value="active" disabled={isLoading}>
              Active
            </TabsTrigger>
            <TabsTrigger value="upcoming" disabled={isLoading}>
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="waiting_for_approval" disabled={isLoading}>
              Waiting for Approval
            </TabsTrigger>
            <TabsTrigger value="completed" disabled={isLoading}>
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" disabled={isLoading}>
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mt-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100">
            <FileText className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error loading projects</h3>
          <p className="mt-2 text-gray-500">There was an error loading the projects. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredProjects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No projects found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
