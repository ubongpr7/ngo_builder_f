"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"

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
import { useDeleteMilestoneMutation } from "@/redux/features/projects/milestoneApiSlice"
import type { ProjectMilestone } from "@/types/project"

interface DeleteMilestoneDialogProps {
  milestone: ProjectMilestone
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function DeleteMilestoneDialog({ milestone, onSuccess, trigger }: DeleteMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [deleteMilestone, { isLoading }] = useDeleteMilestoneMutation()

  async function handleDelete() {
    try {
      await deleteMilestone(milestone.id).unwrap()
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Delete</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Delete Milestone
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the milestone "{milestone.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
