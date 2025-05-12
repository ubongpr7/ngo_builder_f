"use client"

import type React from "react"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useUpdateMilestoneStatusMutation } from "@/redux/features/projects/milestoneApiSlice"
import type { ProjectMilestone } from "@/types/project"

const formSchema = z.object({
  status: z.string().min(1, { message: "Please select a status" }),
})

interface UpdateMilestoneStatusDialogProps {
  milestone: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function UpdateMilestoneStatusDialog({ milestone, onSuccess, trigger }: UpdateMilestoneStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [updateStatus, { isLoading }] = useUpdateMilestoneStatusMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: milestone.status,
    },
  })

  // Prepare status options for select
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "delayed", label: "Delayed" },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateStatus({
        id: milestone.id,
        status: values.status,
      }).unwrap()

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Update Status</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Milestone Status</DialogTitle>
          <DialogDescription>Update the status of the milestone "{milestone.title}".</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                Update Status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
