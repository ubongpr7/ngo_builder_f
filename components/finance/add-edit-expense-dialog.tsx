"use client"

import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Plus, Edit2 } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField } from "@/components/ui/react-select-field"
import {
  useCreateOrganizationalExpenseMutation,
  useUpdateOrganizationalExpenseMutation,
  useGetAllBudgetsQuery,
} from "@/redux/features/finance/financeApiSlice"
import type { OrganizationalExpense } from "@/types/finance"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Amount must be a positive number" }),
  expense_date: z.date({
    required_error: "Expense date is required",
  }),
  expense_type: z.string().min(1, { message: "Expense type is required" }),
  category: z.string().optional(),
  vendor: z.string().optional(),
  budget_item: z.string().optional(),
  receipt_url: z.string().optional(),
  notes: z.string().optional(),
})

interface AddEditExpenseDialogProps {
  expense?: OrganizationalExpense
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditExpenseDialog({ expense, onSuccess, trigger }: AddEditExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [createExpense, { isLoading: isCreating }] = useCreateOrganizationalExpenseMutation()
  const [updateExpense, { isLoading: isUpdating }] = useUpdateOrganizationalExpenseMutation()
  const { data: budgets = [] } = useGetAllBudgetsQuery("")
  const isLoading = isCreating || isUpdating
  const isEditing = !!expense

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: expense?.title || "",
      description: expense?.description || "",
      amount: expense?.amount?.toString() || "",
      expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
      expense_type: expense?.expense_type || "operational",
      category: expense?.category || "",
      vendor: expense?.vendor || "",
      budget_item: expense?.budget_item?.toString() || "",
      receipt_url: expense?.receipt_url || "",
      notes: expense?.notes || "",
    },
  })

  // Prepare expense type options
  const expenseTypeOptions = [
    { value: "operational", label: "Operational" },
    { value: "administrative", label: "Administrative" },
    { value: "program", label: "Program" },
    { value: "fundraising", label: "Fundraising" },
    { value: "capital", label: "Capital" },
    { value: "other", label: "Other" },
  ]

  // Prepare category options
  const categoryOptions = [
    { value: "office_supplies", label: "Office Supplies" },
    { value: "travel", label: "Travel" },
    { value: "utilities", label: "Utilities" },
    { value: "rent", label: "Rent" },
    { value: "marketing", label: "Marketing" },
    { value: "equipment", label: "Equipment" },
    { value: "professional_services", label: "Professional Services" },
    { value: "other", label: "Other" },
  ]

  // Prepare budget options
  const budgetOptions =
    budgets?.map((budget: any) => ({
      value: budget?.id?.toString(),
      label: budget?.title || budget?.name,
    })) || []

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        ...values,
        amount: Number(values.amount),
        expense_date: format(values.expense_date, "yyyy-MM-dd"),
        budget_item: values.budget_item ? Number(values.budget_item) : null,
      }

      if (isEditing && expense) {
        await updateExpense({
          id: expense.id,
          expense: submitData,
        }).unwrap()
        toast.success("Expense updated successfully")
      } else {
        await createExpense(submitData).unwrap()
        toast.success("Expense created successfully")
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to save expense:", error)
      toast.error(`Failed to ${isEditing ? "update" : "create"} expense. Please try again.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {isEditing ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Expense
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the expense details below."
              : "Add a new organizational expense. Fill out the form below to record an expense."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Expense title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the expense" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                      <FormLabel>Expense Date</FormLabel>
                      <FormControl>
                        <DateInput value={field.value} onChange={field.onChange} label="" id="expense-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="expense_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Type</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={expenseTypeOptions}
                          placeholder="Select type"
                          value={expenseTypeOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={categoryOptions}
                          placeholder="Select category"
                          value={categoryOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                          isClearable
                        />
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
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor or supplier name" {...field} />
                    </FormControl>
                    <FormDescription>Optional. Name of the vendor or supplier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="budget_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Item</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        options={budgetOptions}
                        placeholder="Select budget item"
                        value={budgetOptions.find((option) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option ? option.value : "")}
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Optional. Link to a budget item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receipt_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>Optional. Link to receipt or invoice</FormDescription>
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
                      <Textarea placeholder="Additional notes about this expense" {...field} />
                    </FormControl>
                    <FormDescription>Optional. Add any additional notes or context.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Expense" : "Add Expense"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
