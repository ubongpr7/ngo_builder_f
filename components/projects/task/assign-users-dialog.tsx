"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"
import { Input } from "@/components/ui/input"
import { useAssignUsersToTaskMutation } from "@/redux/features/projects/taskAPISlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search } from "lucide-react"

interface AssignUsersDialogProps {
  open: boolean
  onClose: () => void
  taskId: number
  projectId: number
  currentAssignees: number[]
  onUsersAssigned?: () => void
}

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  profile_image?: string
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
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(currentAssignees || [])
  const [searchQuery, setSearchQuery] = useState("")

  const { data: users = [], isLoading: isLoadingUsers } = useGetProjectTeamMembersQuery(projectId)
  const [assignUsers, { isLoading }] = useAssignUsersToTaskMutation()

  // Update selected users when currentAssignees changes
  useEffect(() => {
    if (open) {
      setSelectedUserIds(currentAssignees || [])
    }
  }, [open, currentAssignees])

  // Filter users based on search query
  const filteredUsers = users.filter((user: User) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const email = user.email?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()

    return fullName.includes(query) || email.includes(query)
  })

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleAssign = async () => {
    try {
      await assignUsers({
        id: taskId,
        userIds: selectedUserIds,
      }).unwrap()

      toast({
        title: "Users assigned",
        description: "Users have been assigned to the task successfully.",
      })

      if (onUsersAssigned) {
        onUsersAssigned()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign users to the task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Users to Task</DialogTitle>
          <DialogDescription>
            Select the users you want to assign to this task. They will be responsible for completing it.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 min-h-[200px] max-h-[400px] border rounded-md">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center h-full p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
          ) : filteredUsers?.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 text-gray-500">No users found</div>
          ) : (
            <div className="space-y-1 p-1">
              {filteredUsers?.map((user: User) => (
                <div
                  key={user.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                    selectedUserIds.includes(user.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={user.profile_image || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 pt-2 border-t sticky bottom-0 bg-white">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-500">
              {selectedUserIds?.length} user{selectedUserIds?.length !== 1 ? "s" : ""} selected
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Assign Users
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
