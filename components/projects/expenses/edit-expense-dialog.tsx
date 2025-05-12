"use client"

import { useState, useEffect } from "react"
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
import { useUpdateExpenseMutation } from "@/redux/features/projects/expenseApiSlice"
import { Loader2, Download, FileText, Eye } from "lucide-react"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date_incurred: z.date({
    required_error: "Date is required",
    invalid_type_error: "Date is required",
  }),
  category: z.string().min(1, "Category is required"),
  receipt: z.union([z.instanceof(File), z.string()]).optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Define expense categories
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

interface EditExpenseDialogProps {
  projectId: number
  expense: any // Use the actual type from your API
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditExpenseDialog({ projectId, expense, open, onOpenChange, onSuccess }: EditExpenseDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateExpense] = useUpdateExpenseMutation()
  const [viewingReceipt, setViewingReceipt] = useState(false)

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
      notes: "",
    },
  })

  // Set form values when expense changes
  useEffect(() => {
    if (expense && open) {
      setValue("title", expense.title)
      setValue("description", expense.description)
      setValue("amount", expense.amount)
      setValue("date_incurred", new Date(expense.date_incurred))
      setValue("category", expense.category)
      setValue("notes", expense.notes || "")

      // For receipt, we just keep the existing one unless changed
      if (expense.receipt) {
        setValue("receipt", expense.receipt)
      }
    }
  }, [expense, open, setValue])

  const onSubmit = async (data: FormValues) => {
    if (!expense) return

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

      // Keep the original incurred_by
      if (expense.incurred_by) {
        formData.append("incurred_by", expense.incurred_by.toString())
      }

      // Only append receipt if it's a File object (new upload)
      if (data.receipt instanceof File) {
        formData.append("receipt", data.receipt)
      }

      if (data.notes) {
        formData.append("notes", data.notes)
      }

      // Keep the current status
      formData.append("status", expense.status)

      await updateExpense({ id: expense.id, expense: formData }).unwrap()

      toast({
        title: "Expense Updated",
        description: "The expense has been successfully updated.",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if receipt URL is an image or PDF
  const receiptUrl = expense?.receipt || ""
  const isImage = receiptUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null
  const isPdf = receiptUrl.match(/\.(pdf)$/i) !== null

  const handleDownload = () => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[550px]">
        {viewingReceipt ? (
          <>
            <DialogHeader>
              <DialogTitle>Receipt for {expense.title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-4">
              {!receiptUrl && (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <FileText className="h-16 w-16 mb-4" />
                  <p>No receipt available</p>
                </div>
              )}

              {isImage && receiptUrl && (
                <img
                  src={receiptUrl || "/placeholder.svg"}
                  alt={`Receipt for ${expense.title}`}
                  className="max-w-full max-h-[60vh] object-contain border rounded"
                />
              )}

              {isPdf && receiptUrl && (
                <div className="flex flex-col items-center justify-center p-8">
                  <FileText className="h-16 w-16 mb-4 text-red-500" />
                  <p className="mb-4">PDF Receipt</p>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              )}

              {receiptUrl && !isImage && !isPdf && (
                <div className="flex flex-col items-center justify-center p-8">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="mb-4">Receipt File</p>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingReceipt(false)}>
                Back to Edit
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>
                Update the details of the expense. All fields marked with * are required.
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
                    render={({ field }) => (
                      <DateInput id="date_incurred" value={field.value} onChange={field.onChange} />
                    )}
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

              {/* Display who incurred the expense as read-only */}
              <div className="space-y-2">
                <Label>Incurred By</Label>
                <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {expense?.incurred_by_details?.first_name?.[0] || ""}
                    {expense?.incurred_by_details?.last_name?.[0] || ""}
                  </div>
                  <div>
                    <p className="font-medium">
                      {expense?.incurred_by_details?.first_name} {expense?.incurred_by_details?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense?.incurred_by_details?.email || expense?.incurred_by_details?.username}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">The person who incurred this expense cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt</Label>
                {expense?.receipt_url && (
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingReceipt(true)}
                      className="text-blue-600"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Current Receipt
                    </Button>
                  </div>
                )}
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
                <p className="text-xs text-gray-500">Upload a new receipt to replace the current one (optional)</p>
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
                      Updating...
                    </>
                  ) : (
                    "Update Expense"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
