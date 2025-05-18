"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Search } from "lucide-react"

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
import { Form, FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"
import { useAssignUsersToTaskMutation } from "@/redux/features/projects/taskAPISlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const formSchema = z.object({
  userIds: z.array(z.string()).min(0),
})

interface AssignUsersDialogProps {
  task: any
  projectId: number
  onUsersAssigned?: () => void
  trigger: React.ReactNode
}

export function AssignUsersDialog({ task, projectId, onUsersAssigned, trigger }: AssignUsersDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const { data: users = [], isLoading: isLoadingUsers } = useGetProjectTeamMembersQuery(projectId, {
    skip: !open,
  })

  const [assignUsers, { isLoading }] = useAssignUsersToTaskMutation()

  const assignedUserIds = task?.assigned_to?.map((user: any) => user.id.toString()) || []

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: assignedUserIds,
    },
  })

  // Reset form when dialog opens with current assignees
  useEffect(() => {
    if (open && task?.assigned_to) {
      form.reset({
        userIds: task.assigned_to.map((user: any) => user.id.toString()),
      })
    }
  }, [open, task, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await assignUsers({
        id: task.id,
        userIds: values.userIds.map((id) => Number.parseInt(id)),
      }).unwrap()

      toast({
        title: "Users assigned",
        description: "Users have been assigned to the task successfully.",
      })

      setOpen(false)
      if (onUsersAssigned) onUsersAssigned()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign users to the task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Users to Task</DialogTitle>
          <DialogDescription>
            Select users to assign to the task "{task?.title}". These users will be responsible for completing this
            task.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading users...</span>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">No users found</p>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md p-2">
                          {filteredUsers.map((user: any) => (
                            <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
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
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profile_image || ""} />
                                <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                              </Avatar>
                              <label htmlFor={`user-${user.id}`} className="flex-1 text-sm cursor-pointer">
                                <div className="font-medium">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
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
