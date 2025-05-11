"use client"

import { useEffect, useState } from "react"
import { useGetUserProjectsQuery } from "@/redux/features/projects/projectsAPISlice"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Filter } from "lucide-react"
import Link from "next/link"
import { useGetLoggedInUserQuery } from "@/redux/features/users/userApiSlice";

export default function MyProjectsPage() {
  const { data: userData, isLoading: isUserLoading } = useGetLoggedInUserQuery("")
  const { data: projects, isLoading, error } = useGetUserProjectsQuery()
  const [filteredProjects, setFilteredProjects] = useState([])

  useEffect(() => {
    if (projects) {
      setFilteredProjects(projects)
    }
  }, [projects])

  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading your projects...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">My Projects</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>There was an error loading your projects. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-gray-500">Projects assigned to you</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {(userData?.profile_data?.is_ceo ||
            userData?.profile_data?.is_DB_executive ||
            userData?.profile_data?.is_project_manager) && (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {filteredProjects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{project.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.status === "completed"
                        ? "Completed"
                        : project.status === "in_progress"
                          ? "In Progress"
                          : "Planned"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{project.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">Due: {new Date(project.due_date).toLocaleDateString()}</div>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="link" size="sm" className="text-green-600 p-0">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">You don't have any projects assigned to you yet.</p>
          <Button variant="outline">
            <Link href="/dashboard/projects">View All Projects</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
