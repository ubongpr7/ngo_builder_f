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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, User, Lock, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import { useGetAdminUsersQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useUpdateBudgetItemMutation } from "@/redux/features/finance/budget-items"

const budgetItemEditSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  budgeted_amount: z.number().min(0.01, "Amount must be greater than 0"),
  responsible_person_id: z.number().optional(),
  approval_required_threshold: z.number().optional(),
  is_locked: z.boolean().default(false),
  notes: z.string().optional(),
})

type BudgetItemEditFormData = z.infer<typeof budgetItemEditSchema>

interface BudgetItemEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetItem: any
  onSuccess?: () => void
}

export function BudgetItemEditDialog({ open, onOpenChange, budgetItem, onSuccess }: BudgetItemEditDialogProps) {
  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery({})
  const [updateBudgetItem, { isLoading: isUpdating }] = useUpdateBudgetItemMutation()

  const form = useForm<BudgetItemEditFormData>({
    resolver: zodResolver(budgetItemEditSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      description: "",
      budgeted_amount: 0,
      responsible_person_id: undefined,
      approval_required_threshold: undefined,
      is_locked: false,
      notes: "",
    },
  })

  // Populate form when dialog opens
  useEffect(() => {
    if (budgetItem && open) {
      form.reset({
        category: budgetItem.category || "",
        subcategory: budgetItem.subcategory || "",
        description: budgetItem.description || "",
        budgeted_amount: Number.parseFloat(budgetItem.budgeted_amount) || 0,
        responsible_person_id: budgetItem.responsible_person?.id,
        approval_required_threshold: budgetItem.approval_required_threshold
          ? Number.parseFloat(budgetItem.approval_required_threshold)
          : undefined,
        is_locked: budgetItem.is_locked || false,
        notes: budgetItem.notes || "",
      })
    }
  }, [budgetItem, open, form])

  const watchedAmount = form.watch("budgeted_amount")
  const currentAmount = Number.parseFloat(budgetItem?.budgeted_amount || "0")
  const spentAmount = Number.parseFloat(budgetItem?.spent_amount || "0")
  const budgetRemaining = Number.parseFloat(budgetItem?.budget?.remaining_amount || "0")

  // Calculate available amount (current remaining + current item amount - spent amount)
  const availableAmount = budgetRemaining + currentAmount - spentAmount
  const exceedsAvailableBudget = watchedAmount > availableAmount
  const belowSpentAmount = watchedAmount < spentAmount

  const onSubmit = async (data: BudgetItemEditFormData) => {
    if (exceedsAvailableBudget) {
      toast.error("Budget amount exceeds available budget")
      return
    }

    if (belowSpentAmount) {
      toast.error("Budget amount cannot be less than already spent amount")
      return
    }

    try {
      const payload = {
        ...data,
        responsible_person_id: data.responsible_person_id || null,
        approval_required_threshold: data.approval_required_threshold || null,
        subcategory: data.subcategory || "",
        notes: data.notes || "",
      }

      await updateBudgetItem({
        id: budgetItem.id,
        data: payload,
      }).unwrap()

      toast.success("Budget item updated successfully!")
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Budget item update error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to update budget item")
    }
  }

  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name}`,
    email: user.email,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Budget Item
          </DialogTitle>
          <DialogDescription>Update budget item details. Note: Budget cannot be changed.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget Context - Read Only */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Context (Read Only)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-gray-600">Budget:</span>
                    <p className="font-medium">{budgetItem?.budget?.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Currency:</span>
                    <p className="font-medium">{currencyCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Already Spent:</span>
                    <p className="font-medium text-orange-600">{formatCurrency(currencyCode, spentAmount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Available for Allocation:</span>
                    <p className="font-medium text-green-600">{formatCurrency(currencyCode, availableAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this budget item covers..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budgeted_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budgeted Amount ({currencyCode}) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={cn((exceedsAvailableBudget || belowSpentAmount) && "border-red-500")}
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
                    {belowSpentAmount && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Cannot be less than spent amount
                      </div>
                    )}
                    <FormDescription>
                      Minimum: {formatCurrency(currencyCode, spentAmount)} (already spent)
                      <br />
                      Maximum: {formatCurrency(currencyCode, availableAmount)} (available)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approval_required_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Threshold ({currencyCode})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Expenses above this amount require approval</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignment & Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="responsible_person_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsible Person</FormLabel>
                    <FormControl>
                      <Controller
                        name="responsible_person_id"
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <Select
                            {...controllerField}
                            options={userOptions}
                            value={userOptions.find(
                              (option: { value: number }) => option.value === controllerField.value,
                            )}
                            onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || undefined)}
                            placeholder={usersLoading ? "Loading users..." : "Select responsible person"}
                            isSearchable
                            isLoading={usersLoading}
                            isDisabled={usersLoading}
                            isClearable
                            formatOptionLabel={(option: any) => (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <div>{option.label}</div>
                                  <div className="text-xs text-gray-500">{option.email}</div>
                                </div>
                              </div>
                            )}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_locked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Lock Budget Item
                      </FormLabel>
                      <FormDescription>Prevent further modifications to this budget item</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
                      <Textarea placeholder="Additional notes or instructions..." className="min-h-[60px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Validation Summary */}
            {watchedAmount > 0 && (
              <div
                className={cn(
                  "p-4 rounded-lg",
                  exceedsAvailableBudget || belowSpentAmount ? "bg-red-50" : "bg-green-50",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    exceedsAvailableBudget || belowSpentAmount ? "text-red-700" : "text-green-700",
                  )}
                >
                  {exceedsAvailableBudget || belowSpentAmount ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {exceedsAvailableBudget || belowSpentAmount ? "Invalid Amount" : "Valid Amount"}
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm",
                    exceedsAvailableBudget || belowSpentAmount ? "text-red-600" : "text-green-600",
                  )}
                >
                  <p>New Amount: {formatCurrency(currencyCode, watchedAmount)}</p>
                  <p>Already Spent: {formatCurrency(currencyCode, spentAmount)}</p>
                  <p>Available Budget: {formatCurrency(currencyCode, availableAmount)}</p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating || exceedsAvailableBudget || belowSpentAmount}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Budget Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
