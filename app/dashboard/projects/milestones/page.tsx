"use client"

import { useState } from "react"
import { Search, Plus, Calendar, CheckCircle, AlertCircle, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface Milestone {
  id: string
  title: string
  description: string
  status: "Upcoming" | "In Progress" | "Completed" | "Delayed"
  dueDate: string
  project: string
  progress: number
  tasks: {
    total: number
    completed: number
  }
}

export default function MilestonesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Sample milestones data
  const milestones: Milestone[] = [
    {
      id: "milestone-1",
      title: "Workshop Preparation Phase",
      description: "Complete all preparation tasks for the digital skills workshop",
      status: "In Progress",
      dueDate: "2025-06-01",
      project: "Digital Skills Workshop",
      progress: 65,
      tasks: {
        total: 12,
        completed: 8,
      },
    },
    {
      id: "milestone-2",
      title: "Initial Health Screenings",
      description: "Complete first round of community health screenings",
      status: "Completed",
      dueDate: "2025-05-15",
      project: "Community Health Outreach",
      progress: 100,
      tasks: {
        total: 8,
        completed: 8,
      },
    },
    {
      id: "milestone-3",
      title: "Entrepreneur Selection",
      description: "Select first cohort of women entrepreneurs for the program",
      status: "Upcoming",
      dueDate: "2025-06-10",
      project: "Women Entrepreneurship Program",
      progress: 0,
      tasks: {
        total: 5,
        completed: 0,
      },
    },
    {
      id: "milestone-4",
      title: "Workshop Execution",
      description: "Conduct the digital skills training workshops",
      status: "Upcoming",
      dueDate: "2025-06-15",
      project: "Digital Skills Workshop",
      progress: 0,
      tasks: {
        total: 10,
        completed: 0,
      },
    },
    {
      id: "milestone-5",
      title: "Health Education Sessions",
      description: "Deliver health education sessions to community members",
      status: "Delayed",
      dueDate: "2025-05-20",
      project: "Community Health Outreach",
      progress: 30,
      tasks: {
        total: 10,
        completed: 3,
      },
    },
  ]

  // Filter milestones based on search query and active tab
  const filteredMilestones = milestones.filter((milestone) => {
    const matchesSearch =
      milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.project.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "upcoming") return matchesSearch && milestone.status === "Upcoming"
    if (activeTab === "in-progress") return matchesSearch && milestone.status === "In Progress"
    if (activeTab === "completed") return matchesSearch && milestone.status === "Completed"
    if (activeTab === "delayed") return matchesSearch && milestone.status === "Delayed"

    return matchesSearch
  })

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-200 text-blue-800"
      case "In Progress":
        return "bg-blue-500 text-white"
      case "Completed":
        return "bg-green-500 text-white"
      case "Delayed":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    if (progress >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestone Tracking</h1>
          <p className="text-gray-600">Track key milestones across all projects</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> New Milestone
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search milestones..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredMilestones.length > 0 ? (
          filteredMilestones.map((milestone) => (
            <Card key={milestone.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                  <Badge className={`mt-2 md:mt-0 ${getStatusColor(milestone.status)}`}>{milestone.status}</Badge>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className={getProgressColor(milestone.progress)} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{milestone.project}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>
                      {milestone.tasks.completed} of {milestone.tasks.total} tasks completed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No milestones found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  )
}
