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
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField } from "@/components/ui/react-select-field"
import { useCreateTeamMemberMutation } from "@/redux/features/projects/teamMemberApiSlice"
import { useGetManagerCeoQuery } from "@/redux/features/projects/projectsAPISlice"

const formSchema = z.object({
  user: z.string().min(1, { message: "Please select a user" }),
  role: z.string().min(1, { message: "Please select a role" }),
  responsibilities: z.string().optional(),
  join_date: z.date({
    required_error: "Please select a join date",
  }),
  end_date: z.date().optional(),
})

interface AddTeamMemberDialogProps {
  projectId: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddTeamMemberDialog({ projectId, onSuccess, trigger }: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: users = [], isLoading: isLoadingUsers } = useGetManagerCeoQuery('')
  const [createTeamMember, { isLoading }] = useCreateTeamMemberMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      responsibilities: "",
      join_date: new Date(),
    },
  })

  // Prepare user options for react-select
  const userOptions = users.map((user) => ({
    value: user.id.toString(),
    label: `${user.first_name} ${user.last_name} (${user.email})`,
  }))

  // Prepare role options for react-select
  const roleOptions = [
    { value: "manager", label: "Project Manager" },
    { value: "coordinator", label: "Coordinator" },
    { value: "member", label: "Team Member" },
    { value: "advisor", label: "Advisor" },
    { value: "volunteer", label: "Volunteer" },
    { value: "monitoring", label: "Monitoring/Reporting Officer" },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createTeamMember({
        project: projectId,
        user: Number.parseInt(values.user),
        role: values.role,
        responsibilities: values.responsibilities,
        join_date: format(values.join_date, "yyyy-MM-dd"),
        end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd") : undefined,
      }).unwrap()

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to add team member:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Add Team Member</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new team member to this project. Fill out the form below to create a new team member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <FormControl>
                    <ReactSelectField
                      options={userOptions}
                      isLoading={isLoadingUsers}
                      placeholder="Select a user"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <ReactSelectField options={roleOptions} placeholder="Select a role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the team member's responsibilities" {...field} />
                  </FormControl>
                  <FormDescription>Optional. Describe what this team member will be responsible for.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="join_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date</FormLabel>
                    <FormControl>
                      <DateInput value={field.value} onChange={field.onChange} label="" id="join-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <DateInput value={field.value} onChange={field.onChange} label="" id="end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Team Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
