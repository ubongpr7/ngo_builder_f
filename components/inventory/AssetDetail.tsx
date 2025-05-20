"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Edit,
  Download,
  QrCode,
  Calendar,
  MapPin,
  DollarSign,
  PenToolIcon as Tool,
  FileText,
  Truck,
  User,
  Tag,
  Clipboard,
  ArrowRight,
  Paperclip,
} from "lucide-react"
import type { AssetItem } from "@/types/inventory"

interface AssetDetailProps {
  asset: AssetItem
}

export default function AssetDetail({ asset }: AssetDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
            <Badge
              variant="outline"
              className={`
                ${asset.status === "Available" ? "bg-green-50 text-green-700 border-green-200" : ""}
                ${asset.status === "In Use" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                ${asset.status === "Maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                ${asset.status === "Disposed" ? "bg-red-50 text-red-700 border-red-200" : ""}
              `}
            >
              {asset.status}
            </Badge>
          </div>
          <p className="text-gray-500">Asset Tag: {asset.assetTag}</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center">
            <QrCode className="mr-2 h-4 w-4" /> Generate QR Code
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export Details
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href={`/membership/dashboard/inventory/assets/${asset.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Asset
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Asset Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 w-full rounded-md overflow-hidden bg-gray-100">
                {asset.image ? (
                  <Image src={asset.image || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Tag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Asset Tag:</span>
                  <span className="font-medium">{asset.assetTag}</span>
                </div>
                {asset.barcode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Barcode:</span>
                    <span className="font-medium">{asset.barcode}</span>
                  </div>
                )}
                {asset.serialNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Serial Number:</span>
                    <span className="font-medium">{asset.serialNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{asset.category}</span>
                </div>
                {asset.subcategory && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subcategory:</span>
                    <span className="font-medium">{asset.subcategory}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">{asset.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{asset.lastUpdated}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Location:</span>
                  <span className="font-medium">{asset.location}</span>
                </div>
                {asset.department && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-medium">{asset.department}</span>
                  </div>
                )}
                {asset.assignedTo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Assigned To:</span>
                    <span className="font-medium">{asset.assignedTo}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" /> Change Location
                </Button>
              </div>
            </CardContent>
          </Card>

          {asset.financialDetails && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Acquisition Cost:</span>
                    <span className="font-medium">${asset.financialDetails.acquisitionCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Value:</span>
                    <span className="font-medium">
                      ${asset.financialDetails.currentValue?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Funding Source:</span>
                    <span className="font-medium">{asset.financialDetails.fundingSource || "N/A"}</span>
                  </div>
                  {asset.financialDetails.grantId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Grant ID:</span>
                      <span className="font-medium">{asset.financialDetails.grantId}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" /> View Financial Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <Badge
                          variant="outline"
                          className={`
                            ${asset.status === "Available" ? "bg-green-50 text-green-700 border-green-200" : ""}
                            ${asset.status === "In Use" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                            ${asset.status === "Maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                            ${asset.status === "Disposed" ? "bg-red-50 text-red-700 border-red-200" : ""}
                          `}
                        >
                          {asset.status}
                        </Badge>
                      </div>
                      {asset.manufacturer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Manufacturer:</span>
                          <span className="font-medium">{asset.manufacturer}</span>
                        </div>
                      )}
                      {asset.model && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Model:</span>
                          <span className="font-medium">{asset.model}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {asset.purchaseDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Purchase Date:</span>
                          <span className="font-medium">{asset.purchaseDate}</span>
                        </div>
                      )}
                      {asset.warrantyExpiration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Warranty Expiration:</span>
                          <span className="font-medium">{asset.warrantyExpiration}</span>
                        </div>
                      )}
                      {asset.description && (
                        <div className="flex flex-col text-sm">
                          <span className="text-gray-500">Description:</span>
                          <span className="font-medium mt-1">{asset.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {asset.customFields && asset.customFields?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {asset.customFields?.map((field) => (
                        <div key={field.id} className="flex justify-between text-sm">
                          <span className="text-gray-500">{field.name}:</span>
                          <span className="font-medium">
                            {typeof field.value === "boolean"
                              ? field.value
                                ? "Yes"
                                : "No"
                              : field.value?.toString() || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Tool className="mr-2 h-4 w-4" /> Schedule Maintenance
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <User className="mr-2 h-4 w-4" /> Assign to User
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Clipboard className="mr-2 h-4 w-4" /> Check Out
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" /> Generate Report
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Paperclip className="mr-2 h-4 w-4" /> Add Attachment
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <DollarSign className="mr-2 h-4 w-4" /> Update Value
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-6 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Maintenance History</CardTitle>
                  <Button size="sm">
                    <Tool className="mr-2 h-4 w-4" /> Add Maintenance Record
                  </Button>
                </CardHeader>
                <CardContent>
                  {asset.maintenanceRecords && asset.maintenanceRecords?.length > 0 ? (
                    <div className="space-y-4">
                      {asset.maintenanceRecords?.map((record) => (
                        <div key={record.id} className="border-b pb-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{record.date}</span>
                            <span className="text-gray-500">${record.cost.toLocaleString()}</span>
                          </div>
                          <p className="text-sm">{record.description}</p>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Performed by: {record.performedBy}</span>
                            {record.nextScheduledDate && <span>Next scheduled: {record.nextScheduledDate}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Tool className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No maintenance records found</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Add First Maintenance Record
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No scheduled maintenance</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Movement History</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.movementHistory && asset.movementHistory?.length > 0 ? (
                    <div className="space-y-4">
                      {asset.movementHistory?.map((record) => (
                        <div key={record.id} className="flex items-start space-x-4">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">
                                {record.fromLocation} <ArrowRight className="inline h-3 w-3" /> {record.toLocation}
                              </p>
                              <span className="text-xs text-gray-500">{record.date}</span>
                            </div>
                            <p className="text-xs text-gray-500">Moved by: {record.movedBy}</p>
                            {record.notes && <p className="text-xs">{record.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No movement history recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Audit log would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Attached Documents</CardTitle>
                  <Button size="sm">
                    <Paperclip className="mr-2 h-4 w-4" /> Add Document
                  </Button>
                </CardHeader>
                <CardContent>
                  {asset.attachments && asset.attachments?.length > 0 ? (
                    <div className="space-y-2">
                      {asset.attachments?.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{attachment.name}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Paperclip className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No documents attached</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Upload Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
