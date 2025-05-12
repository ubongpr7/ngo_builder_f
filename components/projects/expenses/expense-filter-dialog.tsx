"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateInput } from "@/components/ui/date-input"
import Select from "react-select"
import { Filter, X } from "lucide-react"

// Define common expense categories
const EXPENSE_CATEGORIES = [
  { value: "Travel", label: "Travel" },
  { value: "Meals", label: "Meals" },
  { value: "Supplies", label: "Supplies" },
  { value: "Equipment", label: "Equipment" },
  { value: "Software", label: "Software" },
  { value: "Services", label: "Services" },
  { value: "Training", label: "Training" },
  { value: "Miscellaneous", label: "Miscellaneous" },
]

interface FilterFormValues {
  startDate: Date | undefined
  endDate: Date | undefined
  minAmount: number | undefined
  maxAmount: number | undefined
  categories: string[]
}

interface ExpenseFilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterFormValues
  onApplyFilters: (filters: FilterFormValues) => void
}

export function ExpenseFilterDialog({ isOpen, onClose, filters, onApplyFilters }: ExpenseFilterDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FilterFormValues>({
    defaultValues: {
      startDate: filters.startDate,
      endDate: filters.endDate,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      categories: filters.categories,
    },
  })

  // Update form when filters change
  useEffect(() => {
    reset(filters)
  }, [filters, reset])

  const onSubmit = (data: FilterFormValues) => {
    onApplyFilters(data)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      categories: [],
    }
    reset(clearedFilters)
    onApplyFilters(clearedFilters)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Expenses</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => <DateInput id="startDate" value={field.value} onChange={field.onChange} />}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DateInput
                    id="endDate"
                    value={field.value}
                    onChange={field.onChange}
                    minDate={control._formValues.startDate}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount ($)</Label>
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                min="0"
                {...register("minAmount", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? undefined : Number.parseFloat(v)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount ($)</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                min="0"
                {...register("maxAmount", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? undefined : Number.parseFloat(v)),
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <Controller
              control={control}
              name="categories"
              render={({ field }) => (
                <Select
                  inputId="categories"
                  options={EXPENSE_CATEGORIES}
                  placeholder="Select categories"
                  isMulti
                  isSearchable
                  value={EXPENSE_CATEGORIES.filter((option) => field.value.includes(option.value))}
                  onChange={(options) => field.onChange(options ? options.map((option) => option.value) : [])}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            />
          </div>

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleClearFilters} className="mr-auto">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
