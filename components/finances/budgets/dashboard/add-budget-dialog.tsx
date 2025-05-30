"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Select from 'react-select'
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  BookOpen,
  Briefcase,
  HeartHandshake,
  PartyPopper,
  PenToolIcon as Tool,
  ShieldAlert,
} from "lucide-react"
import { useCreateBudgetMutation, useUpdateBudgetMutation } from "@/redux/features/finance/budgets"
import { toast } from "react-toastify"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetProjectsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetDepartmentsQuery } from "@/redux/features/profile/readProfileAPISlice"
import type { Budget } from "@/types/finance"
import { DateInput } from "@/components/ui/date-input"
import { format } from "date-fns"

const budgetSchema = z.object({
  title: z.string().min(1, "Budget title is required"),
  description: z.string().optional(),
  budget_type: z.enum([
    "project",
    "organizational",
    "departmental",
    "program",
    "emergency",
    "capacity_building",
    "advocacy",
    "research",
    "partnership",
    "event",
    "maintenance",
    "contingency",
  ]),
  status: z.enum(["draft", "pending_approval", "approved", "active", "completed", "cancelled"]),
  total_amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency_id: z.number().min(1, "Currency is required"),
  fiscal_year: z.string().optional(),
  start_date: z.date(),
  end_date: z.date(),
  project_id: z.number().optional().nullable(),
  department_id: z.number().optional().nullable(),
  notes: z.string().optional(),
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
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery({})
  const { data: departments = [], isLoading: departmentsLoading } = useGetDepartmentsQuery('')
  
  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation()
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation()
  const [selectedCurrency, setSelectedCurrency] = useState(null)

  const isEditing = !!budget
  const isLoading = isCreating || isUpdating

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      title: "",
      description: "",
      budget_type: "project",
      status: "draft",
      total_amount: 0,
      currency_id: 1,
      fiscal_year: new Date().getFullYear().toString(),
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      project_id: null,
      department_id: null,
      notes: "",
    },
  })

  useEffect(() => {
    if (currencies.length > 0 && !form.getValues("currency_id")) {
      form.setValue("currency_id", currencies[0].id)
    }
  }, [currencies, form])

  // Populate form when editing
  useEffect(() => {
    if (budget && open) {
      form.reset({
        title: budget.title || "",
        description: budget.description || "",
        budget_type: budget.budget_type || "project",
        status: budget.status || "draft",
        total_amount: Number.parseFloat(budget.total_amount) || 0,
        currency_id: budget.currency?.id || (currencies.length > 0 ? currencies[0].id : 1),
        fiscal_year: budget.fiscal_year || new Date().getFullYear().toString(),
        start_date: budget.start_date ? new Date(budget.start_date) : new Date(),
        end_date: budget.end_date ? new Date(budget.end_date) : new Date(),
        project_id: budget.project?.id || null,
        department_id: budget.department?.id || null,
        notes: budget.notes || "",
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
      // Format dates for API
      const formattedData = {
        ...data,
        start_date: data.start_date ? format(data.start_date, "yyyy-MM-dd") : undefined,
        end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : undefined,
      }

      if (isEditing) {
        await updateBudget({ id: budget.id, data: formattedData }).unwrap()
        toast.success("Budget updated successfully!")
        onSuccess?.()
        onOpenChange()
      } else {
        await createBudget(formattedData).unwrap()
        toast.success("Budget created successfully!")
        onSuccess?.()
        onOpenChange()
      }
      form.reset()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.data?.message || "Failed to save budget")
    }
  }

  const budgetTypes = [
    { value: "project", label: "Project", icon: Target },
    { value: "organizational", label: "Organizational", icon: Building2 },
    { value: "departmental", label: "Departmental", icon: Users },
    { value: "program", label: "Program", icon: BookOpen },
    { value: "emergency", label: "Emergency Response", icon: AlertTriangle },
    { value: "capacity_building", label: "Capacity Building", icon: Users },
    { value: "advocacy", label: "Advocacy & Policy", icon: FileText },
    { value: "research", label: "Research & Development", icon: Briefcase },
    { value: "partnership", label: "Partnership", icon: HeartHandshake },
    { value: "event", label: "Event", icon: PartyPopper },
    { value: "maintenance", label: "Maintenance & Operations", icon: Tool },
    { value: "contingency", label: "Contingency", icon: ShieldAlert },
  ]

  const statusOptions = [
    { value: "draft", label: "Draft", color: "#6b7280" },
    { value: "pending_approval", label: "Pending Approval", color: "#f59e0b" },
    { value: "approved", label: "Approved", color: "#3b82f6" },
    { value: "active", label: "Active", color: "#10b981" },
    { value: "completed", label: "Completed", color: "#8b5cf6" },
    { value: "cancelled", label: "Cancelled", color: "#ef4444" },
  ]

  // Format budget type options with icons
  const formatBudgetTypeOption = (option: any, { context }: any) => {
    const type = budgetTypes.find(bt => bt.value === option.value);
    if (context === 'menu') {
      return (
        <div className="flex items-center gap-2">
          {type && <type.icon className="h-4 w-4" />}
          {option.label}
        </div>
      );
    }
    return option.label;
  };

  // Format status options with colored dots
  const formatStatusOption = (option: any, { context }: any) => {
    if (context === 'menu') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
          {option.label}
        </div>
      );
    }
    return option.label;
  };

  // Project options with "None" option
  const projectOptions = [
    { value: null, label: "None" },
    ...(projects || []).map((project: any) => ({
      value: project.id,
      label: project.title
    }))
  ];

  // Department options with "None" option
  const departmentOptions = [
    { value: null, label: "None" },
    ...(departments || []).map((department: any) => ({
      value: department.id,
      label: department.name
    }))
  ];

  // Currency options
  const currencyOptions = (currencies || []).map((currency: any) => ({
    value: currency.id,
    label: `${currency.code} - ${currency.name}`
  }));

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
                <TabsTrigger value="details" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Details
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
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Title *</FormLabel>
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
                            <FormControl>
                              <Select
                                options={budgetTypes.map(bt => ({ value: bt.value, label: bt.label }))}
                                value={budgetTypes
                                  .map(bt => ({ value: bt.value, label: bt.label }))
                                  .find(option => option.value === field.value)}
                                onChange={(option) => field.onChange(option?.value)}
                                formatOptionLabel={formatBudgetTypeOption}
                                placeholder="Select budget type"
                                className="w-full"
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
                        name="project_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project</FormLabel>
                            <FormControl>
                              <Select
                                options={projectOptions}
                                value={projectOptions.find(option => option.value === field.value)}
                                onChange={(option) => field.onChange(option?.value)}
                                placeholder="Select project (optional)"
                                isLoading={projectsLoading}
                                isDisabled={projectsLoading}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Select
                                options={departmentOptions}
                                value={departmentOptions.find(option => option.value === field.value)}
                                onChange={(option) => field.onChange(option?.value)}
                                placeholder="Select department (optional)"
                                isLoading={departmentsLoading}
                                isDisabled={departmentsLoading}
                                className="w-full"
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
                            <FormControl>
                              <Select
                                options={currencyOptions}
                                value={currencyOptions.find(option => option.value === field.value)}
                                onChange={(option) => field.onChange(option?.value)}
                                placeholder={currenciesLoading ? "Loading..." : "Select currency"}
                                isLoading={currenciesLoading}
                                isDisabled={currenciesLoading}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fiscal_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiscal Year</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2024 or 2023-2024" {...field} />
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

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select
                              options={statusOptions}
                              value={statusOptions.find(option => option.value === field.value)}
                              onChange={(option) => field.onChange(option?.value)}
                              formatOptionLabel={formatStatusOption}
                              placeholder="Select status"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about this budget..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Add any additional information, constraints, or special instructions
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
                        <p>• Status: {statusOptions.find((s) => s.value === form.watch("status"))?.label}</p>
                        <p>• Fiscal Year: {form.watch("fiscal_year") || "Not specified"}</p>
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