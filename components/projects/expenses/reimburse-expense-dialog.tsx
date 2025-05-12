"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { useReimburseExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { Loader2, DollarSign } from "lucide-react"
import type { ProjectExpense } from "@/types/project"

// Define the form schema
const reimbursementSchema = z.object({
  notes: z.string().optional(),
  reimbursement_date: z.date({
    required_error: "Reimbursement date is required",
  }),
})

type ReimbursementFormValues = z.infer<typeof reimbursementSchema>

interface ReimburseExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
  expense: ProjectExpense
  onSuccess: () => void
}

export function ReimburseExpenseDialog({ isOpen, onClose, expense, onSuccess }: ReimburseExpenseDialogProps) {
  const [reimburseExpense, { isLoading: isSubmitting }] = useReimburseExpenseMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: {
      notes: "",
      reimbursement_date: new Date(),
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: ReimbursementFormValues) => {
    try {
      await reimburseExpense({
        id: expense.id,
        notes: data.notes,
        reimbursement_date: data.reimbursement_date.toISOString().split("T")[0],
      }).unwrap()

      onSuccess()
      handleClose()
    } catch (error) {
      console.error("Failed to reimburse expense:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Expense as Reimbursed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p className="mb-2">
              Are you sure you want to mark the expense <strong>{expense.title}</strong> for{" "}
              <strong>${expense.amount.toLocaleString()}</strong> as reimbursed?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reimbursement_date">Reimbursement Date</Label>
            <Controller
              control={control}
              name="reimbursement_date"
              render={({ field }) => (
                <DateInput
                  id="reimbursement_date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.reimbursement_date?.message}
                  maxDate={new Date()}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Add any notes about this reimbursement" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Mark as Reimbursed
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
