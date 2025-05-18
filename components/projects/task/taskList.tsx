"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Calendar,
  Tag,
} from "lucide-react"
import {
  useGetTasksByMilestoneQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/redux/features/projects/taskAPISlice"
import { AssignUsersDialog } from "./assign-users-dialog"
import { TaskFilterBar } from "./task-filter-bar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { AddEditTaskDialog } from "./add-edit-task-dialog"

interface TaskListProps {
  milestoneId: number
  projectId: number
  isManager?: boolean
  is_DB_admin?: boolean
  isTeamMember?: boolean
}

export function TaskList({ milestoneId, projectId, isManager, is_DB_admin, isTeamMember }: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filterParams, setFilterParams] = useState({
    projectId,
    milestoneId,
  })

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useGetTasksByMilestoneQuery(
    { milestoneId, filterParams },
    { refetchOnMountOrArgChange: true }
  )
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    return task.status === activeTab
  })

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800 border-gray-300"
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-300"
      case "review": return "bg-purple-100 text-purple-800 border-purple-300"
      case "completed": return "bg-green-100 text-green-800 border-green-300"
      case "blocked": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800 border-green-300"
      case "medium": return "bg-blue-100 text-blue-800 border-blue-300"
      case "high": return "bg-orange-100 text-orange-800 border-orange-300"
      case "urgent": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Handle task status change
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask({ id: taskId, status: newStatus }).unwrap()
      refetch()
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap()
        refetch()
      } catch (error) {
        console.error("Failed to delete task:", error)
      }
    }
  }

  // Format due date
  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return "No due date"
    const date = new Date(dueDate)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  // Check if task is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === "completed") return false
    return new Date(dueDate) < new Date()
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full flex justify-between p-2 h-auto">
          <span className="font-medium">Tasks ({tasks.length})</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
                <TabsTrigger value="todo">To Do ({tasks.filter(t => t.status === "todo").length})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({tasks.filter(t => t.status === "in_progress").length})</TabsTrigger>
                <TabsTrigger value="review">Review ({tasks.filter(t => t.status === "review").length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({tasks.filter(t => t.status === "completed").length})</TabsTrigger>
                <TabsTrigger value="blocked">Blocked ({tasks.filter(t => t.status === "blocked").length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex justify-between items-center">
            <TaskFilterBar onFilterChange={setFilterParams} currentFilters={filterParams} />

            {(isManager || is_DB_admin || isTeamMember) && (
              <AddEditTaskDialog
                milestoneId={milestoneId}
                onSuccess={refetch}
                trigger={
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                }
              />
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Tasks Found</h3>
                <p className="text-gray-500 text-center mb-4">
                  {activeTab !== "all"
                    ? `No ${activeTab.replace("_", " ")} tasks found for this milestone.`
                    : "No tasks have been created for this milestone yet."}
                </p>
                {(isManager || is_DB_admin || isTeamMember) && (
                  <AddEditTaskDialog
                    milestoneId={milestoneId}
                    onSuccess={refetch}
                    trigger={
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Task
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTasks?.map((task) => (
                <Card key={task.id} className={`border ${task.status === "completed" ? "bg-gray-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="pt-0.5">
                          {task.status === "completed" ? (
                            <CheckSquare
                              className="h-5 w-5 text-green-500 cursor-pointer"
                              onClick={() => handleStatusChange(task.id, "todo")}
                            />
                          ) : (
                            <Square
                              className="h-5 w-5 text-gray-400 cursor-pointer"
                              onClick={() => handleStatusChange(task.id, "completed")}
                            />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center">
                            <h4 className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </h4>
                          </div>

                          {task.description && <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>}

                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getStatusBadgeColor(task.status)}>
                              {task.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>

                            {task.priority && (
                              <Badge className={getPriorityBadgeColor(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            )}

                            {task.task_type && (
                              <Badge variant="outline" className="bg-gray-50">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.task_type.charAt(0).toUpperCase() + task.task_type.slice(1)}
                              </Badge>
                            )}

                            {task.due_date && (
                              <Badge
                                variant="outline"
                                className={`bg-gray-50 ${isOverdue(task.due_date, task.status) ? "text-red-600 border-red-300" : ""}`}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDueDate(task.due_date)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {task.assigned_to?.length > 0 && (
                          <TooltipProvider>
                            <div className="flex -space-x-2">
                              {task.assigned_to.slice(0, 3).map((user) => (
                                <Tooltip key={user.id}>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-7 w-7 border-2 border-white">
                                      <AvatarImage src={user.profile_image || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">
                                        {`${user.first_name?.[0]}${user.last_name?.[0]}`}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {user.first_name} {user.last_name}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {task.assigned_to.length > 3 && (
                                <Avatar className="h-7 w-7 border-2 border-white bg-gray-200">
                                  <AvatarFallback className="text-xs">+{task.assigned_to.length - 3}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </TooltipProvider>
                        )}

                        {(isManager || is_DB_admin || isTeamMember) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AssignUsersDialog
                                task={task}
                                projectId={projectId}
                                onUsersAssigned={refetch}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Users className="mr-2 h-4 w-4" />
                                    Assign Users
                                  </DropdownMenuItem>
                                }
                              />

                              <DropdownMenuSeparator />

                              <AddEditTaskDialog
                                milestoneId={milestoneId}
                                task={task}
                                onSuccess={refetch}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Task
                                  </DropdownMenuItem>
                                }
                              />

                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {task.completion_percentage > 0 && task.status !== "completed" && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{task.completion_percentage}%</span>
                        </div>
                        <Progress value={task.completion_percentage} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}