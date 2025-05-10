"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Filter, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UpdateFilters from "@/components/projects/UpdateFilters"
import UpdateCard from "@/components/projects/UpdateCard"

// Sample data - replace with actual API call
const SAMPLE_UPDATES = [
  {
    id: "1",
    projectId: "digital-skills",
    title: "Training Session Completed",
    description:
      "Successfully completed the first training session with 50 participants. Covered HTML, CSS basics and intro to JavaScript.",
    date: "2025-05-09T14:30:00Z",
    author: {
      id: "1",
      name: "Prosper Ubong",
      avatar: "https://destinybuilderssthree.s3.amazonaws.com/profile_images/20250509_144611_ubongpr7_gmail_com.jpg",
    },
    category: "milestone",
    status: "completed",
    project: {
      id: "digital-skills",
      name: "Digital Skills Workshop",
      location: "Lagos, Nigeria",
    },
    media: [
      {
        type: "image",
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0VDjq0H71DTYM6GkBSQP9fhRu1iOm2.png",
        caption: "Training session in progress",
      },
    ],
    reactions: {
      likes: 24,
      celebrates: 12,
      supports: 8,
    },
    commentCount: 15,
  },
  {
    id: "2",
    projectId: "community-health",
    title: "Medical Supplies Delivered",
    description:
      "Received and organized medical supplies for the upcoming health checkup event. Inventory includes basic medications, diagnostic tools, and educational materials.",
    date: "2025-05-08T10:15:00Z",
    author: {
      id: "2",
      name: "Grace Adeyemi",
      avatar: "",
    },
    category: "progress",
    status: "in-progress",
    project: {
      id: "community-health",
      name: "Community Health Outreach",
      location: "Accra, Ghana",
    },
    media: [
      {
        type: "image",
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0VDjq0H71DTYM6GkBSQP9fhRu1iOm2.png",
        caption: "Medical supplies inventory",
      },
    ],
    reactions: {
      likes: 18,
      celebrates: 5,
      supports: 10,
    },
    commentCount: 7,
  },
  {
    id: "3",
    projectId: "women-entrepreneurship",
    title: "Business Plan Workshop",
    description:
      "Conducted a workshop on creating effective business plans. 35 women entrepreneurs participated and developed initial drafts for their businesses.",
    date: "2025-05-07T16:45:00Z",
    author: {
      id: "3",
      name: "Amina Kimathi",
      avatar: "",
    },
    category: "event",
    status: "completed",
    project: {
      id: "women-entrepreneurship",
      name: "Women Entrepreneurship Program",
      location: "Nairobi, Kenya",
    },
    media: [
      {
        type: "image",
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0VDjq0H71DTYM6GkBSQP9fhRu1iOm2.png",
        caption: "Business plan workshop",
      },
    ],
    reactions: {
      likes: 32,
      celebrates: 15,
      supports: 20,
    },
    commentCount: 12,
  },
]

export default function UpdatesPage() {
  const searchParams = useSearchParams()
  const [updates, setUpdates] = useState(SAMPLE_UPDATES)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  // Filter updates based on search query and active tab
  useEffect(() => {
    let filteredUpdates = SAMPLE_UPDATES

    // Apply search filter
    if (searchQuery) {
      filteredUpdates = filteredUpdates.filter(
        (update) =>
          update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          update.project.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filteredUpdates = filteredUpdates.filter((update) => {
        if (activeTab === "completed") return update.status === "completed"
        if (activeTab === "in-progress") return update.status === "in-progress"
        if (activeTab === "milestones") return update.category === "milestone"
        return true
      })
    }

    // Apply sort order
    filteredUpdates = [...filteredUpdates].sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortOrder === "most-popular") {
        const aPopularity = a.reactions.likes + a.reactions.celebrates + a.reactions.supports
        const bPopularity = b.reactions.likes + b.reactions.celebrates + b.reactions.supports
        return bPopularity - aPopularity
      } else if (sortOrder === "most-commented") {
        return b.commentCount - a.commentCount
      }
      return 0
    })

    setUpdates(filteredUpdates)
  }, [searchQuery, activeTab, sortOrder, searchParams])

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Updates</h1>
          <p className="text-gray-600 mt-1">Track daily progress across all projects</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700">
          <Link href="/projects/updates/create" className="flex items-center">
            Create Update
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateFilters
                onFilterChange={(filters) => {
                  console.log("Filters changed:", filters)
                  // Apply filters to updates
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search updates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most-popular">Most Popular</SelectItem>
                  <SelectItem value="most-commented">Most Commented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>
          </Tabs>

          {updates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Filter className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No updates found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <UpdateCard key={update.id} update={update} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
