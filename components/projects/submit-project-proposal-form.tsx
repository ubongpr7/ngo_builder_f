"use client"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField, type SelectOption } from "@/components/ui/react-select-field"
import { useCreateProjectMutation, useGetProjectsCategoriesQuery } from "@/redux/features/projects/projectsAPISlice"
import { toast } from "react-toastify"

const projectProposalSchema = z.object({
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

type ProjectProposalFormValues = z.infer<typeof projectProposalSchema>

interface SubmitProjectProposalFormProps {
  userId: string
  onSuccess?: () => void
}

export function SubmitProjectProposalForm({ userId, onSuccess }: SubmitProjectProposalFormProps) {
  const router = useRouter()
  const [createProject, { isLoading }] = useCreateProjectMutation()
  const { data: categoriesData = [] } = useGetProjectsCategoriesQuery()

  const categoryOptions: SelectOption[] = categoriesData?.map((category) => ({
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

  const form = useForm<ProjectProposalFormValues>({
    resolver: zodResolver(projectProposalSchema),
    defaultValues: {
      title: "",
      description: "",
      project_type: "",
      category: "",
      location: "",
      beneficiaries: "",
      success_criteria: "",
      risks: "",
    },
  })

  async function onSubmit(data: ProjectProposalFormValues) {
    try {
      // Format dates to ISO string format (YYYY-MM-DD)
      const formattedData = {
        ...data,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        target_end_date: format(data.target_end_date, "yyyy-MM-dd"),
        status: "submitted", // Set status to submitted for admin approval
        manager: userId, // Set the CEO user as the manager
        funds_allocated: 0,
        funds_spent: 0,
      }

      await createProject(formattedData).unwrap()

      toast.success("Project proposal submitted successfully!")


      form.reset()

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to projects page if no callback provided
        router.push("/dashboard/projects")
      }
    } catch (error) {
      toast.error("Failed to submit project proposal. Please try again.")
    }
  }

  // Get the current start date from the form
  const startDate = form.watch("start_date")
  const today = new Date()

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Project Proposal</CardTitle>
        <CardDescription>
          Fill in the details to submit a new project proposal for approval. Required fields are marked with an asterisk
          (*).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="submit-proposal-form">
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

            {/* Note: Manager field is hidden as the CEO user will automatically be set as the manager */}

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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="submit-proposal-form"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Proposal
        </Button>
      </CardFooter>
    </Card>
  )
}
