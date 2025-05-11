"use client"

import { useEffect, useState } from "react"
import { useGetAllTasksQuery } from "@/redux/features/tasks/tasksAPISlice"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useGetAllTasksQuery()
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (tasks) {
      if (activeTab === "all") {
        setFilteredTasks(tasks)
      } else {
        setFilteredTasks(tasks.filter((task) => task.status === activeTab))
      }
    }
  }, [tasks, activeTab])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading tasks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>There was an error loading tasks. Please try again later.</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "todo":
        return (
          <Badge variant="outline" className="bg-gray-100">
            To Do
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            In Progress
          </Badge>
        )
      case "review":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            Review
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Completed
          </Badge>
        )
      case "blocked":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Blocked
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
            High
          </Badge>
        )
      case "urgent":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Urgent
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-gray-500">Manage and track all tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTasks?.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-600"
                      readOnly
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-500">
                          <Link
                            href={`/dashboard/projects/${task.project?.id}`}
                            className="hover:underline text-green-600"
                          >
                            {task.project?.title}
                          </Link>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mt-2 line-clamp-2">{task.description}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-4">
                        {task.due_date && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            <span className={`${task.is_overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {task.assigned_to?.length > 0 && (
                          <div className="flex -space-x-2">
                            {task.assigned_to.slice(0, 3).map((user, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="text-xs">{user.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                            ))}
                            {task.assigned_to.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                                +{task.assigned_to.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Link href={`/dashboard/tasks/${task.id}`}>
                        <Button variant="link" size="sm" className="text-green-600 p-0">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === "all" ? "There are no tasks available." : `There are no tasks with status "${activeTab}".`}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
        </div>
      )}
    </div>
  )
}
