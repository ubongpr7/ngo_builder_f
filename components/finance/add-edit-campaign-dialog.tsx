"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { DonationCampaign } from "@/types/finance"

interface AddEditCampaignDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  campaign?: DonationCampaign
  onSubmit: (values: z.infer<typeof formSchema>) => void
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Campaign title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  image: z.string().url().optional(),
})

export function AddEditCampaignDialog({ open, setOpen, campaign, onSubmit }: AddEditCampaignDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      image: campaign?.image || "",
    },
  })

  function handleClose() {
    setOpen(false)
    form.reset()
  }

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values)
    handleClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{campaign ? "Edit Campaign" : "Add Campaign"}</AlertDialogTitle>
          <AlertDialogDescription>
            {campaign ? "Update the campaign details." : "Create a new campaign."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Campaign Title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="image">Campaign Image</Label>
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="Enter image URL"
                defaultValue={campaign?.image || ""}
              />
              <p className="text-xs text-gray-500">Enter a URL for the campaign image (optional)</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">{campaign ? "Update" : "Create"}</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
