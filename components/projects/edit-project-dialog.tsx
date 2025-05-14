"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Edit } from "lucide-react"

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
import { useToast } from "@/components/ui/use-toast"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField, type SelectOption } from "@/components/ui/react-select-field"
import { useUpdateProjectMutation, useGetProjectsCategoriesQuery } from "@/redux/features/projects/projectsAPISlice"
import { format, parseISO } from "date-fns"
import type { Project } from "@/types/project"

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  project_type: z.string().min(1, { message: "Project type is required" }),
  category: z.string().optional(),
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

interface EditProjectDialogProps {
  project: Project
  trigger?: React.ReactNode
}

export function EditProjectDialog({ project, trigger }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [updateProject, { isLoading }] = useUpdateProjectMutation()
  const { data: categoriesData = [] } = useGetProjectsCategoriesQuery()

  const categoryOptions: SelectOption[] = categoriesData.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }))

  // Project type options based on backend choices
  const projectTypeOptions: SelectOption[] = [
    { value: "profit", label: "Profit" },
    { value: "non_profit", label: "Non-Profit" },
    { value: "community", label: "Community" },
    { value: "internal", label: "Internal" },
  ]

  // Initialize form with project data
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title || "",
      description: project.description || "",
      project_type: project.project_type || "",
      category: project.category?.toString() || "",
      location: project.location || "",
      start_date: project.start_date ? parseISO(project.start_date) : new Date(),
      target_end_date: project.target_end_date ? parseISO(project.target_end_date) : new Date(),
      budget: project.budget || 0,
      beneficiaries: project.beneficiaries || "",
      success_criteria: project.success_criteria || "",
      risks: project.risks || "",
    },
  })

  // Reset form when project changes
  useEffect(() => {
    if (project && open) {
      form.reset({
        title: project.title || "",
        description: project.description || "",
        project_type: project.project_type || "",
        category: project.category?.toString() || "",
        location: project.location || "",
        start_date: project.start_date ? parseISO(project.start_date) : new Date(),
        target_end_date: project.target_end_date ? parseISO(project.target_end_date) : new Date(),
        budget: project.budget || 0,
        beneficiaries: project.beneficiaries || "",
        success_criteria: project.success_criteria || "",
        risks: project.risks || "",
      })
    }
  }, [project, form, open])

  async function onSubmit(data: ProjectFormValues) {
    try {
      // Format dates to ISO string format (YYYY-MM-DD)
      const formattedData = {
        id: project.id,
        ...data,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        target_end_date: format(data.target_end_date, "yyyy-MM-dd"),
      }

      await updateProject(formattedData).unwrap()

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      })

      setOpen(false)
    } catch (error) {
      console.error("Failed to update project:", error)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get the current start date from the form
  const startDate = form.watch("start_date")
  const today = new Date()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Edit className="mr-2 h-4 w-4" /> Edit Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="edit-project-form">
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

            {/* Manager Field (Read-only) */}
            <FormItem>
              <FormLabel htmlFor="project-manager">Manager</FormLabel>
              <FormControl>
                <Input
                  id="project-manager"
                  value={`${project.manager_details?.first_name || ""} ${project.manager_details?.last_name || ""} (${project.manager_details?.email || ""})`}
                  disabled
                  className="bg-gray-100"
                />
              </FormControl>
              <FormDescription>
                The project manager cannot be changed. Please contact an administrator if you need to change the
                manager.
              </FormDescription>
            </FormItem>

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
                form="edit-project-form"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
