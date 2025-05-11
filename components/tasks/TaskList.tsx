"use client"
import { useState } from "react"
import { useGetTasksQuery } from "@/redux/features/tasks/tasksAPISlice"
import TaskItem from "./TaskItem"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddTaskDialog from "./AddTaskDialog"
import { Loader2 } from "lucide-react"

export default function TaskList() {
  const [activeTab, setActiveTab] = useState("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  const { data: tasks, isLoading, refetch } = useGetTasksQuery()

  // Filter tasks based on active tab
  const filteredTasks = tasks
    ?.filter((task) => {
      if (activeTab === "all") return true
      if (activeTab === "pending") return task.status === "pending"
      if (activeTab === "in_progress") return task.status === "in_progress"
      if (activeTab === "completed") return task.status === "completed"
      return true
    })
    .filter((task) => task.parent === null) // Only show top-level tasks

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
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
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
