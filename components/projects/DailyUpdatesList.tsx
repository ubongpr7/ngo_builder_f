"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Eye, MoreHorizontal, Plus, Search, Trash2, MessageSquare, ThumbsUp } from "lucide-react"
import { format } from "date-fns"

// Mock data for daily updates
const mockUpdates = [
  {
    id: "1",
    project: {
      id: "1",
      title: "Digital Skills Workshop",
      image: "/project1.jpg",
    },
    date: "2023-10-15",
    submittedBy: "John Smith",
    summary: "Completed the first phase of the workshop. Trained 25 participants on basic web development.",
    mediaCount: 5,
    expensesTotal: 350.75,
    commentCount: 3,
    reactionCount: 8,
  },
  {
    id: "2",
    project: {
      id: "2",
      title: "Community Health Outreach",
      image: "/project2.jpg",
    },
    date: "2023-10-14",
    submittedBy: "Sarah Johnson",
    summary:
      "Conducted health screenings for 120 community members. Distributed medicine and health education materials.",
    mediaCount: 12,
    expensesTotal: 780.25,
    commentCount: 5,
    reactionCount: 15,
  },
  {
    id: "3",
    project: {
      id: "3",
      title: "Women Entrepreneurship Program",
      image: "/project3.jpg",
    },
    date: "2023-10-14",
    submittedBy: "Michael Brown",
    summary: "Held a workshop on business planning and financial management. 30 women entrepreneurs attended.",
    mediaCount: 8,
    expensesTotal: 425.5,
    commentCount: 7,
    reactionCount: 12,
  },
  {
    id: "4",
    project: {
      id: "1",
      title: "Digital Skills Workshop",
      image: "/project1.jpg",
    },
    date: "2023-10-13",
    submittedBy: "John Smith",
    summary: "Prepared materials for the next phase of training. Set up equipment and tested software.",
    mediaCount: 2,
    expensesTotal: 150.0,
    commentCount: 1,
    reactionCount: 3,
  },
  {
    id: "5",
    project: {
      id: "4",
      title: "Youth Leadership Summit",
      image: "/project4.jpg",
    },
    date: "2023-10-12",
    submittedBy: "Emily Wilson",
    summary: "Finalized the agenda and confirmed speakers for the summit. Sent out invitations to participants.",
    mediaCount: 0,
    expensesTotal: 200.0,
    commentCount: 2,
    reactionCount: 5,
  },
]

export default function DailyUpdatesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter updates based on search term and active tab
  const filteredUpdates = mockUpdates.filter((update) => {
    const matchesSearch =
      update.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.summary.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && update.project.id === activeTab
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Project Updates</h1>
          <p className="text-gray-500">View and manage daily updates for all projects</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/membership/dashboard/projects/daily-updates/new">
              <Plus className="mr-2 h-4 w-4" /> New Update
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search updates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="1">Digital Skills</TabsTrigger>
            <TabsTrigger value="2">Health Outreach</TabsTrigger>
            <TabsTrigger value="3">Entrepreneurship</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Daily project updates submitted by team members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUpdates.length > 0 ? (
                filteredUpdates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden relative">
                          <Image
                            src={update.project.image || "/placeholder.svg"}
                            alt={update.project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{update.project.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(update.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{update.submittedBy}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{update.summary}</div>
                    </TableCell>
                    <TableCell>
                      {update.mediaCount > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {update.mediaCount} files
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>${update.expensesTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-gray-500">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">{update.commentCount}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">{update.reactionCount}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/membership/dashboard/projects/daily-updates/${update.id}`}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" /> Download Report
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
                  <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                    No updates found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
