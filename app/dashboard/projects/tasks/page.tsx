"use client"

import { useState } from "react"
import { Search, Plus, Calendar, AlertCircle, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface Task {
  id: string
  title: string
  description: string
  status: "Not Started" | "In Progress" | "Completed" | "Blocked"
  dueDate: string
  project: string
  assignedTo: string[]
  priority: "Low" | "Medium" | "High" | "Urgent"
}

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Sample tasks data
  const tasks: Task[] = [
    {
      id: "task-1",
      title: "Create workshop curriculum",
      description: "Develop comprehensive curriculum for web development training",
      status: "In Progress",
      dueDate: "2025-05-15",
      project: "Digital Skills Workshop",
      assignedTo: ["Prosper Ubong", "Jane Smith"],
      priority: "High",
    },
    {
      id: "task-2",
      title: "Secure venue for health checkups",
      description: "Find and book appropriate venue for community health screenings",
      status: "Completed",
      dueDate: "2025-05-10",
      project: "Community Health Outreach",
      assignedTo: ["Dr. Adeola Johnson"],
      priority: "Medium",
    },
    {
      id: "task-3",
      title: "Finalize microloan application process",
      description: "Complete documentation and approval workflow for microloan applications",
      status: "Not Started",
      dueDate: "2025-05-20",
      project: "Women Entrepreneurship Program",
      assignedTo: ["Sarah Kimani", "Prosper Ubong"],
      priority: "High",
    },
    {
      id: "task-4",
      title: "Recruit volunteer trainers",
      description: "Find qualified trainers for digital skills workshops",
      status: "Blocked",
      dueDate: "2025-05-12",
      project: "Digital Skills Workshop",
      assignedTo: ["Jane Smith"],
      priority: "Urgent",
    },
    {
      id: "task-5",
      title: "Order medical supplies",
      description: "Purchase necessary medical supplies for health checkups",
      status: "In Progress",
      dueDate: "2025-05-18",
      project: "Community Health Outreach",
      assignedTo: ["Dr. Adeola Johnson", "Michael Okafor"],
      priority: "High",
    },
  ]

  // Filter tasks based on search query and active tab
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "not-started") return matchesSearch && task.status === "Not Started"
    if (activeTab === "in-progress") return matchesSearch && task.status === "In Progress"
    if (activeTab === "completed") return matchesSearch && task.status === "Completed"
    if (activeTab === "blocked") return matchesSearch && task.status === "Blocked"

    return matchesSearch
  })

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-200 text-gray-800"
      case "In Progress":
        return "bg-blue-500 text-white"
      case "Completed":
        return "bg-green-500 text-white"
      case "Blocked":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-gray-200 text-gray-800"
      case "Medium":
        return "bg-yellow-500 text-white"
      case "High":
        return "bg-orange-500 text-white"
      case "Urgent":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Manage and track tasks across all projects</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTasks?.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{task.description}</p>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{task.project}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{task.assignedTo.join(", ")}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  )
}
