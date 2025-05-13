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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { useDeleteUpdateMutation } from "@/redux/features/projects/updateApiSlice"

interface DeleteUpdateDialogProps {
  update: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteUpdateDialog({ update, open, onOpenChange, onSuccess }: DeleteUpdateDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteUpdate] = useDeleteUpdateMutation()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      await deleteUpdate(update.id).unwrap()
      
      toast({
        title: "Update Deleted",
        description: "The project update has been successfully deleted.",
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete update:", error)
      toast({
        title: "Error",
        description: "Failed to delete update. Please try again.",
        variant: "destructive",
      })
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
