"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AssetItem, AssetCategory, AssetStatus } from "@/types/inventory"
import { useToast } from "@/hooks/use-toast"

interface AssetFormProps {
  asset?: AssetItem
  isEditing?: boolean
}

export default function AssetForm({ asset, isEditing = false }: AssetFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [openSelect, setOpenSelect] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: isEditing ? "Asset Updated" : "Asset Created",
        description: isEditing
          ? "The asset has been updated successfully."
          : "The asset has been created successfully.",
      })
      router.push("/membership/dashboard/inventory")
    }, 1500)
  }

  // Handle escape key press to close select dropdowns
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenSelect(null)
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  const assetCategories: AssetCategory[] = [
    "Electronics",
    "Furniture",
    "Vehicles",
    "Office Equipment",
    "Event Supplies",
    "Medical Equipment",
    "Educational Materials",
    "Books",
  ]

  const assetStatuses: AssetStatus[] = ["Available", "In Use", "Maintenance", "Disposed", "Lost", "Reserved"]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Edit Asset" : "Add New Asset"}</h1>
          <p className="text-gray-500">
            {isEditing ? "Update the details of an existing asset" : "Add a new asset to your inventory"}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="custom">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic information about the asset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input id="name" defaultValue={asset?.name} placeholder="e.g., Dell Laptop XPS 13" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetTag">Asset Tag</Label>
                  <Input id="assetTag" defaultValue={asset?.assetTag} placeholder="e.g., IT-LAP-001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    defaultValue={asset?.category}
                    open={openSelect === "category"}
                    onOpenChange={(open) => setOpenSelect(open ? "category" : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input id="subcategory" defaultValue={asset?.subcategory} placeholder="e.g., Laptops" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue={asset?.status || "Available"}
                    open={openSelect === "status"}
                    onOpenChange={(open) => setOpenSelect(open ? "status" : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" defaultValue={asset?.quantity || 1} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={asset?.description}
                  placeholder="Enter a description of the asset"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Specify where the asset is located</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    defaultValue={asset?.location}
                    open={openSelect === "location"}
                    onOpenChange={(open) => setOpenSelect(open ? "location" : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lagos Office">Lagos Office</SelectItem>
                      <SelectItem value="Abuja Office">Abuja Office</SelectItem>
                      <SelectItem value="Nairobi Office">Nairobi Office</SelectItem>
                      <SelectItem value="Accra Office">Accra Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    defaultValue={asset?.department}
                    open={openSelect === "department"}
                    onOpenChange={(open) => setOpenSelect(open ? "department" : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Logistics">Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input id="assignedTo" defaultValue={asset?.assignedTo} placeholder="e.g., John Smith" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
              <CardDescription>Enter additional details about the asset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" defaultValue={asset?.manufacturer} placeholder="e.g., Dell" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" defaultValue={asset?.model} placeholder="e.g., XPS 13" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" defaultValue={asset?.serialNumber} placeholder="e.g., XPS13-2023-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" defaultValue={asset?.barcode} placeholder="e.g., 123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" defaultValue={asset?.purchaseDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiration">Warranty Expiration</Label>
                  <Input id="warrantyExpiration" type="date" defaultValue={asset?.warrantyExpiration} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  defaultValue={asset?.notes}
                  placeholder="Enter any additional notes about the asset"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Enter financial details about the asset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acquisitionCost">Acquisition Cost</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="acquisitionCost"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-7"
                      defaultValue={asset?.financialDetails?.acquisitionCost}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                  <Input id="acquisitionDate" type="date" defaultValue={asset?.financialDetails?.acquisitionDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingSource">Funding Source</Label>
                  <Select
                    defaultValue={asset?.financialDetails?.fundingSource}
                    open={openSelect === "fundingSource"}
                    onOpenChange={(open) => setOpenSelect(open ? "fundingSource" : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operating Budget">Operating Budget</SelectItem>
                      <SelectItem value="Grant">Grant</SelectItem>
                      <SelectItem value="Donation">Donation</SelectItem>
                      <SelectItem value="Capital Budget">Capital Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-7"
                      defaultValue={asset?.financialDetails?.currentValue}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                  <Select
                    defaultValue={asset?.financialDetails?.depreciationMethod}
                    open={openSelect === "depreciationMethod"}
                    onOpenChange={(open) => setOpenSelect(open ? "depreciationMethod" : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight-line">Straight Line</SelectItem>
                      <SelectItem value="reducing-balance">Reducing Balance</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usefulLifeYears">Useful Life (Years)</Label>
                  <Input
                    id="usefulLifeYears"
                    type="number"
                    min="0"
                    defaultValue={asset?.financialDetails?.usefulLifeYears}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grant Information</CardTitle>
              <CardDescription>If this asset was purchased with grant funding, enter the details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grantId">Grant ID</Label>
                  <Input id="grantId" defaultValue={asset?.financialDetails?.grantId} placeholder="e.g., GR-2021-003" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorId">Donor ID</Label>
                  <Input id="donorId" defaultValue={asset?.financialDetails?.donorId} placeholder="e.g., DN-2021-005" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>Add custom fields to track additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Custom fields functionality would be implemented here</p>
                <Button type="button" variant="outline" className="mt-4">
                  Add Custom Field
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Asset" : "Create Asset"}
        </Button>
      </div>
    </form>
  )
}
