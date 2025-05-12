"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useUpdateMilestonePercentageMutation } from "@/redux/features/projects/milestoneApiSlice"
import type { ProjectMilestone } from "@/types/project"

const formSchema = z.object({
  completionPercentage: z.number().min(0).max(100),
})

interface UpdateMilestonePercentageDialogProps {
  milestone: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function UpdateMilestonePercentageDialog({
  milestone,
  onSuccess,
  trigger,
}: UpdateMilestonePercentageDialogProps) {
  const [open, setOpen] = useState(false)
  const [updatePercentage, { isLoading }] = useUpdateMilestonePercentageMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completionPercentage: milestone.completion_percentage || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updatePercentage({
        id: milestone.id,
        completionPercentage: values.completionPercentage,
      }).unwrap()

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to update completion percentage:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Update Progress</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Completion Percentage</DialogTitle>
          <DialogDescription>Update the completion percentage of the milestone "{milestone.title}".</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="completionPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Percentage: {field.value}%</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
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
                Update Progress
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
