"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, PenToolIcon as Tool, UserCheck, Plus, Edit } from "lucide-react"

export default function RecentActivity() {
  // Sample data - would come from your API
  const activities = [
    {
      id: 1,
      type: "movement",
      assetName: "Dell Laptop XPS 13",
      assetTag: "IT-LAP-001",
      user: {
        name: "John Smith",
        avatar: "/testimonial1.jpg",
        initials: "JS",
      },
      action: "moved from IT Storage to Lagos Office",
      timestamp: "2 hours ago",
      icon: <ArrowRight className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 2,
      type: "maintenance",
      assetName: "Projector",
      assetTag: "IT-PRJ-001",
      user: {
        name: "Sarah Johnson",
        avatar: "/testimonial2.jpg",
        initials: "SJ",
      },
      action: "scheduled maintenance for",
      timestamp: "5 hours ago",
      icon: <Tool className="h-4 w-4 text-amber-500" />,
    },
    {
      id: 3,
      type: "assignment",
      assetName: "Digital Camera",
      assetTag: "IT-CAM-001",
      user: {
        name: "Michael Brown",
        avatar: "/testimonial3.jpg",
        initials: "MB",
      },
      action: "assigned",
      timestamp: "Yesterday",
      icon: <UserCheck className="h-4 w-4 text-green-500" />,
    },
    {
      id: 4,
      type: "creation",
      assetName: "Leadership Training Books",
      assetTag: "LIB-BOK-001",
      user: {
        name: "Emma Wilson",
        avatar: "/board1.jpg",
        initials: "EW",
      },
      action: "added new asset",
      timestamp: "2 days ago",
      icon: <Plus className="h-4 w-4 text-purple-500" />,
    },
    {
      id: 5,
      type: "update",
      assetName: "Transport Van",
      assetTag: "VEH-VAN-001",
      user: {
        name: "David Lee",
        avatar: "/board2.jpg",
        initials: "DL",
      },
      action: "updated details for",
      timestamp: "3 days ago",
      icon: <Edit className="h-4 w-4 text-gray-500" />,
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">{activity.icon}</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{activity.user.name}</span>
            </div>
            <p className="text-sm text-gray-600">
              {activity.action} <span className="font-medium text-gray-900">{activity.assetName}</span> (
              {activity.assetTag})
            </p>
            <p className="text-xs text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
