"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Edit } from 'lucide-react'

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
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

// Export as a named function component with explicit type annotation
export function EditProjectDialog({
  project,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: EditProjectDialogProps): JSX.Element {
  const [internalOpen, setInternalOpen] = useState(false)
  const { toast } = useToast()
  const [updateProject, { isLoading }] = useUpdateProjectMutation()
  const { data: categoriesData = [] } = useGetProjectsCategoriesQuery()

  // Determine if we're using controlled or uncontrolled open state
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen : setInternalOpen

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
      budget: project.budget,
      beneficiaries: project.beneficiaries || "",
      success_criteria: project.success_criteria || "",
      risks: project.risks || "",
    },
  })

  // Reset form when project changes or dialog opens
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
        budget: project.budget,
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

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
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
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="edit-project-form">
            {/* Form fields remain the same */}
            {/* ... */}
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

            {/* Other form fields... */}

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
