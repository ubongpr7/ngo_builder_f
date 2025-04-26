import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Calendar, FileText, ArrowRight, Package } from "lucide-react"
import Link from "next/link"

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back, John Doe</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            General Member
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Lagos Chapter
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">4 active, 8 completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">+4 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500">Next: Leadership Workshop</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86</div>
            <p className="text-xs text-gray-500">12 categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                title="Project Report Submitted"
                description="Digital Skills Workshop - Q2 Report"
                time="2 hours ago"
              />
              <ActivityItem title="New Team Member" description="Sarah Okafor joined your team" time="Yesterday" />
              <ActivityItem
                title="Inventory Updated"
                description="Added 5 new laptops to inventory"
                time="3 days ago"
              />
              <ActivityItem
                title="Event Registration"
                description="Registered for Leadership Summit 2023"
                time="1 week ago"
              />
            </div>
            <Button variant="link" className="px-0 mt-4">
              View all activities <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you're registered for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <EventItem title="Leadership Workshop" date="June 15, 2023" location="Lagos, Nigeria" />
              <EventItem title="Digital Skills Bootcamp" date="July 8-10, 2023" location="Virtual" />
              <EventItem title="Community Development Summit" date="August 22, 2023" location="Accra, Ghana" />
            </div>
            <Button asChild variant="link" className="px-0 mt-4">
              <Link href="/membership/dashboard/events">
                View all events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Statistics</CardTitle>
          <CardDescription>Your project performance over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <BarChart3 className="h-16 w-16 text-gray-300" />
            <p className="mt-2 text-gray-500">Project statistics visualization will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string
  description: string
  time: string
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-green-100 rounded-full p-2">
        <FileText className="h-4 w-4 text-green-700" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="text-xs text-gray-400">{time}</div>
    </div>
  )
}

function EventItem({
  title,
  date,
  location,
}: {
  title: string
  date: string
  location: string
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-blue-100 rounded-full p-2">
        <Calendar className="h-4 w-4 text-blue-700" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{date}</p>
        <p className="text-xs text-gray-500">{location}</p>
      </div>
      <Button variant="outline" size="sm">
        Details
      </Button>
    </div>
  )
}
