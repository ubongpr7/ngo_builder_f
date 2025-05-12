"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApproveExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { ProjectExpense } from "@/types/project"

// Define the form schema
const approvalSchema = z.object({
  notes: z.string().optional(),
})

type ApprovalFormValues = z.infer<typeof approvalSchema>

interface ApproveExpenseDialogProps {
  expense: ProjectExpense
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ApproveExpenseDialog({ expense, open, onOpenChange, onSuccess }: ApproveExpenseDialogProps) {
  const { toast } = useToast()
  const [approveExpense, { isLoading: isSubmitting }] = useApproveExpenseMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      notes: "",
    },
  })

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: ApprovalFormValues) => {
    try {
      await approveExpense({
        id: expense.id,
        notes: data.notes,
      }).unwrap()

      toast({
        title: "Expense Approved",
        description: "The expense has been approved successfully.",
      })

      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error("Failed to approve expense:", error)
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p className="mb-2">
              Are you sure you want to approve the expense <strong>{expense?.title}</strong> for{" "}
              <strong>${expense?.amount?.toLocaleString()}</strong>?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Add any notes about this approval" {...register("notes")} />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
