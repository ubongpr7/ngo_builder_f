"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useUpdateDonationMutation } from "@/redux/features/finance/financeApiSlice"
import { useAuth } from "@/redux/features/users/useAuth"
import { toast } from "react-toastify"
import type { Donation } from "@/types/finance"

const statusUpdateSchema = z.object({
  status: z.string().min(1, "Status is required"),
  update_note: z.string().min(10, "Update note must be at least 10 characters"),
})

interface DonationStatusUpdateDialogProps {
  donation: Donation
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function DonationStatusUpdateDialog({ donation, onSuccess, trigger }: DonationStatusUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [updateDonation, { isLoading }] = useUpdateDonationMutation()
  const { user } = useAuth()

  const form = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: donation.status,
      update_note: "",
    },
  })

  const statusOptions = [
    { value: "pending", label: "Pending", color: "secondary" },
    { value: "processing", label: "Processing", color: "default" },
    { value: "completed", label: "Completed", color: "default" },
    { value: "failed", label: "Failed", color: "destructive" },
    { value: "refunded", label: "Refunded", color: "outline" },
    { value: "cancelled", label: "Cancelled", color: "destructive" },
  ]

  const onSubmit = async (values: z.infer<typeof statusUpdateSchema>) => {
    try {
      const currentDate = new Date().toISOString()
      const userName =
        user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || "Unknown User"

      // Prepare the update note with timestamp and user info
      const statusUpdateNote = `\n\n--- Status Update (${currentDate}) ---\nUpdated by: ${userName}\nStatus changed from: ${donation.status} to: ${values.status}\nNote: ${values.update_note}`

      // Combine existing notes with the new update note
      const updatedNotes = donation.notes ? donation.notes + statusUpdateNote : statusUpdateNote.trim()

      await updateDonation({
        id: donation.id,
        data:{status: values.status},
        notes: updatedNotes,
      }).unwrap()

      toast.success("Donation status updated successfully")
      onSuccess()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to update donation status:", error)
      toast.error("Failed to update donation status")
    }
  }

  const selectedStatus = form.watch("status")
  const currentStatusOption = statusOptions.find((option) => option.value === selectedStatus)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Update Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Donation Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge variant="secondary">{donation.status.toUpperCase()}</Badge>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedStatus && selectedStatus !== donation.status && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">New Status:</span>
                  <Badge variant={currentStatusOption?.color as any}>{selectedStatus.toUpperCase()}</Badge>
                </div>
              )}

              <FormField
                control={form.control}
                name="update_note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Update Note <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide a reason for this status change..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Status
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
