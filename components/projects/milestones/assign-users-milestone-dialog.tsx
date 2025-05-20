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
import { useAssignUsersToMilestoneMutation } from "@/redux/features/projects/milestoneApiSlice"
import { useGetManagerCeoQuery } from "@/redux/features/projects/projectsAPISlice"
import type { ProjectMilestone } from "@/types/project"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"

const formSchema = z.object({
  userIds: z.array(z.string()).min(1, { message: "Please select at least one user" }),
})

interface AssignUsersMilestoneDialogProps {
  milestone: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
  projectId: number
}

export function AssignUsersMilestoneDialog({ milestone, onSuccess, trigger,projectId }: AssignUsersMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [assignUsers, { isLoading }] = useAssignUsersToMilestoneMutation()
const { data: users = [], isLoading: isLoadingUsers } = useGetProjectTeamMembersQuery(projectId)
 

  // Get currently assigned users
  const assignedUserIds = milestone.assigned_to?.map((user) => user.id.toString()) || []

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: assignedUserIds,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await assignUsers({
        id: milestone.id,
        userIds: values.userIds?.map((id) => Number.parseInt(id)),
      }).unwrap()

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Assign Users</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Users to Milestone</DialogTitle>
          <DialogDescription>
            Select users to assign to the milestone "{milestone.title}". These users will be responsible for completing
            this milestone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading users...</span>
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md p-2">
                          {users?.map((user: { id: number; first_name: string; last_name: string; email: string }) => (
                            <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                value={user.id.toString()}
                                checked={field.value.includes(user.id.toString())}
                                onChange={(e) => {
                                  const value = e.target.value
                                  const newValues = e.target.checked
                                    ? [...field.value, value]
                                    : field.value.filter((id) => id !== value)
                                  field.onChange(newValues)
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`user-${user.id}`} className="text-sm">
                                {user.first_name} {user.last_name} ({user.email})
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
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
                Assign Users
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
