"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateInput } from "@/components/ui/date-input"
import { Checkbox } from "@/components/ui/checkbox"
import { useGetUpdatesByUserQuery } from "@/redux/features/projects/updateApiSlice"
import { useGetProjectTeamMembersQuery } from "@/redux/features/users/userApiSlice"
import Select from "react-select"

interface UpdateFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialFilters: any
  onApply: (filters: any) => void
  onClear: () => void
  projectId: number
}

export function UpdateFilterDialog({
  open,
  onOpenChange,
  initialFilters,
  onApply,
  onClear,
  projectId,
}: UpdateFilterDialogProps) {
  const [filters, setFilters] = useState({
    startDate: initialFilters.startDate ? new Date(initialFilters.startDate) : null,
    endDate: initialFilters.endDate ? new Date(initialFilters.endDate) : null,
    minAmount: initialFilters.minAmount || "",
    maxAmount: initialFilters.maxAmount || "",
    submittedBy: initialFilters.submittedBy || null,
    hasMedia: initialFilters.hasMedia === undefined ? null : initialFilters.hasMedia,
  })

  // Fetch team members for the project
  const { data: teamMembers = [] } = useGetProjectTeamMembersQuery(projectId)

  // Format team members for react-select
  const teamMemberOptions = teamMembers?.map((user) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name} (${user.username})`,
  }))

  useEffect(() => {
    if (open) {
      setFilters({
        startDate: initialFilters.startDate ? new Date(initialFilters.startDate) : null,
        endDate: initialFilters.endDate ? new Date(initialFilters.endDate) : null,
        minAmount: initialFilters.minAmount || "",
        maxAmount: initialFilters.maxAmount || "",
        submittedBy: initialFilters.submittedBy || null,
        hasMedia: initialFilters.hasMedia === undefined ? null : initialFilters.hasMedia,
      })
    }
  }, [open, initialFilters])

  const handleApply = () => {
    const appliedFilters = {}
    
    if (filters.startDate) {
      appliedFilters.startDate = filters.startDate
    }
    
    if (filters.endDate) {
      appliedFilters.endDate = filters.endDate
    }
    
    if (filters.minAmount !== "") {
      appliedFilters.minAmount = parseFloat(filters.minAmount)
    }
    
    if (filters.maxAmount !== "") {
      appliedFilters.maxAmount = parseFloat(filters.maxAmount)
    }
    
    if (filters.submittedBy) {
      appliedFilters.submittedBy = filters.submittedBy
    }
    
    if (filters.hasMedia !== null) {
      appliedFilters.hasMedia = filters.hasMedia
    }
    
    onApply(appliedFilters)
  }

  const handleClear = () => {
    setFilters({
      startDate: null,
      endDate: null,
      minAmount: "",
      maxAmount: "",
      submittedBy: null,
      hasMedia: null,
    })
    onClear()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Updates</DialogTitle>
          <DialogDescription>
            Set filters to narrow down the project updates displayed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                <DateInput
                  id="startDate"
                  value={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  placeholder="From"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">End Date</Label>
                <DateInput
                  id="endDate"
                  value={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  placeholder="To"
                  maxDate={new Date()}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Funds Spent Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount" className="text-xs">Min Amount ($)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  placeholder="Min"
                />
              </div>
              <div>
                <Label htmlFor="maxAmount" className="text-xs">Max Amount ($)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submittedBy">Submitted By</Label>
            <Select
              inputId="submittedBy"
              options={teamMemberOptions}
              value={teamMemberOptions.find((option) => option.value === filters.submittedBy)}
              onChange={(option) => setFilters({ ...filters, submittedBy: option?.value || null })}
              placeholder="Select team member"
              isClearable
              classNames={{
                control: () => "input",
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasMedia"
              checked={filters.hasMedia === true}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setFilters({ ...filters, hasMedia: true })
                } else if (filters.hasMedia === true) {
                  setFilters({ ...filters, hasMedia: null })
                } else {
                  setFilters({ ...filters, hasMedia: true })
                }
              }}
            />
            <Label htmlFor="hasMedia">Has media files</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="noMedia"
              checked={filters.hasMedia === false}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setFilters({ ...filters, hasMedia: false })
                } else if (filters.hasMedia === false) {
                  setFilters({ ...filters, hasMedia: null })
                } else {
                  setFilters({ ...filters, hasMedia: false })
                }
              }}
            />
            <Label htmlFor="noMedia">No media files</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
