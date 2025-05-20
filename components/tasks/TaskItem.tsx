"use client"

import { useState } from "react"
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
  useGetSubtasksQuery,
} from "@/redux/features/tasks/tasksAPISlice"
import type { Task } from "@/types/tasks"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash,
  Plus,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  BarChart2,
} from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Progress } from "@/components/ui/progress"
import EditTaskDialog from "./EditTaskDialog"
import AddSubtaskDialog from "./AddSubtaskDialog"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  onUpdate: () => void
  level?: number
}

export default function TaskItem({ task, onUpdate, level = 0 }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddSubtaskOpen, setIsAddSubtaskOpen] = useState(false)

  const { data: subtasks = [], isLoading: isLoadingSubtasks } = useGetSubtasksQuery(task.id, {
    skip: !task.has_subtasks || !isExpanded,
  })

  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [completeTask] = useCompleteTaskMutation()
  const { toast } = useToast()

  const handleStatusChange = async () => {
    if (task.status !== "completed") {
      try {
        await completeTask(task.id).unwrap()
        toast({
          title: "Task completed",
          description: `"${task.title}" has been marked as completed.`,
        })
        onUpdate()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to complete the task. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      try {
        await updateTask({
          id: task.id,
          data: { status: "todo" },
        }).unwrap()
        toast({
          title: "Task reopened",
          description: `"${task.title}" has been reopened.`,
        })
        onUpdate()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reopen the task. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTask(task.id).unwrap()
        toast({
          title: "Task deleted",
          description: `"${task.title}" has been deleted.`,
        })
        onUpdate()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the task. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditClose = () => {
    setIsEditOpen(false)
    onUpdate()
  }

  const handleAddSubtaskClose = () => {
    setIsAddSubtaskOpen(false)
    onUpdate()
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "review":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do"
      case "in_progress":
        return "In Progress"
      case "review":
        return "Under Review"
      case "completed":
        return "Completed"
      case "blocked":
        return "Blocked"
      default:
        return status
    }
  }

  const getBorderColor = (task: Task) => {
    if (task.status === "completed") return "border-l-green-500"
    if (task.status === "blocked") return "border-l-red-500"

    switch (task.priority) {
      case "urgent":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, "MMM d, yyyy") : null
    } catch (error) {
      return null
    }
  }

  // Safely access assigned_to as an array
  const assignedUsers = Array.isArray(task.assigned_to) ? task.assigned_to : []

  return (
    <>
      <Card
        className={cn(
          "border-l-4 mb-2",
          getBorderColor(task),
          task.status === "completed" && "bg-gray-50",
          level > 0 && `ml-${level * 4}`,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-1">
              <Checkbox checked={task.status === "completed"} onCheckedChange={handleStatusChange} />
            </div>

            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className={cn("text-lg font-medium", task.status === "completed" && "line-through text-gray-500")}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className={cn("text-sm text-gray-600 mt-1", task.status === "completed" && "text-gray-400")}>
                      {task.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className={getStatusColor(task.status)}>{getStatusText(task.status)}</Badge>

                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>

                    {task.milestone && (
                      <Badge variant="outline" className="border-purple-200 text-purple-800">
                        {typeof task.milestone === "object" ? task.milestone.title : `Milestone #${task.milestone}`}
                      </Badge>
                    )}

                    {task.is_overdue && (
                      <Badge variant="outline" className="border-red-200 text-red-800">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Overdue
                      </Badge>
                    )}

                    {task.is_unblocked === false && (
                      <Badge variant="outline" className="border-red-200 text-red-800">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                {task.due_date && (
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Due: {formatDate(task.due_date)}</span>
                  </div>
                )}

                {task.estimated_hours && (
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Est: {task.estimated_hours}h</span>
                    {task.actual_hours && <span className="ml-1">(Actual: {task.actual_hours}h)</span>}
                  </div>
                )}

                {task.has_subtasks && typeof task.completion_percentage === "number" && (
                  <div className="flex items-center">
                    <BarChart2 className="mr-1 h-3 w-3" />
                    <span>Progress: {task.completion_percentage}%</span>
                  </div>
                )}
              </div>

              {task.has_subtasks &&
                typeof task.completion_percentage === "number" &&
                task.completion_percentage > 0 && <Progress value={task.completion_percentage} className="h-1 mt-2" />}

              {assignedUsers?.length > 0 && (
                <div className="mt-3 flex items-center">
                  <Users className="h-3 w-3 mr-2 text-gray-500" />
                  <AvatarGroup>
                    {assignedUsers?.map((user) => (
                      <Avatar key={typeof user === "object" ? user.id : user} className="h-6 w-6">
                        <AvatarFallback>
                          {typeof user === "object" ? user.first_name?.[0] || user.email?.[0] || "?" : "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-2 bg-gray-50 flex justify-between">
          <div className="flex items-center gap-2">
            {task.has_subtasks && (
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={toggleExpand}>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsAddSubtaskOpen(true)}>
              <Plus size={16} className="mr-1" /> Add Subtask
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <Edit size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash size={16} />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isExpanded && task.has_subtasks && Array.isArray(subtasks) && (
        <div className={`pl-4 space-y-2 mb-4`}>
          {subtasks?.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} onUpdate={onUpdate} level={level + 1} />
          ))}
        </div>
      )}

      <EditTaskDialog isOpen={isEditOpen} onClose={handleEditClose} task={task} />

      <AddSubtaskDialog isOpen={isAddSubtaskOpen} onClose={handleAddSubtaskClose} parentId={task.id} />
    </>
  )
}
