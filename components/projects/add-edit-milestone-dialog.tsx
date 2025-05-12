"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField } from "@/components/ui/react-select-field"
import { useCreateMilestoneMutation, useUpdateMilestoneMutation } from "@/redux/features/projects/milestoneApiSlice"
import type { ProjectMilestone } from "@/types/project"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  due_date: z.date({
    required_error: "Due date is required",
  }),
  status: z.string().min(1, { message: "Status is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
  completion_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  deliverables: z.string().optional(),
})

interface AddEditMilestoneDialogProps {
  projectId: number
  milestone?: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditMilestoneDialog({ projectId, milestone, onSuccess, trigger }: AddEditMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [createMilestone, { isLoading: isCreating }] = useCreateMilestoneMutation()
  const [updateMilestone, { isLoading: isUpdating }] = useUpdateMilestoneMutation()
  const isLoading = isCreating || isUpdating
  const isEditing = !!milestone

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: milestone?.title || "",
      description: milestone?.description || "",
      due_date: milestone?.due_date ? new Date(milestone.due_date) : new Date(),
      status: milestone?.status || "pending",
      priority: milestone?.priority || "medium",
      completion_percentage: milestone?.completion_percentage || 0,
      notes: milestone?.notes || "",
      deliverables: milestone?.deliverables || "",
    },
  })

  // Prepare status options for react-select
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "delayed", label: "Delayed" },
  ]

  // Prepare priority options for react-select
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing && milestone) {
        await updateMilestone({
          id: milestone.id,
          data: {
            ...values,
            project: projectId,
            due_date: format(values.due_date, "yyyy-MM-dd"),
          },
        }).unwrap()
      } else {
        await createMilestone({
          ...values,
          project: projectId,
          due_date: format(values.due_date, "yyyy-MM-dd"),
        }).unwrap()
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to save milestone:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Add Milestone</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the milestone details below."
              : "Add a new milestone to this project. Fill out the form below to create a new milestone."}
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
                    <Input placeholder="Milestone title" {...field} />
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
                    <Textarea placeholder="Describe the milestone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DateInput value={field.value} onChange={field.onChange} label="" id="due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <ReactSelectField options={statusOptions} placeholder="Select status" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <ReactSelectField options={priorityOptions} placeholder="Select priority" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completion_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deliverables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deliverables</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Expected deliverables for this milestone" {...field} />
                  </FormControl>
                  <FormDescription>Optional. List the expected outputs for this milestone.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormDescription>Optional. Add any additional notes or context.</FormDescription>
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
                {isEditing ? "Update Milestone" : "Add Milestone"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
