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
import { useToast } from "@/components/ui/use-toast"
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
  expense: ProjectExpense
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReimburseExpenseDialog({ expense, open, onOpenChange, onSuccess }: ReimburseExpenseDialogProps) {
  const { toast } = useToast()
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
    onOpenChange(false)
  }

  const onSubmit = async (data: ReimbursementFormValues) => {
    if (!expense?.id) {
      toast({
        title: "Error",
        description: "Invalid expense data. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      await reimburseExpense({
        id: expense.id,
        notes: data.notes,
        reimbursement_date: data.reimbursement_date.toISOString().split("T")[0],
      }).unwrap()

      toast({
        title: "Expense Reimbursed",
        description: "The expense has been successfully marked as reimbursed.",
      })

      if (onSuccess) {
        onSuccess()
      }

      handleClose()
    } catch (error) {
      console.error("Failed to reimburse expense:", error)
      toast({
        title: "Error",
        description: "Failed to mark expense as reimbursed. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Expense as Reimbursed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p className="mb-2">
              Are you sure you want to mark the expense <strong>{expense?.title || "Unknown"}</strong> for{" "}
              <strong>${expense?.amount?.toLocaleString() || "0.00"}</strong> as reimbursed?
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
            {errors.reimbursement_date && <p className="text-sm text-red-500">{errors.reimbursement_date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Add any notes about this reimbursement" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
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
