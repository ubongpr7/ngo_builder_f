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
import { ReactSelectField } from "@/components/ui/react-select-field"
import { useAssignUsersToMilestoneMutation } from "@/redux/features/projects/milestoneApiSlice"
import { useGetManagerCeoQuery } from "@/redux/features/projects/projectsAPISlice"
import type { ProjectMilestone } from "@/types/project"

const formSchema = z.object({
  userIds: z.array(z.string()).min(1, { message: "Please select at least one user" }),
})

interface AssignUsersMilestoneDialogProps {
  milestone: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AssignUsersMilestoneDialog({ milestone, onSuccess, trigger }: AssignUsersMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: users = [], isLoading: isLoadingUsers } = useGetManagerCeoQuery("")
  const [assignUsers, { isLoading }] = useAssignUsersToMilestoneMutation()

  // Get currently assigned users
  const assignedUserIds = milestone.assigned_to?.map((user) => user.id.toString()) || []

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: assignedUserIds,
    },
  })

  // Prepare user options for react-select
  const userOptions = users.map((user: { id: number; first_name: string; last_name: string; email: string }) => ({
    value: user.id.toString(),
    label: `${user.first_name} ${user.last_name} (${user.email})`,
  }))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await assignUsers({
        id: milestone.id,
        userIds: values.userIds.map((id) => Number.parseInt(id)),
      }).unwrap()

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to assign users:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Assign Users</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Users to Milestone</DialogTitle>
          <DialogDescription>
            Select users to assign to the milestone "{milestone.title}". These users will be responsible for completing
            this milestone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <FormControl>
                    <ReactSelectField
                      options={userOptions}
                      isLoading={isLoadingUsers}
                      placeholder="Select users"
                      isMulti
                      {...field}
                    />
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
                Assign Users
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
