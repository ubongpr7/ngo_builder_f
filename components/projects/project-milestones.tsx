"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, Clock, AlertTriangle, Loader2, Flag } from "lucide-react"

// Mock data for now - will be replaced with actual API call
const mockMilestones = [
  {
    id: 1,
    title: "Project Planning",
    description: "Complete project planning including scope definition, resource allocation, and timeline.",
    due_date: "2023-06-01",
    completion_date: "2023-05-28",
    status: "completed",
    notes: "Completed ahead of schedule with full team participation.",
  },
  {
    id: 2,
    title: "Initial Implementation",
    description: "Begin implementation of core project components.",
    due_date: "2023-07-15",
    status: "in_progress",
    notes: "Making good progress, but facing some technical challenges.",
  },
  {
    id: 3,
    title: "Mid-project Review",
    description: "Conduct comprehensive review of project progress and adjust plans as needed.",
    due_date: "2023-08-01",
    status: "pending",
  },
  {
    id: 4,
    title: "Final Implementation",
    description: "Complete all implementation tasks and prepare for testing.",
    due_date: "2023-09-15",
    status: "pending",
  },
  {
    id: 5,
    title: "Testing and Quality Assurance",
    description: "Conduct thorough testing and address any issues.",
    due_date: "2023-05-01",
    status: "delayed",
    notes: "Delayed due to resource constraints. Working on getting back on track.",
  },
]

interface ProjectMilestonesProps {
  projectId: number
}

export function ProjectMilestones({ projectId }: ProjectMilestonesProps) {
  // In a real implementation, this would use your API
  // const { data: milestones = [], isLoading } = useGetProjectMilestonesQuery(projectId)
  const milestones = mockMilestones
  const isLoading = false

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

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
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Flag className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search milestones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredMilestones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Milestones Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No milestones match your search criteria. Try a different search term."
                : "No milestones have been created for this project yet."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Flag className="mr-2 h-4 w-4" />
              Add First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMilestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{milestone.title}</CardTitle>
                    <CardDescription>Due: {new Date(milestone.due_date).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(milestone.status)}>{formatStatus(milestone.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{milestone.description}</p>

                <div className="flex justify-between items-center text-sm mb-2">
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

                {milestone.status === "in_progress" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>50%</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                )}

                {milestone.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{milestone.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {milestone.status !== "completed" && (
                  <Button variant="outline" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
