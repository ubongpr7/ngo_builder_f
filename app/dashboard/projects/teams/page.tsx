"use client"

import { useState } from "react"
import { Search, Plus, Mail, MapPin, AlertCircle, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  location: string
  profileImage?: string
  projects: string[]
  skills: string[]
}

interface Team {
  id: string
  name: string
  description: string
  members: TeamMember[]
  projects: string[]
  lead: string
}

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Sample teams data
  const teams: Team[] = [
    {
      id: "team-1",
      name: "Digital Skills Training Team",
      description: "Team responsible for delivering digital skills training workshops",
      lead: "Prosper Ubong",
      members: [
        {
          id: "member-1",
          name: "Prosper Ubong",
          role: "Team Lead",
          email: "prosper@example.com",
          phone: "+234 801 234 5678",
          location: "Lagos, Nigeria",
          profileImage:
            "https://destinybuilderssthree.s3.amazonaws.com/profile_images/20250509_144611_ubongpr7_gmail_com.jpg",
          projects: ["Digital Skills Workshop"],
          skills: ["Project Management", "Web Development", "Training"],
        },
        {
          id: "member-2",
          name: "Jane Smith",
          role: "Technical Trainer",
          email: "jane@example.com",
          phone: "+234 802 345 6789",
          location: "Lagos, Nigeria",
          projects: ["Digital Skills Workshop"],
          skills: ["Web Development", "UI/UX Design", "JavaScript"],
        },
        {
          id: "member-3",
          name: "David Okafor",
          role: "Assistant Trainer",
          email: "david@example.com",
          phone: "+234 803 456 7890",
          location: "Lagos, Nigeria",
          projects: ["Digital Skills Workshop"],
          skills: ["Digital Marketing", "Content Creation", "SEO"],
        },
      ],
      projects: ["Digital Skills Workshop"],
    },
    {
      id: "team-2",
      name: "Community Health Team",
      description: "Medical professionals providing health services to communities",
      lead: "Dr. Adeola Johnson",
      members: [
        {
          id: "member-4",
          name: "Dr. Adeola Johnson",
          role: "Medical Lead",
          email: "adeola@example.com",
          phone: "+233 501 234 5678",
          location: "Accra, Ghana",
          projects: ["Community Health Outreach"],
          skills: ["General Medicine", "Public Health", "Community Outreach"],
        },
        {
          id: "member-5",
          name: "Nurse Grace Mensah",
          role: "Community Nurse",
          email: "grace@example.com",
          phone: "+233 502 345 6789",
          location: "Accra, Ghana",
          projects: ["Community Health Outreach"],
          skills: ["Nursing", "Health Education", "First Aid"],
        },
        {
          id: "member-6",
          name: "Michael Okafor",
          role: "Health Educator",
          email: "michael@example.com",
          phone: "+233 503 456 7890",
          location: "Accra, Ghana",
          projects: ["Community Health Outreach"],
          skills: ["Health Education", "Community Engagement", "Public Speaking"],
        },
      ],
      projects: ["Community Health Outreach"],
    },
    {
      id: "team-3",
      name: "Women Entrepreneurship Team",
      description: "Team supporting women entrepreneurs with training and microloans",
      lead: "Sarah Kimani",
      members: [
        {
          id: "member-7",
          name: "Sarah Kimani",
          role: "Program Director",
          email: "sarah@example.com",
          phone: "+254 701 234 5678",
          location: "Nairobi, Kenya",
          projects: ["Women Entrepreneurship Program"],
          skills: ["Business Development", "Mentoring", "Financial Management"],
        },
        {
          id: "member-8",
          name: "Prosper Ubong",
          role: "Financial Advisor",
          email: "prosper@example.com",
          phone: "+234 801 234 5678",
          location: "Lagos, Nigeria",
          profileImage:
            "https://destinybuilderssthree.s3.amazonaws.com/profile_images/20250509_144611_ubongpr7_gmail_com.jpg",
          projects: ["Digital Skills Workshop", "Women Entrepreneurship Program"],
          skills: ["Project Management", "Financial Planning", "Microfinance"],
        },
        {
          id: "member-9",
          name: "Lucy Wambui",
          role: "Business Trainer",
          email: "lucy@example.com",
          phone: "+254 702 345 6789",
          location: "Nairobi, Kenya",
          projects: ["Women Entrepreneurship Program"],
          skills: ["Business Training", "Marketing", "Entrepreneurship"],
        },
      ],
      projects: ["Women Entrepreneurship Program"],
    },
  ]

  // Filter teams based on search query and active tab
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.projects.some((project) => project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      team.members.some((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "digital") return matchesSearch && team.name.includes("Digital")
    if (activeTab === "health") return matchesSearch && team.name.includes("Health")
    if (activeTab === "entrepreneurship") return matchesSearch && team.name.includes("Entrepreneurship")

    return matchesSearch
  })

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage project teams and team members</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> New Team
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search teams or members..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All Teams</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="entrepreneurship">Entrepreneurship</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">{team.name}</h3>
                  <p className="text-gray-600">{team.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {team.projects.map((project, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {project}
                    </Badge>
                  ))}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Team Lead</h4>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{team.lead}</span>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members ({team.members.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-start p-3 border rounded-md bg-gray-50">
                      <Avatar className="h-10 w-10 mr-3">
                        {member.profileImage ? (
                          <AvatarImage src={member.profileImage || "/placeholder.svg"} alt={member.name} />
                        ) : (
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h5 className="font-medium">{member.name}</h5>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{member.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No teams found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  )
}
