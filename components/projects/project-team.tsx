"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, Mail, Calendar, Briefcase, AlertTriangle, Loader2 } from "lucide-react"

// Mock API call - replace with actual API call
import { useGetProjectTeamQuery } from "@/services/projectsApiSlice"

interface ProjectTeamProps {
  projectId: number | string
}

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  const { data: teamMembers = [], isLoading } = useGetProjectTeamQuery(projectId)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter team members based on search term and active tab
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      `${member.user.first_name} ${member.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && member.role.toLowerCase() === activeTab.toLowerCase()
  })

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "coordinator":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "member":
        return "bg-green-100 text-green-800 border-green-300"
      case "advisor":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "volunteer":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading team members...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Project Team</h2>
          <p className="text-gray-500">Manage team members assigned to this project</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search team members..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="manager">Managers</TabsTrigger>
            <TabsTrigger value="coordinator">Coordinators</TabsTrigger>
            <TabsTrigger value="member">Members</TabsTrigger>
            <TabsTrigger value="advisor">Advisors</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Team Members Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No team members match your search criteria. Try a different search term."
                : "No team members have been assigned to this project yet."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Add First Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={`${member.user.id}-${member.role}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={getRoleBadgeColor(member.role)}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?height=48&width=48&query=${encodeURIComponent(member.user.username)}`}
                    />
                    <AvatarFallback>
                      {member.user.first_name?.[0]}
                      {member.user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.user.first_name} {member.user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </div>
                </div>

                {member.responsibilities && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">Responsibilities</div>
                    <p className="text-sm text-gray-700">{member.responsibilities}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Joined</span>
                    </div>
                    <span>{new Date(member.join_date).toLocaleDateString()}</span>
                  </div>
                  {member.end_date && (
                    <div className="flex justify-between">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>End Date</span>
                      </div>
                      <span>{new Date(member.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Edit Role
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
