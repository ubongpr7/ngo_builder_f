"use client"

import { useState } from "react"
import { useGetUserProjectsQuery } from "@/redux/features/projects/userProjectsApiSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function UserProjects() {
  const [activeTab, setActiveTab] = useState("all")
  const { data: projects, isLoading, error } = useGetUserProjectsQuery("")

  // Group projects by role
  const projectsByRole = {
    all: projects || [],
    manager: projects?.filter((p) => p.user_role === "manager") || [],
    official: projects?.filter((p) => p.user_role === "official") || [],
    creator: projects?.filter((p) => p.user_role === "creator") || [],
    team_member: projects?.filter((p) => p.user_role === "team_member") || [],
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "official":
        return "bg-purple-100 text-purple-800"
      case "creator":
        return "bg-green-100 text-green-800"
      case "team_member":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading projects</div>
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Projects ({projectsByRole.all.length})</TabsTrigger>
          <TabsTrigger value="manager">As Manager ({projectsByRole.manager.length})</TabsTrigger>
          <TabsTrigger value="official">As Official ({projectsByRole.official.length})</TabsTrigger>
          <TabsTrigger value="creator">Created ({projectsByRole.creator.length})</TabsTrigger>
          <TabsTrigger value="team_member">Team Member ({projectsByRole.team_member.length})</TabsTrigger>
        </TabsList>

        {Object.entries(projectsByRole).map(([role, roleProjects]) => (
          <TabsContent key={role} value={role} className="space-y-4">
            {roleProjects.length > 0 ? (
              roleProjects.map((project) => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge className={getRoleBadgeColor(project.user_role)}>
                          {project.user_role.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{project.description}</p>
                      <div className="flex justify-between text-sm">
                        <span>
                          Status: <span className="font-medium">{project.status.replace("_", " ")}</span>
                        </span>
                        <span>
                          Budget: <span className="font-medium">{formatCurrency(project.budget)}</span>
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${project.completion_percentage}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No projects found in this category</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
