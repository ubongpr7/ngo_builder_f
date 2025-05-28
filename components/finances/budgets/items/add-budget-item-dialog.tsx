"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, User, Lock, CheckCircle, Target, FileText, Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { BudgetItem} from "@/types/finance"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetAdminUsersQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useCreateBudgetItemMutation, useUpdateBudgetItemMutation } from "@/redux/features/finance/budget-items"

const budgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  budgeted_amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency_id: z.number().min(1, "Currency is required"),
  responsible_person_id: z.number().optional(),
  approval_required_threshold: z.number().optional(),
  is_locked: z.boolean().default(false),
  notes: z.string().optional(),
})

type BudgetItemFormData = z.infer<typeof budgetItemSchema>

interface AddBudgetItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  budgetId: number
  budgetItem?: BudgetItem
  budgetCurrency: {
    id: number
    code: string
  }
}

export function AddBudgetItemDialog({
  open,
  onOpenChange,
  onSuccess,
  budgetId,
  budgetItem,
  budgetCurrency,
}: AddBudgetItemDialogProps) {
  const isEditing = !!budgetItem

  const { data: currencies = [], isLoading: currenciesLoading } = useGetCurrenciesQuery()
  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery()

  const [createBudgetItem, { isLoading: isCreating }] = useCreateBudgetItemMutation()
  const [updateBudgetItem, { isLoading: isUpdating }] = useUpdateBudgetItemMutation()

  const isLoading = isCreating || isUpdating

  const form = useForm<BudgetItemFormData>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      description: "",
      budgeted_amount: 0,
      currency_id: budgetCurrency.id,
      responsible_person_id: undefined,
      approval_required_threshold: undefined,
      is_locked: false,
      notes: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (budgetItem && open) {
      form.reset({
        category: budgetItem.category || "",
        subcategory: budgetItem.subcategory || "",
        description: budgetItem.description || "",
        budgeted_amount: Number.parseFloat(budgetItem.budgeted_amount) || 0,
        currency_id: budgetItem.currency?.id || budgetCurrency.id,
        responsible_person_id: budgetItem.responsible_person?.id,
        approval_required_threshold: budgetItem.approval_required_threshold
          ? Number.parseFloat(budgetItem.approval_required_threshold)
          : undefined,
        is_locked: budgetItem.is_locked || false,
        notes: budgetItem.notes || "",
      })
    }
  }, [budgetItem, open, form, budgetCurrency.id])

  const onSubmit = async (data: BudgetItemFormData) => {
    try {
      const payload = {
        budget: budgetId,
        ...data,
        // Convert undefined to null for API
        responsible_person_id: data.responsible_person_id || null,
        approval_required_threshold: data.approval_required_threshold || null,
        subcategory: data.subcategory || "",
        notes: data.notes || "",
      }

      if (isEditing) {
        await updateBudgetItem({
          id: budgetItem.id,
          data:payload,
        }).unwrap()
        toast.success("Budget item updated successfully!")
      } else {
        await createBudgetItem(payload).unwrap()
        toast.success("Budget item created successfully!")
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error("Budget item error:", error)
      toast.error(
        error?.data?.message || error?.data?.detail || `Failed to ${isEditing ? "update" : "create"} budget item`,
      )
    }
  }

  const categories = [
    "Personnel & Salaries",
    "Program Expenses",
    "Administrative Costs",
    "Equipment & Supplies",
    "Travel & Transportation",
    "Training & Development",
    "Marketing & Outreach",
    "Technology & Software",
    "Facilities & Utilities",
    "Professional Services",
    "Emergency Response",
    "Research & Development",
  ]

  const subcategories: Record<string, string[]> = {
    "Personnel & Salaries": ["Full-time Staff", "Part-time Staff", "Consultants", "Benefits", "Overtime"],
    "Program Expenses": ["Direct Services", "Materials", "Beneficiary Support", "Program Activities"],
    "Administrative Costs": ["Office Supplies", "Communications", "Insurance", "Legal Fees"],
    "Equipment & Supplies": ["Office Equipment", "Program Equipment", "Maintenance", "Consumables"],
    "Travel & Transportation": ["Local Travel", "International Travel", "Vehicle Costs", "Accommodation"],
    "Training & Development": ["Staff Training", "Capacity Building", "Workshops", "Conferences"],
    "Marketing & Outreach": ["Advertising", "Events", "Publications", "Digital Marketing"],
    "Technology & Software": ["Software Licenses", "Hardware", "IT Support", "Cloud Services"],
    "Facilities & Utilities": ["Rent", "Utilities", "Maintenance", "Security"],
    "Professional Services": ["Accounting", "Legal", "Consulting", "Audit"],
    "Emergency Response": ["Emergency Supplies", "Rapid Response", "Crisis Management"],
    "Research & Development": ["Research Activities", "Innovation", "Pilot Programs", "Evaluation"],
  }

  const selectedCategory = form.watch("category")
  const budgetedAmount = form.watch("budgeted_amount")
  const selectedCurrency = currencies.find((c: any) => c.id === form.watch("currency_id"))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {isEditing ? "Edit Budget Item" : "Add Budget Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the budget item details and configuration"
              : "Create a new budget item with detailed tracking parameters"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCategory}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory &&
                              subcategories[selectedCategory]?.map((subcategory) => (
                                <SelectItem key={subcategory} value={subcategory}>
                                  {subcategory}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
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
                        <Textarea
                          placeholder="Describe what this budget item covers..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a clear description of what expenses this item will cover
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="budgeted_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budgeted Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value?.toString()}
                          disabled={currenciesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={currenciesLoading ? "Loading..." : "Select currency"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency: any) => (
                              <SelectItem key={currency.id} value={currency.id.toString()}>
                                {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="approval_required_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Threshold</FormLabel>
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

                {budgetedAmount > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">
                        Budget Allocation: {selectedCurrency?.code || budgetCurrency.code}{" "}
                        {budgetedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Assignment & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="responsible_person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsible Person</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value?.toString()}
                        disabled={usersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={usersLoading ? "Loading users..." : "Select responsible person"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usersLoading ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading users...
                              </div>
                            </SelectItem>
                          ) : (
                            users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <div>
                                      {user.first_name} {user.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Person responsible for managing this budget item</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

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
                        <FormDescription>Prevent modifications to this budget item</FormDescription>
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
                        <Textarea
                          placeholder="Additional notes or instructions..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Budget Item Summary</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>• Category: {form.watch("category") || "Not selected"}</p>
                    <p>
                      • Amount: {selectedCurrency?.code || budgetCurrency.code} {(budgetedAmount || 0).toLocaleString()}
                    </p>
                    <p>• Locked: {form.watch("is_locked") ? "Yes" : "No"}</p>
                    <p>• Approval Required: {form.watch("approval_required_threshold") ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Item" : "Create Item"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
