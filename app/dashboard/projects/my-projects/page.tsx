"use client"

import { useState } from "react"
import { useGetUserProjectsQuery } from "@/redux/features/projects/userProjectsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { FileText, Users, Crown, Star, User } from "lucide-react"

export default function UserProjects() {
  const { data: projects, isLoading, error } = useGetUserProjectsQuery()
  const [activeTab, setActiveTab] = useState("all")

  // Group projects by role
  const projectsByRole = {
    all: projects || [],
    manager: projects?.filter((p) => p.user_role === "manager") || [],
    official: projects?.filter((p) => p.user_role === "official") || [],
    creator: projects?.filter((p) => p.user_role === "creator") || [],
    team_member: projects?.filter((p) => p.user_role === "team_member") || [],
  }

  // Get role icon and color
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "manager":
        return (
          <Badge className="bg-blue-50">
            <Crown className="h-3 w-3 mr-1" /> 
          </Badge>
        )
      case "official":
        return (
          <Badge className="bg-purple-50">
            <Star className="h-3 w-3 mr-1" /> 
          </Badge>
        )
      case "creator":
        return (
          <Badge className="bg-green-50">
            <FileText className="h-3 w-3 mr-1" /> 
          </Badge>
        )
      case "team_member":
        return (
          <Badge className="bg-amber-50">
            <Users className="h-3 w-3 mr-1" /> 
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-50">
            <User className="h-3 w-3 mr-1" /> 
          </Badge>
        )
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planned":
        return <Badge className="bg-gray-800 text-gray-50">Planned</Badge>
      case "in_progress":
        return <Badge className="bg-blue-800 text-gray-50">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-800 text-gray-50">Completed</Badge>
      case "on_hold":
        return <Badge className="bg-amber-800 text-gray-50">On Hold</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 text-gray-50">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-800 text-gray-50">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Projects</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Projects</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading projects. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Projects ({projectsByRole.all.length})</TabsTrigger>
          {projectsByRole.manager.length > 0 && (
            <TabsTrigger value="manager">Managing ({projectsByRole.manager.length})</TabsTrigger>
          )}
          {projectsByRole.official.length > 0 && (
            <TabsTrigger value="official">Official ({projectsByRole.official.length})</TabsTrigger>
          )}
          {projectsByRole.creator.length > 0 && (
            <TabsTrigger value="creator">Created ({projectsByRole.creator.length})</TabsTrigger>
          )}
          {projectsByRole.team_member.length > 0 && (
            <TabsTrigger value="team_member">Team Member ({projectsByRole.team_member.length})</TabsTrigger>
          )}
        </TabsList>

        {Object.entries(projectsByRole).map(([role, roleProjects]) => (
          <TabsContent key={role} value={role} className="mt-6">
            {roleProjects.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">No projects found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roleProjects.map((project) => (
                  <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          {getRoleBadge(project.user_role)}
                        </div>
                        <CardDescription>
                          {getStatusBadge(project.status)}
                          <span className="ml-2">Budget: {formatCurrency(project.budget)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-2">{project.description}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-4">
                          <span>Completion: {project.completion_percentage}%</span>
                          <span>
                            {project.days_remaining > 0 ? `${project.days_remaining} days remaining` : "Due today"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
