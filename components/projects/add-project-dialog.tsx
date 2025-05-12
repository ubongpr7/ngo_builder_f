"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import Select from "react-select"

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
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { useCreateProjectMutation, useGetProjectsCategoriesQuery } from "@/redux/features/projects/projectsAPISlice"

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

const projectTypeOptions = [
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "agriculture", label: "Agriculture" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
]

export function AddProjectDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [createProject, { isLoading }] = useCreateProjectMutation()
  const { data: categories = [] } = useGetProjectsCategoriesQuery()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
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

  async function onSubmit(data: ProjectFormValues) {
    try {
      await createProject({
        ...data,
        status: "planning",
        funds_allocated: 0,
        funds_spent: 0,
      }).unwrap()

      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      })

      form.reset()
      setOpen(false)
    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get the current start date from the form
  const startDate = form.watch("start_date")

  // Prepare category options
  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name
  }))

  // Custom styles for react-select
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '42px',
      border: '1px solid hsl(240 5.9% 90%)',
      borderRadius: '6px',
      backgroundColor: 'hsl(0 0% 100%)',
      '&:hover': {
        borderColor: 'hsl(240 5.9% 90%)',
      },
      '&:focus-within': {
        borderColor: 'hsl(240 5% 64.9%)',
        boxShadow: '0 0 0 1px hsl(240 5% 64.9%)',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 60,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'hsl(240 4.8% 95.9%)' : 'white',
      color: 'hsl(240 10% 3.9%)',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'hsl(240 4.8% 95.9%)',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(240 10% 3.9%)',
    }),
  }

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
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
                    <Textarea placeholder="Project description" {...field} />
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
                    <FormLabel>Project Type *</FormLabel>
                    <FormControl>
                      <Select
                        options={projectTypeOptions}
                        value={projectTypeOptions.find(opt => opt.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        placeholder="Select project type"
                        styles={selectStyles}
                        isSearchable
                        menuPlacement="auto"
                        components={{
                          IndicatorSeparator: () => null,
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        placeholder="Select category"
                        styles={selectStyles}
                        isSearchable
                        menuPlacement="auto"
                        components={{
                          IndicatorSeparator: () => null,
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Project location" {...field} />
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
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <CustomDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start date"
                        minDate={new Date()} // Can't start in the past
                        disablePast={true}
                        initialFocusDate={new Date()}
                        error={form.formState.errors.start_date?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target End Date *</FormLabel>
                    <FormControl>
                      <CustomDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end date"
                        minDate={startDate || new Date()} // End date must be after start date
                        initialFocusDate={startDate ? new Date(startDate) : new Date()}
                        error={form.formState.errors.target_end_date?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (USD) *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
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
                  <FormLabel>Beneficiaries</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Who will benefit from this project?" {...field} />
                  </FormControl>
                  <FormDescription>Describe the target beneficiaries of this project</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="success_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How will success be measured?" {...field} />
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
                  <FormLabel>Risks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Potential risks and mitigation strategies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
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