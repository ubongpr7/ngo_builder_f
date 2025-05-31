"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Select from "react-select"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, DollarSign, Edit } from "lucide-react"
import { toast } from "react-toastify"
import { useUpdateOrganizationalExpenseMutation } from "@/redux/features/finance/organizational-expenses"

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expense_date: z.string().min(1, "Expense date is required"),
  expense_type: z.enum(["operational", "capital", "emergency", "travel", "training", "other"]),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface EditExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  expense: any
}

const expenseTypeOptions = [
  { value: "operational", label: "Operational" },
  { value: "capital", label: "Capital" },
  { value: "emergency", label: "Emergency" },
  { value: "travel", label: "Travel" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
]

export function EditExpenseDialog({ open, onOpenChange, onSuccess, expense }: EditExpenseDialogProps) {
  const [updateExpense, { isLoading: isUpdating }] = useUpdateOrganizationalExpenseMutation()

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      expense_date: "",
      expense_type: "operational",
      vendor: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (expense && open) {
      form.reset({
        title: expense.title || "",
        description: expense.description || "",
        amount: Number.parseFloat(expense.amount) || 0,
        expense_date: expense.expense_date || "",
        expense_type: expense.expense_type || "operational",
        vendor: expense.vendor || "",
        notes: expense.notes || "",
      })
    }
  }, [expense, open, form])

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await updateExpense({
        id: expense.id,
        data: {
          ...data,
          description: data.description || "",
          vendor: data.vendor || "",
          notes: data.notes || "",
        },
      }).unwrap()

      toast.success("Expense updated successfully!")
      onSuccess?.()
    } catch (error: any) {
      console.error("Expense update error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to update expense")
    }
  }

  const currencyCode = expense?.currency?.code || "USD"

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
            <Edit className="h-5 w-5" />
            Edit Expense
          </DialogTitle>
          <DialogDescription>Update the expense details</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            className="pl-10"
                            placeholder="0.00"
                          />
                        </div>
                      </FormControl>
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
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="gap-2">
                {isUpdating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Update Expense
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
