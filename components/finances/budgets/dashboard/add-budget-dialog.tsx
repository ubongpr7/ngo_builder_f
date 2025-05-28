"use client"

import { useState, useEffect } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  Target,
  Building2,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useCreateBudgetMutation, useUpdateBudgetMutation } from "@/redux/features/finance/budgets"
import { toast } from "sonner"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import type { Budget } from "@/types/finance"
import { DateInput } from "@/components/ui/date-input"

const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  description: z.string().optional(),
  budget_type: z.enum(["project", "organizational", "departmental", "emergency", "marketing", "operational"]),
  status: z.enum(["draft", "pending_approval", "approved", "active", "completed", "cancelled"]),
  total_amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency_id: z.number().min(1, "Currency is required"),
  fiscal_year: z.number().min(2020).max(2030),
  start_date: z.date(),
  end_date: z.date(),
  department: z.string().optional(),
  project: z.string().optional(),
  approval_required: z.boolean().default(false),
  auto_approve_limit: z.number().optional(),
  notification_threshold: z.number().min(0).max(100).default(80),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface AddBudgetDialogProps {
  open: boolean
  onOpenChange: () => void
  onSuccess?: () => void
  budget?: Budget
}

export function AddBudgetDialog({ open, onOpenChange, onSuccess, budget }: AddBudgetDialogProps) {
  const [activeTab, setActiveTab] = useState("basic")

  const { data: currencies = [], isLoading: currenciesLoading } = useGetCurrenciesQuery()
  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation()
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation()
  const [selectedCurrency, setSelectedCurrency] = useState(null)

  const isEditing = !!budget
  const isLoading = isCreating || isUpdating

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      description: "",
      budget_type: "project",
      status: "draft",
      total_amount: 0,
      currency_id: 1,
      fiscal_year: new Date().getFullYear(),
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      department: "",
      project: "",
      approval_required: false,
      auto_approve_limit: 0,
      notification_threshold: 80,
    },
  })

  // Set default currency when currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !form.getValues("currency_id")) {
      form.setValue("currency_id", currencies[0].id)
    }
  }, [currencies, form])

  // Populate form when editing
  useEffect(() => {
    if (budget && open) {
      form.reset({
        name: budget.title || "",
        description: budget.description || "",
        budget_type: budget.budget_type || "project",
        status: budget.status || "draft",
        total_amount: Number.parseFloat(budget.total_amount) || 0,
        currency_id: budget.currency?.id || (currencies.length > 0 ? currencies[0].id : 1),
        fiscal_year: Number.parseInt(budget.fiscal_year) || new Date().getFullYear(),
        start_date: budget.start_date ? new Date(budget.start_date) : new Date(),
        end_date: budget.end_date ? new Date(budget.end_date) : new Date(),
        department: budget.department?.name || "",
        project: budget.project?.title || "",
        approval_required: budget.approval_required || false,
        auto_approve_limit: Number.parseFloat(budget.auto_approve_limit) || 0,
        notification_threshold: Number.parseInt(budget.notification_threshold) || 80,
      })
    }
  }, [budget, open, form, currencies])

  useEffect(() => {
    if (currencies.length > 0) {
      const currencyId = form.getValues("currency_id")
      const selected = currencies.find((c) => c.id === currencyId)
      setSelectedCurrency(selected || currencies[0])
    }
  }, [currencies, form.watch("currency_id")])

  const onSubmit = async (data: BudgetFormData) => {
    try {
      if (isEditing) {
        await updateBudget({ id: budget.id, ...data }).unwrap()
        toast.success("Budget updated successfully!")
        onSuccess?.()
        onOpenChange()
      } else {
        await createBudget(data).unwrap()
        toast.success("Budget created successfully!")
        onSuccess?.()
        onOpenChange()
      }
      form.reset()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save budget")
    }
  }

  const budgetTypes = [
    { value: "project", label: "Project Budget", icon: Target },
    { value: "organizational", label: "Organizational Budget", icon: Building2 },
    { value: "departmental", label: "Departmental Budget", icon: Users },
    { value: "emergency", label: "Emergency Budget", icon: AlertTriangle },
    { value: "marketing", label: "Marketing Budget", icon: FileText },
    { value: "operational", label: "Operational Budget", icon: Settings },
  ]

  const statusOptions = [
    { value: "draft", label: "Draft", color: "gray" },
    { value: "pending_approval", label: "Pending Approval", color: "yellow" },
    { value: "approved", label: "Approved", color: "blue" },
    { value: "active", label: "Active", color: "green" },
    { value: "completed", label: "Completed", color: "purple" },
    { value: "cancelled", label: "Cancelled", color: "red" },
  ]

  const departments = [
    "Programs & Services",
    "Operations",
    "Marketing & Outreach",
    "Administration",
    "Research & Development",
    "Emergency Response",
    "Finance & Accounting",
    "Human Resources",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isEditing ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the budget details and configuration"
              : "Set up a new budget with detailed configuration and tracking parameters"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="financial" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Education Program 2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budget_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {budgetTypes.map((type) => {
                                  const Icon = type.icon
                                  return (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the purpose and scope of this budget..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Provide a detailed description of what this budget covers</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
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
                        name="project"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project</FormLabel>
                            <FormControl>
                              <Input placeholder="Associated project (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="total_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount *</FormLabel>
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
                                {currenciesLoading ? (
                                  <SelectItem value="loading" disabled>
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading currencies...
                                    </div>
                                  </SelectItem>
                                ) : (
                                  currencies.map((currency: any) => (
                                    <SelectItem key={currency.id} value={currency.id.toString()}>
                                      {currency.code} - {currency.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fiscal_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiscal Year *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="2020"
                                max="2030"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number.parseInt(e.target.value) || new Date().getFullYear())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <DateInput
                                value={field.value}
                                onChange={field.onChange}
                                label=""
                                minDate={new Date("1900-01-01")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <DateInput
                                value={field.value}
                                onChange={field.onChange}
                                label=""
                                minDate={form.watch("start_date")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Budget Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          status.color === "gray"
                                            ? "#6b7280"
                                            : status.color === "yellow"
                                              ? "#f59e0b"
                                              : status.color === "blue"
                                                ? "#3b82f6"
                                                : status.color === "green"
                                                  ? "#10b981"
                                                  : status.color === "purple"
                                                    ? "#8b5cf6"
                                                    : "#ef4444",
                                      }}
                                    />
                                    {status.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="approval_required"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Approval Required</FormLabel>
                              <FormDescription>Require approval for expenses from this budget</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("approval_required") && (
                        <FormField
                          control={form.control}
                          name="auto_approve_limit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Auto-Approve Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Expenses below this amount will be auto-approved</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="notification_threshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Threshold (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 80)}
                            />
                          </FormControl>
                          <FormDescription>
                            Send notifications when budget utilization reaches this percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Budget Summary</h4>
                      <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          • Total Amount: {selectedCurrency?.code || "USD"}{" "}
                          {form.watch("total_amount")?.toLocaleString() || "0"}
                        </p>
                        <p>• Type: {budgetTypes.find((t) => t.value === form.watch("budget_type"))?.label}</p>
                        <p>
                          • Duration:{" "}
                          {form.watch("start_date") && form.watch("end_date")
                            ? `${Math.ceil((form.watch("end_date").getTime() - form.watch("start_date").getTime()) / (1000 * 60 * 60 * 24))} days`
                            : "Not set"}
                        </p>
                        <p>• Approval Required: {form.watch("approval_required") ? "Yes" : "No"}</p>
                        <p>• Notification at: {form.watch("notification_threshold")}% utilization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || currenciesLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Budget" : "Create Budget"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
