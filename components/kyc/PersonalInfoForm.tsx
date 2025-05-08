"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subYears, isAfter } from "date-fns"
import { CalendarIcon, Info, ChevronLeft, ChevronRight, Linkedin, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PersonalInfoFormData } from "../interfaces/kyc-forms"
import { useUpdateUserMutation } from "@/redux/features/users/userApiSlice"
import { useGetDisabilitiesQuery } from "@/redux/features/profile/profileRelatedAPISlice"

interface PersonalInfoFormProps {
  formData: PersonalInfoFormData
  updateFormData: (data: Partial<PersonalInfoFormData>) => void
  onComplete: () => void
  profileId: string
  userId: string
}

interface FormErrors {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  sex?: string
  disability?: string
  linkedin_profile?: string
  profile_link?: string
}

interface Disability {
  id: string
  name: string
  description?: string
}

// Custom date picker component with year navigation
function BirthDatePicker({
  value,
  onChange,
  error,
}: {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState<number>(() => {
    // Default to 17 years ago
    return subYears(new Date(), 17).getFullYear()
  })
  const [month, setMonth] = useState<number>(() => {
    // Default to current month
    return new Date().getMonth()
  })

  const seventeenYearsAgo = subYears(new Date(), 17)

  const years = Array.from({ length: seventeenYearsAgo.getFullYear() - 1899 }, (_, i) => 1900 + i)

  // Generate array of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(Number.parseInt(e.target.value))
  }

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(Number.parseInt(e.target.value))
  }

  // Handle previous year
  const handlePrevYear = () => {
    if (year > 1900) {
      setYear(year - 1)
    }
  }

  // Handle next year
  const handleNextYear = () => {
    if (year < seventeenYearsAgo.getFullYear()) {
      setYear(year + 1)
    }
  }

  // Handle previous month
  const handlePrevMonth = () => {
    if (month === 0) {
      if (year > 1900) {
        setMonth(11)
        setYear(year - 1)
      }
    } else {
      setMonth(month - 1)
    }
  }

  // Handle next month
  const handleNextMonth = () => {
    if (month === 11) {
      if (year < seventeenYearsAgo.getFullYear()) {
        setMonth(0)
        setYear(year + 1)
      }
    } else {
      setMonth(month + 1)
    }
  }

  // Set default date when opening the picker
  useEffect(() => {
    if (open && !value) {
      // Default to January 1st, 17 years ago
      const defaultDate = new Date(subYears(new Date(), 17).getFullYear(), 0, 1)
      setYear(defaultDate.getFullYear())
      setMonth(defaultDate.getMonth())
    }
  }, [open, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Select your date of birth</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={year <= 1900}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={year.toString()} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.reverse().map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={year >= seventeenYearsAgo.getFullYear()}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={year === 1900 && month === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Select value={month.toString()} onValueChange={(value) => setMonth(Number.parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={months[month]} />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={year === seventeenYearsAgo.getFullYear() && month >= seventeenYearsAgo.getMonth()}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          month={new Date(year, month)}
          onMonthChange={(date) => {
            setMonth(date.getMonth())
            setYear(date.getFullYear())
          }}
          disabled={(date) => {
            // Disable future dates
            if (isAfter(date, new Date())) return true

            // Disable dates less than 17 years ago (too young)
            if (isAfter(date, seventeenYearsAgo)) return true

            // Disable dates before 1900
            if (date < new Date(1900, 0, 1)) return true

            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default function PersonalInfoForm({
  formData,
  updateFormData,
  onComplete,
  profileId,
  userId,
}: PersonalInfoFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateUserMutation()
  const [errors, setErrors] = useState<FormErrors>({})
  const { data: disabilities, isLoading: disabilitiesLoading } = useGetDisabilitiesQuery("")

  // Calculate the date 17 years ago from today
  const seventeenYearsAgo = subYears(new Date(), 17)

  // Initialize disabled based on whether disability exists
  useEffect(() => {
    if (formData.disability && !formData.disabled) {
      updateFormData({ disabled: true })
    }
  }, [formData.disability, formData.disabled, updateFormData])

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url) return true // Empty is valid (optional field)
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required"
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required"
    } else {
      // Check if the selected date is after the minimum age date (too young)
      const birthDate = new Date(formData.date_of_birth)
      if (isAfter(birthDate, seventeenYearsAgo)) {
        newErrors.date_of_birth = "You must be at least 17 years old"
      }
    }

    if (!formData.sex) {
      newErrors.sex = "Please select an option"
    }

    if (formData.disabled && !formData.disability) {
      newErrors.disability = "Please select a disability"
    }

    // Validate LinkedIn profile URL if provided
    if (formData.linkedin_profile && !isValidUrl(formData.linkedin_profile)) {
      newErrors.linkedin_profile = "Please enter a valid URL"
    }

    // Validate profile link URL if provided
    if (formData.profile_link && !isValidUrl(formData.profile_link)) {
      newErrors.profile_link = "Please enter a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await updateUserProfile({
        id: userId,
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth ? format(new Date(formData.date_of_birth), "yyyy-MM-dd") : null,
          sex: formData.sex,
          disabled: formData.disabled,
          disability: formData.disabled ? formData.disability : null,
          linkedin_profile: formData.linkedin_profile || null,
          profile_link: formData.profile_link || null,
        },
      }).unwrap()

      onComplete()
    } catch (error) {
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ first_name: e.target.value })}
            placeholder="Enter your first name"
            className={errors.first_name ? "border-red-500" : ""}
          />
          {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ last_name: e.target.value })}
            placeholder="Enter your last name"
            className={errors.last_name ? "border-red-500" : ""}
          />
          {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
        </div>
      </div>

      {/* Date of Birth Field with Custom Picker */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <div className="text-sm text-muted-foreground flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Must be at least 17 years old</span>
          </div>
        </div>

        <BirthDatePicker
          value={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
          onChange={(date) => updateFormData({ date_of_birth: date ? date.toISOString() : undefined })}
          error={errors.date_of_birth}
        />

        {errors.date_of_birth && <p className="text-red-500 text-sm">{errors.date_of_birth}</p>}
      </div>

      {/* Sex Selection */}
      <div className="space-y-3">
        <Label htmlFor="sex">Gender</Label>
        <RadioGroup
          value={formData.sex || ""}
          onValueChange={(value: string) => updateFormData({ sex: value })}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="cursor-pointer">
              Male
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="cursor-pointer">
              Female
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not_to_mention" id="not_to_mention" />
            <Label htmlFor="not_to_mention" className="cursor-pointer">
              Prefer not to say
            </Label>
          </div>
        </RadioGroup>
        {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
      </div>

      {/* Social Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">Social Profiles</h3>
          <div className="text-sm text-muted-foreground">
            <span>(Optional)</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="linkedin_profile" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn Profile
            </Label>
            <Input
              id="linkedin_profile"
              type="url"
              value={formData.linkedin_profile || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFormData({ linkedin_profile: e.target.value })
              }
              placeholder="https://linkedin.com/in/yourprofile"
              className={errors.linkedin_profile ? "border-red-500" : ""}
            />
            {errors.linkedin_profile && <p className="text-red-500 text-sm">{errors.linkedin_profile}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_link" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Other Profile Link
            </Label>
            <Input
              id="profile_link"
              type="url"
              value={formData.profile_link || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ profile_link: e.target.value })}
              placeholder="https://example.com/yourprofile"
              className={errors.profile_link ? "border-red-500" : ""}
            />
            {errors.profile_link && <p className="text-red-500 text-sm">{errors.profile_link}</p>}
          </div>
        </div>
      </div>

      {/* Disability Section */}
      <div className="space-y-3">
        <Label>Do you have any disabilities?</Label>
        <RadioGroup
          value={formData.disabled ? "yes" : "no"}
          onValueChange={(value: string) => {
            const isDisabled = value === "yes"
            updateFormData({
              disabled: isDisabled,
              // Clear disability if "no" is selected
              ...(isDisabled ? {} : { disability: undefined }),
            })
          }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="disabled-yes" />
            <Label htmlFor="disabled-yes" className="cursor-pointer">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="disabled-no" />
            <Label htmlFor="disabled-no" className="cursor-pointer">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Disability Selection - Only shown if user has selected "Yes" for disabilities */}
      {formData.disabled && (
        <div className="space-y-3 text-gray-800">
          <Label htmlFor="disability">Select Disability</Label>
          <Select
            value={formData.disability || ""}
            onValueChange={(value: string) => updateFormData({ disability: value })}
          >
            <SelectTrigger className={errors.disability ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a disability" />
            </SelectTrigger>
            <SelectContent>
              {!disabilities ? (
                <SelectItem value="loading" disabled>
                  Loading disabilities...
                </SelectItem>
              ) : disabilities.length > 0 ? (
                disabilities.map((disability: Disability) => (
                  <SelectItem key={disability.id} value={disability.id}>
                    {disability.name}
                    {disability.description && ` (${disability.description})`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No disabilities available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.disability && <p className="text-red-500 text-sm">{errors.disability}</p>}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}
