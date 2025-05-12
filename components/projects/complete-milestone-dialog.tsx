"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, CheckCircle } from "lucide-react"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DateInput } from "@/components/ui/date-input"
import { useCompleteMilestoneMutation } from "@/redux/features/projects/milestoneApiSlice"
import type { ProjectMilestone } from "@/types/project"

const formSchema = z.object({
  completionDate: z.date({
    required_error: "Completion date is required",
  }),
})

interface CompleteMilestoneDialogProps {
  milestone: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CompleteMilestoneDialog({ milestone, onSuccess, trigger }: CompleteMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [completeMilestone, { isLoading }] = useCompleteMilestoneMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completionDate: new Date(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await completeMilestone({
        id: milestone.id,
        completionDate: format(values.completionDate, "yyyy-MM-dd"),
      }).unwrap()

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to complete milestone:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Mark Complete</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Complete Milestone</DialogTitle>
          <DialogDescription>Mark the milestone "{milestone.title}" as completed.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="completionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Date</FormLabel>
                  <FormControl>
                    <DateInput value={field.value} onChange={field.onChange} label="" id="completion-date" />
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
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Complete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
