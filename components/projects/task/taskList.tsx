"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  CheckSquare,
  Square,
  Calendar,
  Tag,
  ChevronRight,
} from "lucide-react"
import {
  useGetTasksByMilestoneQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/redux/features/projects/taskAPISlice"
import { AssignUsersDialog } from "./assign-users-dialog"
import { TaskFilterBar } from "./task-filter-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { AddEditTaskDialog } from "./add-edit-task-dialog"

interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority?: string
  task_type?: string
  due_date?: string
  completion_percentage: number
  assigned_to?: Array<{
    id: number
    first_name: string
    last_name: string
    profile_image?: string
  }>
  parent_id?: number | null
  children?: Task[]
  level?: number
}

interface TaskListProps {
  milestoneId: number
  projectId: number
  isManager?: boolean
  is_DB_admin?: boolean
  isTeamMember?: boolean
}

export function TaskList({ milestoneId, projectId, isManager, is_DB_admin, isTeamMember }: TaskListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [filterParams, setFilterParams] = useState({
    projectId,
    milestoneId,
  })
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [hierarchicalTasks, setHierarchicalTasks] = useState<Task[]>([])

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useGetTasksByMilestoneQuery({ milestoneId, filterParams }, { refetchOnMountOrArgChange: true })

  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()

  // Build hierarchical task structure
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const taskMap = new Map<number, Task>()
      const rootTasks: Task[] = []

      // First pass: create a map of all tasks
      tasks.forEach((task: Task) => {
        taskMap.set(task.id, { ...task, children: [], level: 0 })
      })

      // Second pass: build the hierarchy
      tasks.forEach((task: Task) => {
        const taskWithChildren = taskMap.get(task.id)
        if (task.parent_id && taskMap.has(task.parent_id)) {
          // This is a child task
          const parent = taskMap.get(task.parent_id)
          if (parent && parent.children) {
            taskWithChildren!.level = (parent.level || 0) + 1
            parent.children.push(taskWithChildren!)
          }
        } else {
          // This is a root task
          rootTasks.push(taskWithChildren!)
        }
      })

      setHierarchicalTasks(rootTasks)

      // Initialize expanded state for all parent tasks
      const newExpandedState: Record<number, boolean> = {}
      tasks.forEach((task: Task) => {
        if (taskMap.get(task.id)?.children?.length) {
          newExpandedState[task.id] = true // Default to expanded
        }
      })
      setExpandedTasks(newExpandedState)
    }
  }, [tasks])

  // Filter tasks based on active tab
  const filterTasksByStatus = (taskList: Task[]): Task[] => {
    if (activeTab === "all") return taskList

    return taskList.filter((task) => {
      // Check if this task matches the filter
      const taskMatches = task.status === activeTab

      // If task has children, recursively filter them
      if (task.children && task.children.length > 0) {
        task.children = filterTasksByStatus(task.children)
        // Include this task if it matches OR if any of its children match
        return taskMatches || task.children.length > 0
      }

      return taskMatches
    })
  }

  const filteredTasks = filterTasksByStatus([...hierarchicalTasks])

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "review":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "blocked":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
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

  // Recursive function to render tasks and their children
  const renderTask = (task: Task, level = 0) => {
    const hasChildren = task.children && task.children.length > 0
    const isExpanded = expandedTasks[task.id] || false

    return (
      <div key={task.id} className="task-item" style={{ marginLeft: `${level * 24}px` }}>
        <Card className={`border mb-2 ${task.status === "completed" ? "bg-gray-50" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {hasChildren && (
                  <button
                    onClick={() => toggleTaskExpansion(task.id)}
                    className="mt-1 p-0.5 rounded-sm hover:bg-gray-100"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
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
                      {task.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                      {task?.assigned_to.slice(0, 3)?.map((user) => (
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

                      <AddEditTaskDialog
                        milestoneId={milestoneId}
                        parentId={task.id}
                        onSuccess={refetch}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subtask
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

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="subtasks pl-4 border-l-2 border-gray-200 ml-4">
            {task.children!.map((childTask) => renderTask(childTask, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">Pending ({tasks.filter((t) => t.status === "todo").length})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-between items-center">
        <TaskFilterBar onFilterChange={setFilterParams} currentFilters={filterParams} />

        {(isManager || is_DB_admin || isTeamMember) && (
          <AddEditTaskDialog
            milestoneId={milestoneId}
            onSuccess={refetch}
            trigger={
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
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
        <div className="space-y-2">{filteredTasks.map((task) => renderTask(task))}</div>
      )}
    </div>
  )
}
