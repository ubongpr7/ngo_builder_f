"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Select from "react-select"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Calendar, DollarSign, FileText, Receipt, Upload } from "lucide-react"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"
import { useCreateOrganizationalExpenseMutation } from "@/redux/features/finance/organizational-expenses"
import { formatCurrency } from "@/lib/currency-utils"

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expense_date: z.string().min(1, "Expense date is required"),
  expense_type: z.enum(["operational", "capital", "emergency", "travel", "training", "other"]),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  receipt: z.any().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  budgetItem: any
  currencyCode: string
}

const expenseTypeOptions = [
  { value: "operational", label: "Operational" },
  { value: "capital", label: "Capital" },
  { value: "emergency", label: "Emergency" },
  { value: "travel", label: "Travel" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
]

export function AddExpenseDialog({ open, onOpenChange, onSuccess, budgetItem, currencyCode }: AddExpenseDialogProps) {
  const [createExpense, { isLoading: isCreating }] = useCreateOrganizationalExpenseMutation()

  const remainingAmount = Number.parseFloat(budgetItem?.remaining_amount || "0")
  const approvalThreshold = Number.parseFloat(budgetItem?.approval_required_threshold || "0")

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      expense_date: new Date().toISOString().split("T")[0],
      expense_type: "operational",
      vendor: "",
      notes: "",
    },
  })

  const onSubmit = async (data: ExpenseFormData) => {
    if (data.amount > remainingAmount) {
      toast.error(`Amount cannot exceed remaining budget of ${formatCurrency(currencyCode, remainingAmount)}`)
      return
    }

    try {
      const formData = new FormData()

      // Add all form fields
      formData.append("title", data.title)
      formData.append("amount", data.amount.toString())
      formData.append("expense_date", data.expense_date)
      formData.append("expense_type", data.expense_type)
      formData.append("budget_item", budgetItem.id.toString())
      formData.append("currency", budgetItem.budget.currency.id.toString())

      if (data.description) formData.append("description", data.description)
      if (data.vendor) formData.append("vendor", data.vendor)
      if (data.notes) formData.append("notes", data.notes)
      if (data.receipt) formData.append("receipt", data.receipt)

      await createExpense(formData).unwrap()

      toast.success("Expense created successfully!")
      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error("Expense creation error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to create expense")
    }
  }

  const watchedAmount = form.watch("amount")
  const exceedsRemaining = watchedAmount > remainingAmount
  const requiresApproval = approvalThreshold > 0 && watchedAmount > approvalThreshold

  // Custom styles for React Select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
      color: state.isSelected ? "white" : "#374151",
    }),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Add New Expense
          </DialogTitle>
          <DialogDescription>Create a new expense for budget item: {budgetItem?.category}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget Overview */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Remaining Budget</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(currencyCode, remainingAmount)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Approval Required Above</div>
                    <div className="text-lg font-semibold text-orange-600">
                      {approvalThreshold > 0 ? formatCurrency(currencyCode, approvalThreshold) : "No limit"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Expense Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brief description of the expense" />
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
                                options={expenseTypeOptions}
                                value={expenseTypeOptions.find((option) => option.value === controllerField.value)}
                                onChange={(selectedOption) => controllerField.onChange(selectedOption?.value)}
                                placeholder="Select expense type"
                                styles={selectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Detailed description of the expense..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ({currencyCode}) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={remainingAmount}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                              className={cn("pl-10", exceedsRemaining && "border-red-500 focus-visible:ring-red-500")}
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
                        {exceedsRemaining && (
                          <p className="text-sm text-red-600">
                            Amount exceeds remaining budget of {formatCurrency(currencyCode, remainingAmount)}
                          </p>
                        )}
                        {requiresApproval && (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">This expense will require approval</span>
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
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input {...field} type="date" className="pl-10" />
                          </div>
                        </FormControl>
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
                        <Input {...field} placeholder="Name of vendor or supplier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="text-lg font-medium">Additional Information</h3>

                <FormField
                  control={form.control}
                  name="receipt"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Receipt/Document</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            {...field}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              onChange(file)
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <Upload className="h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Upload receipt or supporting document (PDF, DOC, or image files)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes or comments..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status Information */}
            {requiresApproval && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Approval Required</span>
                  </div>
                  <p className="mt-2 text-sm text-yellow-700">
                    This expense exceeds the approval threshold of {formatCurrency(currencyCode, approvalThreshold)}. It
                    will be submitted for approval and cannot be processed until approved.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || exceedsRemaining || watchedAmount <= 0} className="gap-2">
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    Create Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
