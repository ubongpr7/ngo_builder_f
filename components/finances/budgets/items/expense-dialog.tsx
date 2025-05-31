"use client"

import { useEffect } from "react"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, DollarSign, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/currency-utils"
import {
  useCreateOrganizationalExpenseMutation,
  useUpdateOrganizationalExpenseMutation,
} from "@/redux/features/finance/organizational-expenses"

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  expense_type: z.string().min(1, "Expense type is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expense_date: z.date({
    required_error: "Expense date is required",
  }),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetItem: any
  expense?: any
  onSuccess?: () => void
}

const EXPENSE_TYPES = [
  { value: "administrative", label: "Administrative" },
  { value: "operational", label: "Operational" },
  { value: "travel", label: "Travel" },
  { value: "equipment", label: "Equipment" },
  { value: "supplies", label: "Supplies" },
  { value: "services", label: "Services" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
]

export function ExpenseDialog({ open, onOpenChange, budgetItem, expense, onSuccess }: ExpenseDialogProps) {
  const isEditing = !!expense

  const [createExpense, { isLoading: isCreating }] = useCreateOrganizationalExpenseMutation()
  const [updateExpense, { isLoading: isUpdating }] = useUpdateOrganizationalExpenseMutation()

  const isLoading = isCreating || isUpdating

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      expense_type: "",
      amount: 0,
      expense_date: new Date(),
      vendor: "",
      notes: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (expense && open) {
      form.reset({
        title: expense.title || "",
        description: expense.description || "",
        expense_type: expense.expense_type || "",
        amount: Number.parseFloat(expense.amount) || 0,
        expense_date: expense.expense_date ? new Date(expense.expense_date) : new Date(),
        vendor: expense.vendor || "",
        notes: expense.notes || "",
      })
    } else if (!expense && open) {
      form.reset({
        title: "",
        description: "",
        expense_type: "",
        amount: 0,
        expense_date: new Date(),
        vendor: "",
        notes: "",
      })
    }
  }, [expense, open, form])

  const watchedAmount = form.watch("amount")
  const remainingBudget = Number.parseFloat(budgetItem?.remaining_amount || "0")
  const currentExpenseAmount = isEditing ? Number.parseFloat(expense?.amount || "0") : 0
  const availableAmount = remainingBudget + currentExpenseAmount

  const exceedsAvailableBudget = watchedAmount > availableAmount
  const requiresApproval =
    budgetItem?.approval_required_threshold && watchedAmount > Number.parseFloat(budgetItem.approval_required_threshold)

  const onSubmit = async (data: ExpenseFormData) => {
    if (exceedsAvailableBudget) {
      toast.error("Expense amount exceeds available budget")
      return
    }

    try {
      const payload = {
        budget_item: budgetItem.id,
        title: data.title,
        description: data.description,
        expense_type: data.expense_type,
        amount: data.amount,
        expense_date: format(data.expense_date, "yyyy-MM-dd"),
        vendor: data.vendor || "",
        notes: data.notes || "",
        currency: budgetItem.budget?.currency?.id,
        status: requiresApproval ? "pending" : "draft",
      }

      if (isEditing) {
        await updateExpense({
          id: expense.id,
          data: payload,
        }).unwrap()
        toast.success("Expense updated successfully!")
      } else {
        await createExpense(payload).unwrap()
        toast.success("Expense created successfully!")
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error("Expense error:", error)
      toast.error(error?.data?.message || error?.data?.detail || `Failed to ${isEditing ? "update" : "create"} expense`)
    }
  }

  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the expense details and amount" : "Create a new expense for this budget item"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Budget Item:</span>
                    <p className="font-medium">{budgetItem?.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Available Budget:</span>
                    <p className="font-medium text-green-600">{formatCurrency(currencyCode, availableAmount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Budgeted:</span>
                    <p className="font-medium">{formatCurrency(currencyCode, budgetItem?.budgeted_amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Already Spent:</span>
                    <p className="font-medium text-orange-600">
                      {formatCurrency(currencyCode, budgetItem?.spent_amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Expense title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expense_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Type *</FormLabel>
                    <FormControl>
                      <Controller
                        name="expense_type"
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <Select
                            {...controllerField}
                            options={EXPENSE_TYPES}
                            value={EXPENSE_TYPES.find((option) => option.value === controllerField.value)}
                            onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || "")}
                            placeholder="Select expense type"
                            isSearchable
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the expense..." className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({currencyCode}) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={cn(exceedsAvailableBudget && "border-red-500")}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {exceedsAvailableBudget && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Exceeds available budget
                      </div>
                    )}
                    {requiresApproval && !exceedsAvailableBudget && (
                      <div className="flex items-center gap-2 text-yellow-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Requires approval (above threshold)
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor/Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor or supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes or comments..." className="min-h-[60px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {watchedAmount > 0 && (
              <div
                className={cn(
                  "p-4 rounded-lg",
                  exceedsAvailableBudget ? "bg-red-50" : requiresApproval ? "bg-yellow-50" : "bg-green-50",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    exceedsAvailableBudget ? "text-red-700" : requiresApproval ? "text-yellow-700" : "text-green-700",
                  )}
                >
                  {exceedsAvailableBudget ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : requiresApproval ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {exceedsAvailableBudget
                      ? "Budget Exceeded"
                      : requiresApproval
                        ? "Approval Required"
                        : "Expense Valid"}
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm",
                    exceedsAvailableBudget ? "text-red-600" : requiresApproval ? "text-yellow-600" : "text-green-600",
                  )}
                >
                  <p>Expense Amount: {formatCurrency(currencyCode, watchedAmount)}</p>
                  <p>Available Budget: {formatCurrency(currencyCode, availableAmount)}</p>
                  {requiresApproval && (
                    <p>Approval Threshold: {formatCurrency(currencyCode, budgetItem?.approval_required_threshold)}</p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || exceedsAvailableBudget}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Expense" : "Create Expense"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
