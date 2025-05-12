"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, Briefcase, AlertTriangle, Loader2, Package, ArrowLeft } from "lucide-react"

// Mock API call - replace with actual API call
import { useGetProjectAssetsQuery } from "@/services/projectsApiSlice"

interface ProjectAssetsProps {
  projectId: number | string
}

export function ProjectAssets({ projectId }: ProjectAssetsProps) {
  const { data: assets = [], isLoading } = useGetProjectAssetsQuery(projectId)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter assets based on search term and active tab
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.notes && asset.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && !asset.return_date
    if (activeTab === "returned") return matchesSearch && asset.return_date

    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading project assets...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Project Assets</h2>
          <p className="text-gray-500">Equipment and resources assigned to this project</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Package className="mr-2 h-4 w-4" />
          Assign Asset
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search assets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assets Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No assets match your search criteria. Try a different search term."
                : "No assets have been assigned to this project yet."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Package className="mr-2 h-4 w-4" />
              Assign First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((assetAssignment) => (
            <Card key={`${assetAssignment.project.id}-${assetAssignment.asset.id}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{assetAssignment.asset.name}</CardTitle>
                  <Badge
                    className={
                      assetAssignment.return_date ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                    }
                  >
                    {assetAssignment.return_date ? "Returned" : "Active"}
                  </Badge>
                </div>
                <CardDescription>{assetAssignment.asset.asset_type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{assetAssignment.asset.model || "N/A"}</div>
                    <div className="text-sm text-gray-500">
                      {assetAssignment.asset.serial_number
                        ? `SN: ${assetAssignment.asset.serial_number}`
                        : "No serial number"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Assigned</span>
                    </div>
                    <span>{new Date(assetAssignment.assigned_date).toLocaleDateString()}</span>
                  </div>

                  {assetAssignment.return_date && (
                    <div className="flex justify-between">
                      <div className="flex items-center text-gray-500">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Returned</span>
                      </div>
                      <span>{new Date(assetAssignment.return_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <div className="flex items-center text-gray-500">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Assigned By</span>
                    </div>
                    <span>
                      {assetAssignment.assigned_by.first_name} {assetAssignment.assigned_by.last_name}
                    </span>
                  </div>
                </div>

                {assetAssignment.notes && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{assetAssignment.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {!assetAssignment.return_date && (
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return Asset
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
