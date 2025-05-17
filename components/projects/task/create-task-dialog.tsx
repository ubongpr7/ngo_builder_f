"use client"

import type React from "react"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DateTimeInput } from "@/components/ui/datetime-input"
import { useToast } from "@/components/ui/use-toast"
import { useCreateTaskMutation } from "@/redux/features/projects/taskAPISlice"
import Select from "react-select"
import { selectStyles } from "@/utils/select-styles"

interface CreateTaskDialogProps {
  open: boolean
  onClose: () => void
  milestoneId: number
  parentId?: number
  onTaskCreated?: () => void
  trigger?: React.ReactNode
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

// Define option types for react-select
interface SelectOption {
  value: string
  label: string
}

export function CreateTaskDialog({
  open,
  onClose,
  milestoneId,
  parentId,
  onTaskCreated,
  trigger,
}: CreateTaskDialogProps) {
  const { toast } = useToast()
  const [createTask, { isLoading }] = useCreateTaskMutation()

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

      await createTask(taskData).unwrap()

      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      })

      if (onTaskCreated) {
        onTaskCreated()
      }

      onClose()
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )

  return trigger ? (
    <Dialog open={open} onOpenChange={onClose}>
      {trigger}
      {dialogContent}
    </Dialog>
  ) : (
    <Dialog open={open} onOpenChange={onClose}>
      {dialogContent}
    </Dialog>
  )
}
