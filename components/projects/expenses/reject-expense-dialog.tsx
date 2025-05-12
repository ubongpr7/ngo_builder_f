"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRejectExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { Loader2, XCircle } from "lucide-react"
import type { ProjectExpense } from "@/types/project"

// Define the form schema
const rejectionSchema = z.object({
  notes: z.string().min(1, "Please provide a reason for rejection"),
})

type RejectionFormValues = z.infer<typeof rejectionSchema>

interface RejectExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
  expense: ProjectExpense
  onSuccess: () => void
}

export function RejectExpenseDialog({ isOpen, onClose, expense, onSuccess }: RejectExpenseDialogProps) {
  const [rejectExpense, { isLoading: isSubmitting }] = useRejectExpenseMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      notes: "",
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: RejectionFormValues) => {
    try {
      await rejectExpense({
        id: expense.id,
        notes: data.notes,
      }).unwrap()

      onSuccess()
      handleClose()
    } catch (error) {
      console.error("Failed to reject expense:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p className="mb-2">
              Are you sure you want to reject the expense <strong>{expense.title}</strong> for{" "}
              <strong>${expense.amount.toLocaleString()}</strong>?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Reason for Rejection</Label>
            <Textarea id="notes" placeholder="Please provide a reason for rejection" {...register("notes")} />
            {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
