"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Laptop,
  BookOpen,
  Truck,
  QrCode,
  MoreHorizontal,
  FileText,
  Calendar,
  MapPin,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import type { AssetItem } from "@/types/inventory"

// Sample inventory data
const inventoryItems: AssetItem[] = [
  {
    id: "1",
    name: "Dell Laptop XPS 13",
    assetTag: "IT-LAP-001",
    barcode: "123456789",
    serialNumber: "XPS13-2023-001",
    category: "Electronics",
    subcategory: "Laptops",
    status: "Available",
    location: "Lagos Office",
    department: "IT",
    quantity: 5,
    lastUpdated: "2023-05-15",
    image: "/assets/laptop.jpg",
  },
  {
    id: "2",
    name: "HP LaserJet Printer",
    assetTag: "IT-PRT-001",
    barcode: "987654321",
    serialNumber: "HPLJ-2022-001",
    category: "Electronics",
    subcategory: "Printers",
    status: "In Use",
    location: "Abuja Office",
    department: "Admin",
    quantity: 2,
    lastUpdated: "2023-04-22",
    image: "/assets/printer.jpg",
  },
  {
    id: "3",
    name: "Leadership Training Books",
    assetTag: "LIB-BOK-001",
    barcode: "456789123",
    category: "Books",
    status: "Available",
    location: "Lagos Office",
    department: "Training",
    quantity: 50,
    lastUpdated: "2023-06-01",
    image: "/assets/books.jpg",
  },
  {
    id: "4",
    name: "Projector",
    assetTag: "IT-PRJ-001",
    barcode: "789123456",
    serialNumber: "BENQ-2022-001",
    category: "Electronics",
    subcategory: "Presentation Equipment",
    status: "Maintenance",
    location: "Nairobi Office",
    department: "Events",
    quantity: 1,
    lastUpdated: "2023-05-30",
    image: "/assets/projector.jpg",
  },
  {
    id: "5",
    name: "Digital Camera",
    assetTag: "IT-CAM-001",
    barcode: "321654987",
    serialNumber: "CANON-2023-001",
    category: "Electronics",
    subcategory: "Photography",
    status: "In Use",
    location: "Lagos Office",
    department: "Marketing",
    quantity: 3,
    lastUpdated: "2023-05-10",
    image: "/assets/camera.jpg",
  },
  {
    id: "6",
    name: "Transport Van",
    assetTag: "VEH-VAN-001",
    barcode: "654987321",
    serialNumber: "TOYOTA-2021-001",
    category: "Vehicles",
    status: "Available",
    location: "Accra Office",
    department: "Logistics",
    quantity: 1,
    lastUpdated: "2023-04-15",
    image: "/assets/van.jpg",
    financialDetails: {
      acquisitionCost: 25000,
      acquisitionDate: "2021-04-15",
      fundingSource: "Grant",
      grantId: "GR-2021-003",
      currentValue: 18000,
      depreciationMethod: "straight-line",
      depreciationRate: 20,
      salvageValue: 5000,
      usefulLifeYears: 5,
    },
  },
]

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all-assets")
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [showMobileTabs, setShowMobileTabs] = useState(false)

  // Filter inventory items based on search term and filters
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    const matchesStatus = selectedStatus ? item.status === selectedStatus : true

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories and statuses for filters
  const categories = Array.from(new Set(inventoryItems.map((item) => item.category)))
  const statuses = Array.from(new Set(inventoryItems.map((item) => item.status)))

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Electronics":
        return <Laptop className="h-4 w-4" />
      case "Books":
        return <BookOpen className="h-4 w-4" />
      case "Vehicles":
        return <Truck className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  // Tabs configuration
  const tabs = [
    { value: "all-assets", label: "All Assets" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "vehicles", label: "Vehicles" },
    { value: "office", label: "Office Equipment" },
    { value: "event", label: "Event Supplies" },
  ]

  // Handle escape key press to close dropdown
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdownId(null)
        setShowMobileTabs(false)
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 text-sm md:text-base">Track and manage organizational assets</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex items-center text-green-500 border-green-500 hover:bg-green-600 hover:text-white transition-all duration-[300ms] ease-in-out w-full sm:w-auto">
            <QrCode className="mr-2 h-4 w-4" /> Scan Asset
          </Button>
          <Button variant="outline" className="flex items-center text-green-500 border-green-500 hover:bg-green-600 hover:text-white transition-all duration-[300ms] ease-in-out w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white hover:text-white w-full sm:w-auto">
            <Link href="/membership/dashboard/inventory/assets/new">
              <Plus className="mr-2 h-4 w-4" /> Add Asset
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className=" lg:w-full md:w-[365px] overflow-scroll">
        {/* Mobile Tabs Dropdown */}
        <div className="md:hidden">
          <button
            className="w-full flex justify-between items-center p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-sm"
            onClick={() => setShowMobileTabs(!showMobileTabs)}
          >
            <span>{tabs.find(tab => tab.value === activeTab)?.label || "Select Category"}</span>
            {showMobileTabs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showMobileTabs && (
            <div className="mt-2 p-4 border rounded-lg bg-white shadow-sm">
              <div className="grid grid-cols-3 gap-2">
                {tabs.map((tab) => (
                  <div
                    key={tab.value}
                    className={`text-xs p-2 text-center rounded cursor-pointer ${
                      activeTab === tab.value
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.value)
                      setShowMobileTabs(false)
                    }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <TabsList className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 w-full">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all-assets" className="mt-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search assets by name, tag, serial number..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
                  <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select onValueChange={(value) => setSelectedStatus(value === "all-statuses" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-[355px] md:w-full rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-sm">Asset</TableHead>
                  <TableHead className="text-xs md:text-sm">Asset Tag</TableHead>
                  <TableHead className="text-xs md:text-sm">Category</TableHead>
                  <TableHead className="text-xs md:text-sm">Location</TableHead>
                  <TableHead className="text-xs md:text-sm">Status</TableHead>
                  <TableHead className="text-xs md:text-sm">Quantity</TableHead>
                  <TableHead className="text-xs md:text-sm">Last Updated</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs md:text-sm">
                        <div className="flex items-center">
                          <div className="mr-2 bg-gray-100 p-1 rounded-md">{getCategoryIcon(item.category)}</div>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">{item.assetTag}</TableCell>
                      <TableCell className="text-xs md:text-sm">{item.category}</TableCell>
                      <TableCell className="text-xs md:text-sm">{item.location}</TableCell>
                      <TableCell className="text-xs md:text-sm">
                        <Badge
                          variant="outline"
                          className={`
                            ${item.status === "Available" ? "bg-green-50 text-green-700 border-green-200" : ""}
                            ${item.status === "In Use" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                            ${item.status === "Maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                            ${item.status === "Disposed" ? "bg-red-50 text-red-700 border-red-200" : ""}
                            text-xs md:text-sm
                          `}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-xs md:text-sm">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu
                          open={openDropdownId === item.id}
                          onOpenChange={(open) => {
                            setOpenDropdownId(open ? item.id : null)
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/membership/dashboard/inventory/assets/${item.id}`}>
                                <FileText className="h-4 w-4 mr-2" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/membership/dashboard/inventory/assets/${item.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <QrCode className="h-4 w-4 mr-2" /> Generate QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" /> Schedule Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" /> Change Location
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500 text-xs md:text-sm">
                      No assets found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Other tabs with placeholder content */}
        <TabsContent value="electronics" className="mt-6">
          <p className="text-center text-gray-500 py-12 text-sm md:text-base">
            Electronics category view would appear here, filtered automatically.
          </p>
        </TabsContent>

        <TabsContent value="furniture" className="mt-6">
          <p className="text-center text-gray-500 py-12 text-sm md:text-base">
            Furniture category view would appear here, filtered automatically.
          </p>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          <p className="text-center text-gray-500 py-12 text-sm md:text-base">
            Vehicles category view would appear here, filtered automatically.
          </p>
        </TabsContent>

        <TabsContent value="office" className="mt-6">
          <p className="text-center text-gray-500 py-12 text-sm md:text-base">
            Office Equipment category view would appear here, filtered automatically.
          </p>
        </TabsContent>

        <TabsContent value="event" className="mt-6">
          <p className="text-center text-gray-500 py-12 text-sm md:text-base">
            Event Supplies category view would appear here, filtered automatically.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}