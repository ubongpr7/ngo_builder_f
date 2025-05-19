"use client"

import { Calendar, MapPin, Users, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types/project"

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-600 text-white"
    case "planning":
      return "bg-blue-600 text-white"
    case "on_hold":
      return "bg-amber-600 text-white"
    case "completed":
      return "bg-gray-600 text-white"
    case "cancelled":
      return "bg-red-600 text-white"
    default:
      return "bg-gray-600 text-white"
  }
}

// Helper function to calculate progress
const calculateProgress = (project: Project) => {
  if (project.status === "completed") return 100
  if (project.status === "planned" || project.status === "cancelled") return 0

  if (project.budget_utilization) return Math.min(project.budget_utilization, 100)

  const today = new Date()
  const startDate = project.start_date ? new Date(project.start_date) : new Date()
  const endDate = new Date(project.target_end_date || Date.now())

  if (today < startDate) return 0
  if (today > endDate) return 100

  const totalDuration = endDate.getTime() - startDate.getTime()
  const elapsedDuration = today.getTime() - startDate.getTime()

  return Math.round((elapsedDuration / totalDuration) * 100)
}

export function ProjectCard({ project }: { project: Project }) {
  const progress = calculateProgress(project)

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={project.image_url || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(project.title)}`}
          alt={project.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className={getStatusColor(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("_", " ")}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>
          {project.description?.length > 120 ? `${project?.description.substring(0, 120)}...` : project.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="mr-2 h-4 w-4" />
            {project.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(project.start_date).toLocaleDateString()} -{" "}
            {new Date(project.target_end_date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="mr-2 h-4 w-4" />
            {project.team_members?.length || 0} team members
          </div>

          {project.status !== "planning" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
        </Button>
        <Button variant="ghost" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Report
        </Button>
      </CardFooter>
    </Card>
  )
}
