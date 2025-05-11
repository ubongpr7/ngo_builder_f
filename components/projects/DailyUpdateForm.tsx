"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Upload, X, Plus, Loader2, Camera } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function DailyUpdateForm({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [expenses, setExpenses] = useState<{ category: string; description: string; amount: string }[]>([
    { category: "", description: "", amount: "" },
  ])

  // Mock project data - would come from API in real implementation
  const project = {
    id: projectId || "1",
    title: "Digital Skills Workshop",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { category: "", description: "", amount: "" }])
  }

  const updateExpense = (index: number, field: string, value: string) => {
    setExpenses((prev) => prev.map((expense, i) => (i === index ? { ...expense, [field]: value } : expense)))
  }

  const removeExpense = (index: number) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Update submitted",
        description: "Your daily project update has been submitted successfully.",
      })
      router.push(`/dashboard/projects/${projectId}`)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Daily Project Update</CardTitle>
          <CardDescription>
            Submit a daily update for project: <strong>{project.title}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media Files</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weather">Weather Conditions</Label>
                  <Input id="weather" placeholder="e.g., Sunny, Rainy, etc." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary of Work Completed</Label>
                <Textarea
                  id="summary"
                  placeholder="Provide a detailed summary of the work completed today"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materials">Materials Used</Label>
                  <Textarea id="materials" placeholder="List materials used for the project today" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment Used</Label>
                  <Textarea id="equipment" placeholder="List equipment used for the project today" rows={3} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labor">Labor Hours</Label>
                  <Input id="labor" type="number" min="0" placeholder="Total labor hours" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safety">Safety Incidents</Label>
                  <Input id="safety" placeholder="Any safety incidents or concerns" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges or Delays</Label>
                <Textarea
                  id="challenges"
                  placeholder="Describe any challenges, delays, or issues encountered"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_day">Next Day Plan</Label>
                <Textarea id="next_day" placeholder="Outline the plan for the next working day" rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Photos, Videos, or Documents</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                  <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-500 mt-1">Support for images, videos, and documents</span>
                  </Label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center space-x-2 truncate">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={file.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <FileIcon fileType={file.type} />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <div className="space-y-4">
                {expenses.map((expense, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor={`category-${index}`}>Category</Label>
                      <Select
                        value={expense.category}
                        onValueChange={(value) => updateExpense(index, "category", value)}
                      >
                        <SelectTrigger id={`category-${index}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="materials">Materials</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="labor">Labor</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="food">Food & Refreshments</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 space-y-2">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={expense.description}
                        onChange={(e) => updateExpense(index, "description", e.target.value)}
                        placeholder="Describe the expense"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`amount-${index}`}>Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={expense.amount}
                          onChange={(e) => updateExpense(index, "amount", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 pt-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpense(index)}
                        disabled={expenses.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addExpenseRow}>
                  <Plus className="h-4 w-4 mr-2" /> Add Expense
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Expenses:</span>
                    <span className="font-bold">
                      ${expenses.reduce((sum, expense) => sum + (Number.parseFloat(expense.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Update"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith("image/")) {
    return <Camera className="h-5 w-5 text-blue-500" />
  } else if (fileType.startsWith("video/")) {
    return (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    )
  } else if (fileType.startsWith("audio/")) {
    return (
      <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    )
  } else {
    return (
      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    )
  }
}
