"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField, type SelectOption } from "@/components/ui/react-select-field"
import {
  useCreateProjectMutation,
  useGetProjectsCategoriesQuery,
  useGetManagerCeoQuery,
} from "@/redux/features/projects/projectsAPISlice"
import { format } from "date-fns"
import { debounce } from "lodash"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "../permissionHander"
import { toast } from "react-toastify"

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  project_type: z.string().min(1, { message: "Project type is required" }),
  category: z.string().optional(),
  manager: z.string().min(1, { message: "Manager is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  start_date: z.date({ required_error: "Start date is required" }),
  target_end_date: z.date({ required_error: "End date is required" }),
  budget: z
    .string()
    .min(1, { message: "Budget is required" })
    .transform((val) => Number.parseFloat(val)),
  beneficiaries: z.string().optional(),
  success_criteria: z.string().optional(),
  risks: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export function AddProjectDialog() {
  const [open, setOpen] = useState(false)
  const [createProject, { isLoading }] = useCreateProjectMutation()
  const { data: categoriesData = [] } = useGetProjectsCategoriesQuery()

  const [managerSearchTerm, setManagerSearchTerm] = useState("")
  const { data: managersData = [], isLoading: isLoadingManagers } = useGetManagerCeoQuery(managerSearchTerm)

  const categoryOptions: SelectOption[] = categoriesData.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }))

  // Transform managers data to select options
  const managerOptions: SelectOption[] = managersData.map(
    (manager: { id: number; first_name: string; last_name: string; email: string }) => ({
      value: manager.id.toString(),
      label: `${manager.first_name} ${manager.last_name} (${manager.email})`,
    }),
  )

  // Project type options based on backend choices
  const projectTypeOptions: SelectOption[] = [
    { value: "profit", label: "Profit" },
    { value: "non_profit", label: "Non-Profit" },
    { value: "community", label: "Community" },
    { value: "internal", label: "Internal" },
  ]

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      project_type: "",
      category: "",
      manager: "",
      location: "",
      beneficiaries: "",
      success_criteria: "",
      risks: "",
    },
  })

  // Debounced search handler for manager field
  const debouncedManagerSearch = debounce((inputValue: string) => {
    setManagerSearchTerm(inputValue)
  }, 300)

  // Handle manager search input
  const handleManagerInputChange = (inputValue: string) => {
    debouncedManagerSearch(inputValue)
  }

  async function onSubmit(data: ProjectFormValues) {
    try {
      // Format dates to ISO string format (YYYY-MM-DD)
      const formattedData = {
        ...data,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        target_end_date: format(data.target_end_date, "yyyy-MM-dd"),
        status: "planning",
        funds_allocated: 0,
        funds_spent: 0,
      }

      await createProject(formattedData).unwrap()
      toast.success( "Your project has been created successfully.")      

      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error('An error occurred while creating the project.')
    }
  }

  // Get the current start date from the form
  const startDate = form.watch("start_date")
  const today = new Date()

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedManagerSearch.cancel()
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="create-project-form">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-title">Title *</FormLabel>
                  <FormControl>
                    <Input id="project-title" placeholder="Project title" {...field} />
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
                  <FormLabel htmlFor="project-description">Description *</FormLabel>
                  <FormControl>
                    <Textarea id="project-description" placeholder="Project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="project-type">Project Type *</FormLabel>
                    <FormControl>
                      <Controller
                        name="project_type"
                        control={form.control}
                        render={({ field }) => (
                          <ReactSelectField
                            inputId="project-type"
                            options={projectTypeOptions}
                            placeholder="Select project type"
                            value={projectTypeOptions.find((option) => option.value === field.value)}
                            onChange={(option) => field.onChange(option ? (option as SelectOption).value : "")}
                            error={form.formState.errors.project_type?.message}
                            isSearchable
                            isClearable
                            aria-labelledby="project-type-label"
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage id="project-type-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="project-category">Category</FormLabel>
                    <FormControl>
                      <Controller
                        name="category"
                        control={form.control}
                        render={({ field }) => (
                          <ReactSelectField
                            inputId="project-category"
                            options={categoryOptions}
                            placeholder="Select category"
                            value={categoryOptions.find((option) => option.value === field.value)}
                            onChange={(option) => field.onChange(option ? (option as SelectOption).value : "")}
                            error={form.formState.errors.category?.message}
                            isSearchable
                            isClearable
                            aria-labelledby="project-category-label"
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage id="project-category-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Manager Field with Search */}
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-manager">Manager *</FormLabel>
                  <FormControl>
                    <Controller
                      name="manager"
                      control={form.control}
                      render={({ field }) => (
                        <ReactSelectField
                          inputId="project-manager"
                          options={managerOptions}
                          placeholder={isLoadingManagers ? "Loading managers..." : "Search and select manager"}
                          value={managerOptions.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option ? (option as SelectOption).value : "")}
                          onInputChange={handleManagerInputChange}
                          error={form.formState.errors.manager?.message}
                          isSearchable
                          isClearable
                          isLoading={isLoadingManagers}
                          loadingMessage={() => "Searching managers..."}
                          noOptionsMessage={({ inputValue }) =>
                            inputValue?.length > 0 ? "No managers found" : "Type to search managers"
                          }
                          aria-labelledby="project-manager-label"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage id="project-manager-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-location">Location *</FormLabel>
                  <FormControl>
                    <Input id="project-location" placeholder="Project location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="project-start-date">Start Date *</FormLabel>
                    <FormControl>
                      <DateInput
                        id="project-start-date"
                        value={field.value}
                        onChange={field.onChange}
                        minDate={today}
                        error={form.formState.errors.start_date?.message}
                        aria-describedby="start-date-error"
                      />
                    </FormControl>
                    <FormMessage id="start-date-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="project-end-date">Target End Date *</FormLabel>
                    <FormControl>
                      <DateInput
                        id="project-end-date"
                        value={field.value}
                        onChange={field.onChange}
                        minDate={startDate || today}
                        error={form.formState.errors.target_end_date?.message}
                        aria-describedby="end-date-error"
                      />
                    </FormControl>
                    <FormMessage id="end-date-error" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-budget">Budget (USD) *</FormLabel>
                  <FormControl>
                    <Input id="project-budget" type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="beneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-beneficiaries">Beneficiaries</FormLabel>
                  <FormControl>
                    <Textarea id="project-beneficiaries" placeholder="Who will benefit from this project?" {...field} />
                  </FormControl>
                  <FormDescription id="beneficiaries-description">
                    Describe the target beneficiaries of this project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="success_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-success-criteria">Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea id="project-success-criteria" placeholder="How will success be measured?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="risks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="project-risks">Risks</FormLabel>
                  <FormControl>
                    <Textarea id="project-risks" placeholder="Potential risks and mitigation strategies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-project-form"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
