"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Select from "react-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { Loader2, Receipt } from "lucide-react"
import { toast } from "react-toastify"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"
import { useCreateExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { useGetBudgetItemsQuery } from "@/redux/features/finance/budget-items"
import { formatCurrency } from "@/lib/currency-utils"

interface TeamMember {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
}
// Updated BudgetItem interface
interface BudgetItem {
  id: number
  title: string
  budgeted_amount: number
  currency: {
    id: number
    code: string
    name: string
  }
  truly_available_amount: number; // Added for validation
  approval_required_threshold?: number; // Added for approval check
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date_incurred: z
    .date({
      required_error: "Date is required",
      invalid_type_error: "Date is required",
    })
    .refine((date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date <= today
    }, "Date cannot be in the future"),
  category: z.string().min(1, "Category is required"),
  incurred_by: z.number().optional(),
  budget_item: z.number().optional().nullable(),
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
  projectCurrencyCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddExpenseDialog({ projectId, projectCurrencyCode, open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createExpense] = useCreateExpenseMutation()
  
  const { data: budgetItems = [], isLoading: isLoadingBudgetItems } = useGetBudgetItemsQuery({
    budget__project: projectId,
  })

  const today = new Date()
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useGetProjectTeamMembersQuery(projectId)

  const budgetItemOptions = (budgetItems as BudgetItem[]).map(item => ({
    value: item.id,
    label: `${item.title} - ${formatCurrency(projectCurrencyCode, item.budgeted_amount)}`,
    truly_available_amount: item.truly_available_amount,
    approval_required_threshold: item.approval_required_threshold,
  }))

  const teamMemberOptions = (teamMembers as TeamMember[])?.map(user => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name} (${user.username})`,
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: undefined,
      date_incurred: new Date(),
      category: "",
      budget_item: null,
      notes: "",
    },
  })

  const [selectedBudgetItem, setSelectedBudgetItem] = useState<BudgetItem | null>(null)

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      if (selectedBudgetItem) {
        const { truly_available_amount, approval_required_threshold } = selectedBudgetItem;

        // Check if the expense amount exceeds the truly available amount
        if (data.amount > truly_available_amount) {
          toast.error("Expense amount exceeds the truly available budget for the selected item.");
          return;
        }

        // Check if the expense requires approval
        if (approval_required_threshold && data.amount > approval_required_threshold) {
          toast.error("Expense amount requires approval.");
          return;
        }
      }

      const formData = new FormData()
      formData.append("project", projectId.toString())
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("amount", data.amount.toString())
      formData.append("date_incurred", data.date_incurred.toISOString().split("T")[0])
      formData.append("category", data.category)

      if (data.budget_item) {
        formData.append("budget_item", data.budget_item.toString())
      }

      if (data.incurred_by) {
        formData.append("incurred_by", data.incurred_by.toString())
      }

      if (data.notes) {
        formData.append("notes", data.notes)
      }

      formData.append("status", "pending")

      await createExpense(formData).unwrap()
      toast.success("Expense Added")

      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error("Error adding expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset()
          setSelectedBudgetItem(null) // Reset selected budget item when dialog closes
        }
        onOpenChange(isOpen)
      }}
    >
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
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_incurred">Date Incurred *</Label>
              <Controller
                control={control}
                name="date_incurred"
                render={({ field }) => (
                  <DateInput
                    id="date_incurred"
                    value={field.value}
                    onChange={field.onChange}
                    maxDate={today}
                    error={errors.date_incurred?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_item">Budget Item *</Label>
            <Controller
              control={control}
              name="budget_item"
              render={({ field }) => (
                <Select
                  inputId="budget_item"
                  options={budgetItemOptions}
                  value={budgetItemOptions.find(option => option.value === field.value)}
                  onChange={(option) => {
                    field.onChange(option?.value || null);
                    setSelectedBudgetItem(option ? budgetItems.find(item => item.id === option.value) : null);
                    if (option) {
                      setValue("amount", 0); // Reset amount when budget item changes
                    }
                  }}
                  placeholder={
                    isLoadingBudgetItems 
                      ? "Loading budget items..." 
                      : "Select a budget item"
                  }
                  isLoading={isLoadingBudgetItems}
                  isClearable
                  classNames={{
                    control: () => "input",
                  }}
                />
              )}
            />
            {errors.budget_item && <p className="text-sm text-red-500">{errors.budget_item.message}</p>}
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
            {teamMemberOptions?.length === 0 && !isLoadingTeamMembers && (
              <p className="text-xs text-amber-500">
                No team members found for this project. Only project team members can be assigned expenses.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...register("notes")} />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          {/* Summary Section */}
          {selectedBudgetItem && (
            <div className="p-4 border rounded-lg mt-4">
              <h3 className="font-medium">Summary</h3>
              <p>Selected Budget Item: {selectedBudgetItem.title}</p>
              <p>Truly Available Amount: {formatCurrency(projectCurrencyCode, selectedBudgetItem.truly_available_amount)}</p>
              <p>Approval Required Threshold: {selectedBudgetItem.approval_required_threshold ? formatCurrency(projectCurrencyCode, selectedBudgetItem.approval_required_threshold) : "N/A"}</p>
              <p>Expense Amount: {formatCurrency(projectCurrencyCode, Number(getValues("amount")))}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="button-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Add Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
