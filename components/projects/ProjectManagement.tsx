"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Calendar, MapPin, Users, FileText, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Sample project data
const projects = [
  {
    id: 1,
    title: "Digital Skills Workshop",
    description: "Training 200 youth in web development and digital marketing skills",
    location: "Lagos, Nigeria",
    startDate: "2023-06-15",
    endDate: "2023-07-15",
    status: "Active",
    progress: 65,
    team: 8,
    image: "/project1.jpg",
  },
  {
    id: 2,
    title: "Community Health Outreach",
    description: "Free medical checkups and health education for underserved communities",
    location: "Accra, Ghana",
    startDate: "2023-07-08",
    endDate: "2023-07-10",
    status: "Upcoming",
    progress: 0,
    team: 15,
    image: "/project2.jpg",
  },
  {
    id: 3,
    title: "Women Entrepreneurship Program",
    description: "Business training and microloans for women-owned small businesses",
    location: "Nairobi, Kenya",
    startDate: "2023-05-01",
    endDate: "2023-08-30",
    status: "Active",
    progress: 40,
    team: 6,
    image: "/project3.jpg",
  },
  {
    id: 4,
    title: "Youth Leadership Summit",
    description: "Developing leadership skills in young people across Africa",
    location: "Virtual",
    startDate: "2023-04-10",
    endDate: "2023-04-12",
    status: "Completed",
    progress: 100,
    team: 12,
    image: "/project4.jpg",
  },
  {
    id: 5,
    title: "Agricultural Training Initiative",
    description: "Teaching sustainable farming techniques to rural communities",
    location: "Abuja, Nigeria",
    startDate: "2023-03-15",
    endDate: "2023-06-15",
    status: "Completed",
    progress: 100,
    team: 10,
    image: "/project5.jpg",
  },
]

export default function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter projects based on search term and active tab
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && project.status.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Management</h1>
          <p className="text-gray-500">Manage and track organizational projects</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No projects found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
        <div className="absolute top-4 right-4">
          <Badge
            className={`
              ${project.status === "Active" ? "bg-green-600" : ""}
              ${project.status === "Upcoming" ? "bg-blue-600" : ""}
              ${project.status === "Completed" ? "bg-gray-600" : ""}
            `}
          >
            {project.status}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="mr-2 h-4 w-4" />
            {project.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="mr-2 h-4 w-4" />
            {project.team} team members
          </div>

          {project.status !== "Upcoming" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/membership/dashboard/projects/${project.id}`}>View Details</Link>
        </Button>
        <Button variant="ghost" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Report
        </Button>
      </CardFooter>
    </Card>
  )
}
