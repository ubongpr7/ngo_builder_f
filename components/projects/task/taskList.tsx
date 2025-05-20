"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Users,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  CheckSquare,
  Square,
  Calendar,
  Tag,
  ChevronRight,
  Loader2,
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

interface TaskUser {
  id: number
  first_name: string
  last_name: string
  profile_image?: string
}

interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority?: string
  task_type?: string
  due_date?: string
  completion_percentage: number
  assigned_to: TaskUser[]
  parent_id?: number | null
  parent_details?: {
    id: number
    title: string
    status: string
  } | null
  subtasks?: Task[]
  level?: number
  children?: Task[]
}

interface TaskListProps {
  milestoneId: number
  projectId: number
  isManager?: boolean
  is_DB_admin?: boolean
  isTeamMember?: boolean
}

// Dialog types for centralized dialog management
type DialogType = "assign" | "add" | "edit" | null

export function TaskList({ milestoneId, projectId, isManager, is_DB_admin, isTeamMember }: TaskListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [filterParams, setFilterParams] = useState({
    projectId,
    milestoneId,
  })
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [hierarchicalTasks, setHierarchicalTasks] = useState<Task[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Centralized dialog state management
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [parentTaskId, setParentTaskId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    data: tasks = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetTasksByMilestoneQuery({ milestoneId, filterParams }, { refetchOnMountOrArgChange: true })

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Function to open a specific dialog with task data
  const openDialog = (type: DialogType, task?: Task, parentId?: number) => {
    setDialogType(type)
    setSelectedTask(task || null)
    setParentTaskId(parentId || null)
    setDialogOpen(true)
  }

  // Function to close the dialog
  const closeDialog = () => {
    setDialogOpen(false)
    // Use a short timeout to ensure the dialog is fully closed before resetting state
    setTimeout(() => {
      setDialogType(null)
      setSelectedTask(null)
      setParentTaskId(null)
    }, 100)
  }

  // Handle dialog success
  const handleDialogSuccess = () => {
    closeDialog()
    refetch()
  }

  // Build hierarchical task structure
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      console.log("Raw tasks from API:", tasks)

      // Create a set to track which task IDs are subtasks
      const subtaskIds = new Set<number>()

      // First pass: identify all subtask IDs
      tasks.forEach((task: Task) => {
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach((subtask) => {
            subtaskIds.add(subtask.id)
          })
        }
      })

      // Get only root tasks (those that are not subtasks)
      const rootTasks = tasks.filter((task: Task) => !subtaskIds.has(task.id))
      console.log("Root tasks:", rootTasks)

      const processHierarchy = (taskList: Task[], level = 0): Task[] => {
        return (
          taskList?.map((task) => {
            // Create a new object with all properties from the original task
            const newTask = { ...task, level }

            // Process subtasks recursively if they exist
            if (task.subtasks && task.subtasks.length > 0) {
              newTask.subtasks = processHierarchy(task.subtasks, level + 1)
            } else {
              newTask.subtasks = []
            }

            return newTask
          }) || []
        )
      }

      // Process the hierarchy starting with root tasks
      const processedTasks = processHierarchy(rootTasks)
      console.log("Processed tasks:", processedTasks)

      // Sort tasks at each level by priority and due date
      const sortTasks = (taskList: Task[]) => {
        // Sort by priority (high to low) then by due date (earliest first)
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }

        return [...taskList].sort((a, b) => {
          // First sort by priority
          const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] || 999 : 999
          const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] || 999 : 999

          if (aPriority !== bPriority) return aPriority - bPriority

          // Then sort by due date
          if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          }

          // Tasks with due dates come before tasks without
          if (a.due_date) return -1
          if (b.due_date) return 1

          // Finally sort by title
          return a.title.localeCompare(b.title)
        })
      }

      // Sort root tasks and their subtasks recursively
      const sortHierarchy = (taskList: Task[]): Task[] => {
        // Sort this level
        const sortedTasks = sortTasks(taskList)

        // Sort each subtask list recursively
        return (
          sortedTasks?.map((task) => {
            if (task.subtasks && task.subtasks.length > 0) {
              const newTask = { ...task }
              newTask.subtasks = sortHierarchy(task.subtasks)
              return newTask
            }
            return task
          }) || []
        )
      }

      // Apply sorting to the hierarchy
      const sortedRootTasks = sortHierarchy(processedTasks)
      setHierarchicalTasks(sortedRootTasks)

      // Initialize expanded state for all parent tasks
      const newExpandedState: Record<number, boolean> = {}
      tasks.forEach((task: Task) => {
        if (task.subtasks && task.subtasks.length > 0) {
          newExpandedState[task.id] = expandedTasks[task.id] ?? true // Preserve existing state or default to expanded
        }
      })
      setExpandedTasks(newExpandedState)
    } else {
      setHierarchicalTasks([])
    }
  }, [tasks])

  // Filter tasks based on active tab
  const filterTasksByStatus = (taskList: Task[]): Task[] => {
    if (activeTab === "all") return taskList

    return taskList.filter((task) => {
      // Check if this task matches the filter
      const taskMatches = task.status === activeTab

      // If task has subtasks, recursively filter them
      if (task.subtasks && task.subtasks.length > 0) {
        const newTask = { ...task }
        newTask.subtasks = filterTasksByStatus([...task.subtasks])
        // Include this task if it matches OR if any of its subtasks match
        return taskMatches || newTask.subtasks.length > 0
      }

      return taskMatches
    })
  }

  const filteredTasks = filterTasksByStatus([...hierarchicalTasks])

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-300"

    switch (status.toLowerCase()) {
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
    if (!priority) return "bg-gray-100 text-gray-800 border-gray-300"

    switch (priority.toLowerCase()) {
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
  const handleStatusChange = async (taskId: number, newStatus: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    try {
      await updateTask({ id: taskId, status: newStatus }).unwrap()
      refetch()
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    if (window.confirm("Are you sure you want to delete this task? This will also delete all subtasks.")) {
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

  // Count total tasks and completed tasks
  const countTasks = (taskList: Task[]) => {
    let total = 0
    let completed = 0

    const countRecursive = (tasks: Task[]) => {
      tasks?.forEach((task) => {
        total++
        if (task.status === "completed") {
          completed++
        }
        if (task.subtasks && task.subtasks.length > 0) {
          countRecursive(task.subtasks)
        }
      })
    }

    countRecursive(taskList)
    return { total, completed }
  }

  const taskCounts = countTasks(hierarchicalTasks)

  // Recursive function to render tasks and their subtasks
  const renderTask = (task: Task, level = 0) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0
    const isExpanded = expandedTasks[task.id] || false
    const canEdit = isManager || is_DB_admin || isTeamMember

    // Calculate completion for this task and all subtasks
    const getTaskCompletion = (taskItem: Task): { total: number; completed: number } => {
      let total = 1
      let completed = taskItem.status === "completed" ? 1 : 0

      if (taskItem.subtasks && taskItem.subtasks.length > 0) {
        taskItem.subtasks?.forEach((child) => {
          const childCounts = getTaskCompletion(child)
          total += childCounts.total
          completed += childCounts.completed
        })
      }

      return { total, completed }
    }

    const taskCompletion = hasSubtasks ? getTaskCompletion(task) : null
    const completionPercentage = taskCompletion
      ? Math.round((taskCompletion.completed / taskCompletion.total) * 100)
      : task.completion_percentage

    return (
      <div key={task.id} className="task-item">
        <Card 
          className={`border mb-2 ${task.status === "completed" ? "bg-gray-50" : ""} hover:shadow-sm transition-shadow`}
          onClick={() => hasSubtasks && toggleTaskExpansion(task.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center">
                  {hasSubtasks ? (
                    <button
                      onClick={(e) => toggleTaskExpansion(task.id, e)}
                      className="p-1 rounded-sm hover:bg-gray-100 mr-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  ) : (
                    <div className="w-6\"></div> 
                  )}

                  <div className="pt-0.5">
                    {task.status === "completed" ? (
                      <CheckSquare
                        className="h-5 w-5 text-green-500 cursor-pointer"
                        onClick={(e) => handleStatusChange(task.id, "todo", e)}
                      />
                    ) : (
                      <Square
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={(e) => handleStatusChange(task.id, "completed", e)}
                      />
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 flex-1">
                  <div className="flex items-center">
                    <h4 
                      className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                      style={{ paddingLeft: `${level * 0}px` }} // Additional indentation based on level if needed
                    >
                      {task.title}
                    </h4>
                    
                    {hasSubtasks && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({taskCompletion?.completed}/{taskCompletion?.total})
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  )}

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
                      {task.assigned_to.slice(0, 3)?.map((user) => (
                        <Tooltip key={user.id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-7 w-7 border-2 border-white">
                              <AvatarImage 
                                src={user.profile_image || `/placeholder.svg?height=28&width=28&query=${encodeURIComponent(user.first_name)}`} 
                              />
                              <AvatarFallback className="text-xs">
                                {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
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

                {/* Action buttons with tooltips */}
                {canEdit && (
                  <div className="flex space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDialog("assign", task)
                            }}
                          >
                            <Users className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Assign Users</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDialog("add", null, task.id)
                            }}
                          >
                            <Plus className="h-4 w-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Add Subtask</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDialog("edit", task)
                            }}
                          >
                            <Edit className="h-4 w-4 text-amber-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Edit Task</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={(e) => handleDeleteTask(task.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete Task</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>

            {completionPercentage > 0 && task.status !== "completed" && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-1" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render subtasks if expanded */}
        {hasSubtasks && isExpanded && (
          <div className="subtasks ml-6 pl-4 border-l-2 border-gray-200">
            {task.subtasks?.map((subtask) => renderTask(subtask, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Don't render complex UI during server-side rendering or before hydration
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading tasks...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Centralized dialogs */}
      {dialogType === "assign" && selectedTask && (
        <AssignUsersDialog
          open={dialogOpen}
          onClose={closeDialog}
          taskId={selectedTask.id}
          projectId={projectId}
          currentAssignees={selectedTask.assigned_to?.map((user) => user.id) || []}
          onUsersAssigned={handleDialogSuccess}
        />
      )}

      {dialogType === "add" && (
        <AddEditTaskDialog
          open={dialogOpen}
          onClose={closeDialog}
          milestoneId={milestoneId}
          parentId={parentTaskId}
          onSuccess={handleDialogSuccess}
        />
      )}

      {dialogType === "edit" && selectedTask && (
        <AddEditTaskDialog
          open={dialogOpen}
          onClose={closeDialog}
          milestoneId={milestoneId}
          task={selectedTask}
          onSuccess={handleDialogSuccess}
        />
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Tasks ({taskCounts.total})</TabsTrigger>
          <TabsTrigger value="todo">Pending ({taskCounts.total - taskCounts.completed})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({taskCounts.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-between items-center">
        <TaskFilterBar onFilterChange={setFilterParams} currentFilters={filterParams} />

        {(isManager || is_DB_admin || isTeamMember) && (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => openDialog("add")}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add New Task
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
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
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openDialog("add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {isFetching && !isLoading && (
            <div className="flex items-center justify-center py-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Refreshing tasks...
            </div>
          )}
          {filteredTasks?.map((task) => renderTask(task))}
        </div>
      )}
    </div>
  )
}
