"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from 'lucide-react'
import { useDeleteUpdateMutation } from "@/redux/features/projects/updateApiSlice"
import { toast } from "react-toastify"

interface DeleteUpdateDialogProps {
  update: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteUpdateDialog({ update, open, onOpenChange, onSuccess }: DeleteUpdateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteUpdate] = useDeleteUpdateMutation()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      await deleteUpdate(update.id).unwrap()
      
      toast.success("Update deleted successfully")
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete update:", error)
      toast.error("Failed to delete update")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project Update</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this project update from {update.date}? This action cannot be undone and will also delete all associated media files.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Update"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
