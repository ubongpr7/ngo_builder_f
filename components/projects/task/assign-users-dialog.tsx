"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"

import { useAssignUsersToTaskMutation } from "@/redux/features/projects/taskAPISlice"
import Select from "react-select"

import { selectStyles } from "@/utils/select-styles"

interface AssignUsersDialogProps {
  open: boolean
  onClose: () => void
  taskId: number
  projectId: number
  currentAssignees: number[]
  onUsersAssigned?: () => void
}

interface UserOption {
  value: string
  label: string
}

export function AssignUsersDialog({
  open,
  onClose,
  taskId,
  projectId,
  currentAssignees,
  onUsersAssigned,
}: AssignUsersDialogProps) {
  const { toast } = useToast()
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>(
    currentAssignees.map((id) => ({ value: id.toString(), label: "" })),
  )

  const { data: users, isLoading: isLoadingUsers } = useGetProjectTeamMembersQuery(projectId)
  const [assignUsers, { isLoading }] = useAssignUsersToTaskMutation()

  // Convert users to options for react-select
  const userOptions: UserOption[] = users
    ? users.map((user:{id:number,first_name:string,last_name:string}) => ({
        value: user.id.toString(),
        label: `${user.first_name} ${user.last_name}`,
      }))
    : []

  // Update selectedUsers with proper labels when users data is loaded
  useState(() => {
    if (users && currentAssignees.length > 0) {
      const updatedSelectedUsers = currentAssignees.map((id) => {
        const user = users.find((u:{id:number,first_name:string,last_name:string}) => u.id === id)
        return {
          value: id.toString(),
          label: user ? `${user.first_name} ${user.last_name}` : `User ${id}`,
        }
      })
      setSelectedUsers(updatedSelectedUsers)
    }
  })

  const handleAssign = async () => {
    try {
      await assignUsers({
        taskId,
        userIds: selectedUsers.map((option) => Number.parseInt(option.value)),
      }).unwrap()

      toast({
        title: "Users assigned",
        description: "Users have been assigned to the task successfully.",
      })

      if (onUsersAssigned) {
        onUsersAssigned()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign users to the task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Users to Task</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoadingUsers ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Select
              isMulti
              options={userOptions}
              value={selectedUsers}
              onChange={(selected) => setSelectedUsers(selected as UserOption[])}
              placeholder="Select users to assign"
              styles={selectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? "Assigning..." : "Assign Users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
