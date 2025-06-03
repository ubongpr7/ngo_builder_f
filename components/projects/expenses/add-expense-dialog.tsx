"use client"

import { useEffect, useState } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Select from "react-select"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"
import { useCreateExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { useGetBudgetItemsQuery } from "@/redux/features/finance/budget-items"
import { formatCurrency } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"

interface TeamMember {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
}

interface BudgetItem {
  id: number
  title: string
  budgeted_amount: number
  currency: {
    id: number
    code: string
    name: string
  }
  truly_available_amount: number
  approval_required_threshold?: number
  utilization_percentage: number
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .refine((val) => val > 0, "Amount must be greater than 0"),
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
  budget_item: z.number({ required_error: "Budget item is required" }),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.budget_item) {
    const budgetItem = budgetItemsData.find(item => item.id === data.budget_item);
    if (budgetItem) {
      if (data.amount > budgetItem.truly_available_amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expense amount exceeds available budget",
          path: ["amount"],
        });
      }
    }
  }
});

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
  projectCurrencyCode: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Custom styles for React Select
const selectStyles = {
  control: (provided: any) => ({
    ...provided,
    minHeight: "40px",
    borderColor: "#d1d5db",
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
    color: state.isSelected ? "white" : "#374151",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9ca3af",
  }),
}

let budgetItemsData: BudgetItem[] = [];

export function AddExpenseDialog({ projectId, projectCurrencyCode, open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createExpense] = useCreateExpenseMutation()
  
  const { data: budgetItems = [], isLoading: isLoadingBudgetItems } = useGetBudgetItemsQuery({
    budget__project: projectId,
  })
  
  // Store budget items in module-level variable for zod validation
  budgetItemsData = budgetItems as BudgetItem[];
  
  const today = new Date()
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useGetProjectTeamMembersQuery(projectId)

  const budgetItemOptions = (budgetItems as BudgetItem[]).map(item => ({
    value: item.id,
    label: `${item.title} - ${formatCurrency(projectCurrencyCode, item.budgeted_amount)}`,
    truly_available_amount: item.truly_available_amount,
    approval_required_threshold: item.approval_required_threshold,
    utilization_percentage: item.utilization_percentage,
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      date_incurred: new Date(),
      category: "",
      budget_item: undefined,
      notes: "",
    },
  })

  // Watch budget item and amount for validation summary
  const watchedBudgetItem = watch("budget_item")
  const watchedAmount = watch("amount")
  
  // Find selected budget item
  const selectedBudgetItem = (budgetItems as BudgetItem[]).find(
    item => item.id === watchedBudgetItem
  )
  
  // Validation states
  const exceedsAvailableBudget = selectedBudgetItem && 
    watchedAmount > selectedBudgetItem.truly_available_amount
    
  const requiresApproval = selectedBudgetItem && 
    selectedBudgetItem.approval_required_threshold && 
    watchedAmount > selectedBudgetItem.approval_required_threshold &&
    !exceedsAvailableBudget

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const selectedBudgetItem = (budgetItems as BudgetItem[]).find(item => item.id === data.budget_item);
      
      // Double-check validation before submission
      if (selectedBudgetItem && data.amount > selectedBudgetItem.truly_available_amount) {
        toast.error("Expense amount exceeds the truly available budget");
        return;
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

      // Set status based on approval requirements
      formData.append("status", requiresApproval ? "pending" : "draft")

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
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of the expense. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Budget Item Selection */}
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
                    // Reset amount when budget item changes
                    setValue("amount", 0);
                  }}
                  placeholder={
                    isLoadingBudgetItems 
                      ? "Loading budget items..." 
                      : "Select a budget item"
                  }
                  isLoading={isLoadingBudgetItems}
                  isClearable={false}
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.budget_item && (
              <p className="text-sm text-red-500">{errors.budget_item.message}</p>
            )}
          </div>

          {/* Budget Context Card */}
          {selectedBudgetItem && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Budget Context</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Total Budgeted:</span>
                  <p className="font-medium">
                    {formatCurrency(projectCurrencyCode, selectedBudgetItem.budgeted_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Truly Available:</span>
                  <p className="font-medium">
                    {formatCurrency(projectCurrencyCode, selectedBudgetItem.truly_available_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Current Utilization:</span>
                  <p className="font-medium">
                    {selectedBudgetItem.utilization_percentage}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Approval Threshold:</span>
                  <p className="font-medium">
                    {selectedBudgetItem.approval_required_threshold
                      ? formatCurrency(projectCurrencyCode, selectedBudgetItem.approval_required_threshold)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expense Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({projectCurrencyCode}) *</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                {...register("amount")} 
                disabled={!watchedBudgetItem}
                className={cn(
                  errors.amount || exceedsAvailableBudget ? "border-red-500" : ""
                )}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
              {exceedsAvailableBudget && (
                <p className="text-sm text-red-500">
                  Amount exceeds available budget
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_incurred">Date Incurred *</Label>
              <Controller
                control={control}
                name="date_incurred"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date_incurred && (
                <p className="text-sm text-red-500">{errors.date_incurred.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
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
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
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
                    isLoadingTeamMembers ? "Loading team members..." : "Select team member"
                  }
                  isLoading={isLoadingTeamMembers}
                  isClearable
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          {/* Validation Summary */}
          {selectedBudgetItem && watchedAmount > 0 && (
            <div className={cn(
              "p-4 rounded-lg border",
              exceedsAvailableBudget 
                ? "bg-red-50 border-red-200 text-red-700" 
                : requiresApproval
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-green-50 border-green-200 text-green-700"
            )}>
              <div className="flex items-center gap-2 font-medium">
                {exceedsAvailableBudget ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Exceeds Available Budget</span>
                  </>
                ) : requiresApproval ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Approval Required</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Within Budget Limits</span>
                  </>
                )}
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span>Expense Amount:</span>
                  <p className="font-medium">
                    {formatCurrency(projectCurrencyCode, watchedAmount)}
                  </p>
                </div>
                <div>
                  <span>Truly Available:</span>
                  <p className="font-medium">
                    {formatCurrency(projectCurrencyCode, selectedBudgetItem.truly_available_amount)}
                  </p>
                </div>
                <div>
                  <span>Current Utilization:</span>
                  <p className="font-medium">
                    {selectedBudgetItem.utilization_percentage}%
                  </p>
                </div>
                <div>
                  <span>After This Expense:</span>
                  <p className="font-medium">
                    {formatCurrency(
                      projectCurrencyCode, 
                      selectedBudgetItem.truly_available_amount - watchedAmount
                    )}
                  </p>
                </div>
              </div>
              
              {requiresApproval && selectedBudgetItem.approval_required_threshold && (
                <div className="mt-2 pt-2 border-t border-yellow-200">
                  <span>Approval Threshold: </span>
                  <span className="font-medium">
                    {formatCurrency(projectCurrencyCode, selectedBudgetItem.approval_required_threshold)}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || exceedsAvailableBudget}
              className={cn(
                exceedsAvailableBudget 
                  ? "bg-gray-400 hover:bg-gray-400" 
                  : "bg-primary hover:bg-primary-dark"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : requiresApproval ? (
                "Submit for Approval"
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