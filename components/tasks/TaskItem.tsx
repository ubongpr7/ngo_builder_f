"use client"

import { useState } from "react"
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
  useGetSubtasksQuery,
  type Task,
} from "@/redux/features/tasks/tasksAPISlice"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, Edit, Trash, Plus } from "lucide-react"
import EditTaskDialog from "./EditTaskDialog"
import AddSubtaskDialog from "./AddSubtaskDialog"
import { format } from "date-fns"

interface TaskItemProps {
  task: Task
  onUpdate: () => void
  level?: number
}

export default function TaskItem({ task, onUpdate, level = 0 }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddSubtaskOpen, setIsAddSubtaskOpen] = useState(false)

  const { data: subtasks, isLoading: isLoadingSubtasks } = useGetSubtasksQuery(task.id, {
    skip: !task.has_subtasks || isExpanded,
  })

  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [completeTask] = useCompleteTaskMutation()

  const handleStatusChange = async () => {
    if (task.status !== "completed") {
      await completeTask(task.id)
      onUpdate()
    } else {
      await updateTask({
        id: task.id,
        data: { status: "pending" },
      })
      onUpdate()
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(task.id)
      onUpdate()
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card
        className={`border-l-4 ${task.status === "completed" ? "border-l-green-500" : task.priority === "high" ? "border-l-red-500" : task.priority === "medium" ? "border-l-yellow-500" : "border-l-blue-500"}`}
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
                    className={`text-lg font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                  >
                    {task.title}
                  </h3>
                  <p
                    className={`text-sm text-gray-600 mt-1 ${task.status === "completed" ? "line-through text-gray-400" : ""}`}
                  >
                    {task.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                </div>
              </div>

              {task.due_date && (
                <div className="mt-2 text-sm text-gray-500">Due: {format(new Date(task.due_date), "MMM d, yyyy")}</div>
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

      {isExpanded && task.has_subtasks && subtasks && (
        <div className={`pl-8 mt-2 space-y-2`}>
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} onUpdate={onUpdate} level={level + 1} />
          ))}
        </div>
      )}

      <EditTaskDialog isOpen={isEditOpen} onClose={handleEditClose} task={task} />

      <AddSubtaskDialog isOpen={isAddSubtaskOpen} onClose={handleAddSubtaskClose} parentId={task.id} />
    </>
  )
}
