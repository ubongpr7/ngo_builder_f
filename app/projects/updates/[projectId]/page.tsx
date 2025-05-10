"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Calendar, MapPin, Users, ChevronRight, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UpdateCard from "@/components/projects/UpdateCard"

// Sample project data - replace with actual API call
const SAMPLE_PROJECTS = {
  "digital-skills": {
    id: "digital-skills",
    name: "Digital Skills Workshop",
    description: "Training 200 youth in web development and digital marketing skills",
    location: "Lagos, Nigeria",
    startDate: "2025-05-15",
    endDate: "2025-07-15",
    progress: 35,
    status: "active",
    lead: {
      id: "1",
      name: "Prosper Ubong",
      avatar: "https://destinybuilderssthree.s3.amazonaws.com/profile_images/20250509_144611_ubongpr7_gmail_com.jpg",
    },
    team: [
      { id: "1", name: "Prosper Ubong", role: "Project Lead" },
      { id: "4", name: "Chioma Okafor", role: "Technical Trainer" },
      { id: "5", name: "David Adebayo", role: "Marketing Specialist" },
    ],
    milestones: [
      { id: "m1", name: "Curriculum Development", completed: true, date: "2025-05-20" },
      { id: "m2", name: "Participant Selection", completed: true, date: "2025-06-01" },
      { id: "m3", name: "Training Sessions", completed: false, date: "2025-06-15" },
      { id: "m4", name: "Final Projects", completed: false, date: "2025-07-10" },
    ],
  },
  "community-health": {
    id: "community-health",
    name: "Community Health Outreach",
    description: "Free medical checkups and health education for underserved communities",
    location: "Accra, Ghana",
    startDate: "2025-06-01",
    endDate: "2025-08-30",
    progress: 15,
    status: "upcoming",
    lead: {
      id: "2",
      name: "Grace Adeyemi",
      avatar: "",
    },
    team: [
      { id: "2", name: "Grace Adeyemi", role: "Project Lead" },
      { id: "6", name: "Dr. Kwame Mensah", role: "Medical Director" },
      { id: "7", name: "Abena Osei", role: "Community Liaison" },
    ],
    milestones: [
      { id: "m1", name: "Medical Supply Procurement", completed: true, date: "2025-06-10" },
      { id: "m2", name: "Volunteer Training", completed: false, date: "2025-06-20" },
      { id: "m3", name: "Community Outreach Events", completed: false, date: "2025-07-15" },
      { id: "m4", name: "Follow-up Care Program", completed: false, date: "2025-08-15" },
    ],
  },
  "women-entrepreneurship": {
    id: "women-entrepreneurship",
    name: "Women Entrepreneurship Program",
    description: "Business training and microloans for women-owned small businesses",
    location: "Nairobi, Kenya",
    startDate: "2025-04-01",
    endDate: "2025-09-30",
    progress: 60,
    status: "active",
    lead: {
      id: "3",
      name: "Amina Kimathi",
      avatar: "",
    },
    team: [
      { id: "3", name: "Amina Kimathi", role: "Project Lead" },
      { id: "8", name: "Sarah Mwangi", role: "Financial Advisor" },
      { id: "9", name: "John Kariuki", role: "Business Coach" },
    ],
    milestones: [
      { id: "m1", name: "Participant Selection", completed: true, date: "2025-04-15" },
      { id: "m2", name: "Business Training Workshops", completed: true, date: "2025-05-30" },
      { id: "m3", name: "Microloan Distribution", completed: true, date: "2025-06-15" },
      { id: "m4", name: "Business Launch Support", completed: false, date: "2025-08-01" },
      { id: "m5", name: "Mentorship Program", completed: false, date: "2025-09-15" },
    ],
  },
}

// Sample updates data - replace with actual API call
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
    id: "4",
    projectId: "digital-skills",
    title: "Curriculum Finalized",
    description:
      "Completed the curriculum for the entire workshop series. Topics include HTML/CSS, JavaScript, React basics, and digital marketing fundamentals.",
    date: "2025-05-05T10:15:00Z",
    author: {
      id: "4",
      name: "Chioma Okafor",
      avatar: "",
    },
    category: "progress",
    status: "completed",
    project: {
      id: "digital-skills",
      name: "Digital Skills Workshop",
      location: "Lagos, Nigeria",
    },
    media: [],
    reactions: {
      likes: 15,
      celebrates: 7,
      supports: 3,
    },
    commentCount: 5,
  },
  {
    id: "5",
    projectId: "digital-skills",
    title: "Venue Secured",
    description:
      "Secured the training venue at Lagos Tech Hub. The space can accommodate up to 60 participants and has reliable internet and power backup.",
    date: "2025-05-02T16:45:00Z",
    author: {
      id: "1",
      name: "Prosper Ubong",
      avatar: "https://destinybuilderssthree.s3.amazonaws.com/profile_images/20250509_144611_ubongpr7_gmail_com.jpg",
    },
    category: "logistics",
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
        caption: "Lagos Tech Hub venue",
      },
    ],
    reactions: {
      likes: 18,
      celebrates: 5,
      supports: 2,
    },
    commentCount: 3,
  },
]

export default function ProjectUpdatesPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState(SAMPLE_PROJECTS[projectId as keyof typeof SAMPLE_PROJECTS])
  const [updates, setUpdates] = useState<typeof SAMPLE_UPDATES>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // In a real app, fetch project data based on projectId
    setProject(SAMPLE_PROJECTS[projectId as keyof typeof SAMPLE_PROJECTS])

    // Filter updates for this project
    const projectUpdates = SAMPLE_UPDATES.filter((update) => update.projectId === projectId)
    setUpdates(projectUpdates)
  }, [projectId])

  if (!project) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/projects/updates">Back to All Updates</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/projects/updates" className="hover:text-green-600">
            Project Updates
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-gray-900">{project.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
                <Badge
                  className={`ml-3 ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status === "active" ? "Active" : project.status === "upcoming" ? "Upcoming" : "Completed"}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString()} -{" "}
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{project.team.length} Team Members</span>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col items-end">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">Project Lead:</span>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={project.lead.avatar || "/placeholder.svg"} alt={project.lead.name} />
                    <AvatarFallback>
                      {project.lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{project.lead.name}</span>
                </div>
              </div>

              <div className="w-full md:w-48 mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                <Link href={`/projects/updates/${projectId}/create`} className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Update
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start">
                    <div
                      className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center ${
                        milestone.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {milestone.completed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="h-3 w-3 rounded-full bg-gray-300"></span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${milestone.completed ? "text-gray-900" : "text-gray-600"}`}>
                        {milestone.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.team.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All Updates</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            </TabsList>
          </Tabs>

          {updates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No updates yet</h3>
              <p className="mt-2 text-gray-500">Be the first to add an update to this project</p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                <Link href={`/projects/updates/${projectId}/create`}>Add First Update</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {updates
                .filter((update) => activeTab === "all" || update.category === activeTab)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((update) => (
                  <UpdateCard key={update.id} update={update} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
