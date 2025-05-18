"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DateTimeInput } from "@/components/ui/datetime-input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/redux/features/projects/taskAPISlice"
import { ReactSelectField, type SelectOption } from "@/components/ui/react-select-field"

interface AddEditTaskDialogProps {
  open: boolean
  onClose: () => void
  milestoneId: number
  task?: any
  parentId?: number | null
  onSuccess?: () => void
}

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

export function AddEditTaskDialog({ open, onClose, milestoneId, task, parentId, onSuccess }: AddEditTaskDialogProps) {
  const { toast } = useToast()
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()

  const isLoading = isCreating || isUpdating
  const isEditing = !!task
  const isSubtask = !!parentId

  const dialogTitle = isEditing ? "Edit Task" : isSubtask ? "Add Subtask" : "Create New Task"

  const dialogDescription = isEditing
    ? "Update the details of this task."
    : isSubtask
      ? "Add a new subtask to the parent task."
      : "Create a new task for this milestone."

  // Status options for react-select
  const statusOptions: SelectOption[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Under Review" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
  ]

  // Priority options for react-select
  const priorityOptions: SelectOption[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  // Task type options for react-select
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
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      task_type: "feature",
      start_date: null,
      due_date: null,
      estimated_hours: "",
      tags: "",
    },
  })

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || "todo",
        priority: task?.priority || "medium",
        task_type: task?.task_type || "feature",
        start_date: task?.start_date ? new Date(task.start_date) : null,
        due_date: task?.due_date ? new Date(task.due_date) : null,
        estimated_hours: task?.estimated_hours?.toString() || "",
        tags: task?.tags || "",
      })
    }
  }, [open, task, form])

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const taskData = {
        title: values.title,
        description: values.description || "",
        milestone_id: milestoneId,
        // Set parent_id based on context - if editing, keep the original parent_id, if adding subtask use parentId
        parent_id: isEditing ? task.parent_id : parentId || null,
        status: values.status,
        priority: values.priority,
        task_type: values.task_type,
        start_date: values.start_date ? values.start_date.toISOString() : undefined,
        due_date: values.due_date ? values.due_date.toISOString() : undefined,
        estimated_hours: values.estimated_hours ? Number(values.estimated_hours) : undefined,
        tags: values.tags,
      }

      if (isEditing) {
        await updateTask({ id: task.id, data:taskData }).unwrap()
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        })
      } else {
        await createTask(taskData).unwrap()
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} task. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} autoComplete="off" />
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
                      <Textarea
                        placeholder="Task description"
                        className="min-h-[100px]"
                        {...field}
                        autoComplete="off"
                      />
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
                            <ReactSelectField
                              options={statusOptions}
                              value={statusOptions.find((option) => option.value === field.value)}
                              onChange={(option: any) => field.onChange(option?.value)}
                              placeholder="Select status"
                              inputId="task-status"
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
                            <ReactSelectField
                              options={priorityOptions}
                              value={priorityOptions.find((option) => option.value === field.value)}
                              onChange={(option: any) => field.onChange(option?.value)}
                              placeholder="Select priority"
                              inputId="task-priority"
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
                            <ReactSelectField
                              options={taskTypeOptions}
                              value={taskTypeOptions.find((option) => option.value === field.value)}
                              onChange={(option: any) => field.onChange(option?.value)}
                              placeholder="Select type"
                              inputId="task-type"
                            />
                          )}
                        />
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Estimated hours" {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Comma-separated tags" {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 pt-2 bg-white border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
