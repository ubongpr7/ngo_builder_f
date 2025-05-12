"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  UserPlus,
  Mail,
  Calendar,
  Briefcase,
  AlertTriangle,
  Loader2,
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  CalendarIcon,
} from "lucide-react"
import { format } from "date-fns"

import {
  useGetProjectTeamQuery,
  useDeleteTeamMemberMutation,
  useChangeTeamMemberRoleMutation,
  useExtendTeamMembershipMutation,
} from "@/redux/features/projects/teamMemberApiSlice"
import { AddTeamMemberDialog } from "./add-team-member-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface ProjectTeamProps {
  projectId: number
}

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  const { data: teamMembers = [], isLoading, refetch } = useGetProjectTeamQuery(projectId)
  const [deleteTeamMember, { isLoading: isDeleting }] = useDeleteTeamMemberMutation()
  const [changeRole, { isLoading: isChangingRole }] = useChangeTeamMemberRoleMutation()
  const [extendMembership, { isLoading: isExtending }] = useExtendTeamMembershipMutation()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // State for role change dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<number | null>(null)
  const [newRole, setNewRole] = useState("")

  // State for extend membership dialog
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined)

  // Filter team members based on search term and active tab
  const filteredMembers = teamMembers.filter((member) => {
    const user = member.user_details || { first_name: "", last_name: "", email: "" }
    const matchesSearch =
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case "monitoring":
        return "bg-teal-100 text-teal-800 border-teal-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await deleteTeamMember(id).unwrap()
        refetch()
      } catch (error) {
        console.error("Failed to delete team member:", error)
      }
    }
  }

  const openRoleDialog = (member: any) => {
    setSelectedMember(member.id)
    setNewRole(member.role)
    setRoleDialogOpen(true)
  }

  const handleRoleChange = async () => {
    if (!selectedMember || !newRole) return

    try {
      await changeRole({ id: selectedMember, role: newRole }).unwrap()
      setRoleDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Failed to change role:", error)
    }
  }

  const openExtendDialog = (member: any) => {
    setSelectedMember(member.id)
    setNewEndDate(member.end_date ? new Date(member.end_date) : new Date())
    setExtendDialogOpen(true)
  }

  const handleExtendMembership = async () => {
    if (!selectedMember || !newEndDate) return

    try {
      await extendMembership({
        id: selectedMember,
        endDate: format(newEndDate, "yyyy-MM-dd"),
      }).unwrap()
      setExtendDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Failed to extend membership:", error)
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
        <AddTeamMemberDialog
          projectId={projectId}
          onSuccess={refetch}
          trigger={
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          }
        />
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
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
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
            <AddTeamMemberDialog
              projectId={projectId}
              onSuccess={refetch}
              trigger={
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Team Member
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const user = member.user_details || { first_name: "", last_name: "", email: "" }
            return (
              <Card key={member.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openExtendDialog(member)}>
                          <Clock className="mr-2 h-4 w-4" />
                          {member.end_date ? "Change End Date" : "Add End Date"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteMember(member.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=48&width=48&query=${encodeURIComponent(user.username || "user")}`}
                      />
                      <AvatarFallback>
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
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
                  <Button variant="outline" size="sm" onClick={() => openRoleDialog(member)}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Edit Role
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Team Member Role</DialogTitle>
            <DialogDescription>Update the role of this team member in the project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Project Manager</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="member">Team Member</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="monitoring">Monitoring/Reporting Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isChangingRole}>
              {isChangingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Membership Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update End Date</DialogTitle>
            <DialogDescription>Set or update the end date for this team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    {newEndDate ? format(newEndDate, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={newEndDate} onSelect={setNewEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExtendMembership} disabled={isExtending}>
              {isExtending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
