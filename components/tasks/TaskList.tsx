"use client"

import { useState } from "react"
import { useGetTopLevelTasksQuery } from "@/redux/features/tasks/tasksAPISlice"
import TaskItem from "./TaskItem"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddTaskDialog from "./AddTaskDialog"
import { Loader2 } from "lucide-react"


export default function TaskList() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  const { data: tasks = [], isLoading, refetch } = useGetTopLevelTasksQuery()

  // Filter tasks based on active tab - ensure tasks is an array before filtering
  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter((task) => {
        if (activeTab === "all") return true
        if (activeTab === "todo") return task.status === "todo"
        if (activeTab === "in_progress") return task.status === "in_progress"
        if (activeTab === "review") return task.status === "review"
        if (activeTab === "completed") return task.status === "completed"
        if (activeTab === "blocked") return task.status === "blocked"
        return true
      })
    : []

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Refresh tasks when dialog closes
  const handleDialogClose = () => {
    setIsAddTaskOpen(false)
    refetch()
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management System</h1>
        <Button onClick={() => setIsAddTaskOpen(true)}>Add New Task</Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTasks?.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks?.map((task) => (
                <TaskItem key={task.id} task={task} onUpdate={refetch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddTaskDialog isOpen={isAddTaskOpen} onClose={handleDialogClose} />
    </div>
  )
}
