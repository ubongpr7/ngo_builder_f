"use client"

import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import Select from "react-select"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DateTimeInput } from "@/components/ui/datetime-input"
import { useToast } from "@/components/ui/use-toast"
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/redux/features/projects/taskAPISlice"
import { selectStyles } from "@/utils/select-styles"
import  { Task } from "@/types/tasks"

const taskSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.string().default("todo"),
    priority: z.string().default("medium"),
    task_type: z.string().default("feature"),
    start_date: z.date().optional().nullable(),
    due_date: z.date().optional().nullable(),
    estimated_hours: z.string().optional(),
    tags: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return data.start_date < data.due_date
      }
      return true
    },
    {
      message: "Start date must be before due date",
      path: ["due_date"],
    },
  )

type TaskFormValues = z.infer<typeof taskSchema>

interface SelectOption {
  value: string
  label: string
}

interface AddEditTaskDialogProps {
  milestoneId: number
  parentId?: number
  task?: Task
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditTaskDialog({ milestoneId, parentId, task, onSuccess, trigger }: AddEditTaskDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const isLoading = isCreating || isUpdating
  const isEditing = !!task

  const statusOptions: SelectOption[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Under Review" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
  ]

  const priorityOptions: SelectOption[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  const taskTypeOptions: SelectOption[] = [
    { value: "feature", label: "Feature" },
    { value: "bug", label: "Bug" },
    { value: "improvement", label: "Improvement" },
    { value: "documentation", label: "Documentation" },
    { value: "research", label: "Research" },
    { value: "other", label: "Other" },
  ]

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      task_type: task?.task_type || "feature",
      start_date: task?.start_date ? new Date(task.start_date) : null,
      due_date: task?.due_date ? new Date(task.due_date) : null,
      estimated_hours: task?.estimated_hours?.toString() || "",
      tags: task?.tags || "",
    },
  })

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const taskData = {
        title: values.title,
        description: values.description || "",
        milestone_id: milestoneId,
        parent_id: parentId,
        status: values.status,
        priority: values.priority,
        task_type: values.task_type,
        start_date: values.start_date ? values.start_date.toISOString() : undefined,
        due_date: values.due_date ? values.due_date.toISOString() : undefined,
        estimated_hours: values.estimated_hours ? Number.parseInt(values.estimated_hours) : undefined,
        tags: values.tags,
      }

      if (task) {
        await updateTask({
          id: task.id,
          data: taskData
        }).unwrap()
      } else {
        await createTask(taskData).unwrap()
      }

      toast({
        title: `Task ${isEditing ? "Updated" : "Created"}`,
        description: `Task has been ${isEditing ? "updated" : "created"} successfully.`,
      })

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} task. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>{isEditing ? "Edit Task" : "Add Task"}</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details below."
              : "Add a new task to this milestone. Fill out the form below to create a new task."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Task description" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Controller
                      name="status"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          options={statusOptions}
                          value={statusOptions.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          styles={selectStyles}
                          placeholder="Select status"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Controller
                      name="priority"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          options={priorityOptions}
                          value={priorityOptions.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          styles={selectStyles}
                          placeholder="Select priority"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <FormControl>
                    <Controller
                      name="task_type"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          options={taskTypeOptions}
                          value={taskTypeOptions.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          styles={selectStyles}
                          placeholder="Select type"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Hours</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Estimated hours" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <DateTimeInput value={field.value} onChange={field.onChange} id="start-date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date & Time</FormLabel>
                  <FormControl>
                    <DateTimeInput
                      value={field.value}
                      onChange={field.onChange}
                      id="due-date"
                      minDateTime={form.watch("start_date") || undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="Comma-separated tags" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}