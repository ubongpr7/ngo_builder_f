"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { useToast } from "@/components/ui/use-toast"
import Select from "react-select"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"
import { useCreateExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date_incurred: z.date({
    required_error: "Date is required",
    invalid_type_error: "Date is required",
  }),
  category: z.string().min(1, "Category is required"),
  incurred_by: z.number().optional(),
  receipt: z.instanceof(File).optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const EXPENSE_CATEGORIES = [
  { value: "Travel", label: "Travel" },
  { value: "Meals", label: "Meals" },
  { value: "Supplies", label: "Supplies" },
  { value: "Software", label: "Software" },
  { value: "Hardware", label: "Hardware" },
  { value: "Services", label: "Services" },
  { value: "Training", label: "Training" },
  { value: "Other", label: "Other" },
]

interface AddExpenseDialogProps {
  projectId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddExpenseDialog({ projectId, open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createExpense] = useCreateExpenseMutation()

  // Fetch team members for the project
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useGetProjectTeamMembersQuery(projectId)

  // Format team members for react-select
  const teamMemberOptions = teamMembers.map((user) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name} (${user.username})`,
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: undefined,
      date_incurred: new Date(),
      category: "",
      notes: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("project", projectId.toString())
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("amount", data.amount.toString())
      formData.append("date_incurred", data.date_incurred.toISOString().split("T")[0])
      formData.append("category", data.category)

      if (data.incurred_by) {
        formData.append("incurred_by", data.incurred_by.toString())
      }

      if (data.receipt) {
        formData.append("receipt", data.receipt)
      }

      if (data.notes) {
        formData.append("notes", data.notes)
      }

      // Set status to pending
      formData.append("status", "pending")

      await createExpense(formData).unwrap()

      toast({
        title: "Expense Added",
        description: "The expense has been successfully added.",
      })

      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to add expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of the expense. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_incurred">Date Incurred *</Label>
              <Controller
                control={control}
                name="date_incurred"
                render={({ field }) => <DateInput id="date_incurred" value={field.value} onChange={field.onChange} />}
              />
              {errors.date_incurred && <p className="text-sm text-red-500">{errors.date_incurred.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  inputId="category"
                  options={EXPENSE_CATEGORIES}
                  value={EXPENSE_CATEGORIES.find((option) => option.value === field.value)}
                  onChange={(option) => field.onChange(option?.value || "")}
                  placeholder="Select a category"
                  classNames={{
                    control: () => "input",
                  }}
                />
              )}
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="incurred_by">Incurred By</Label>
            <Controller
              control={control}
              name="incurred_by"
              render={({ field }) => (
                <Select
                  inputId="incurred_by"
                  options={teamMemberOptions}
                  value={teamMemberOptions.find((option) => option.value === field.value)}
                  onChange={(option) => field.onChange(option?.value || null)}
                  placeholder={
                    isLoadingTeamMembers ? "Loading team members..." : "Select team member (defaults to you)"
                  }
                  isLoading={isLoadingTeamMembers}
                  isClearable
                  classNames={{
                    control: () => "input",
                  }}
                />
              )}
            />
            {errors.incurred_by && <p className="text-sm text-red-500">{errors.incurred_by.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // @ts-ignore - setValue is not properly typed for File objects
                  control._formValues.receipt = file
                }
              }}
            />
            {errors.receipt && <p className="text-sm text-red-500">{errors.receipt.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...register("notes")} />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
