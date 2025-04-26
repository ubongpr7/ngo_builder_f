"use client"

import { Button } from "@/components/ui/button"
import { Calendar, PenToolIcon as Tool } from "lucide-react"

export default function UpcomingMaintenance() {
  // This would be fetched from the API in a real application
  const maintenanceTasks = [
    {
      id: 1,
      asset: "Generator",
      dueDate: "2023-10-20",
      priority: "High",
      assignedTo: "Maintenance Team",
    },
    {
      id: 2,
      asset: "Air Conditioner",
      dueDate: "2023-10-25",
      priority: "Medium",
      assignedTo: "HVAC Contractor",
    },
    {
      id: 3,
      asset: "Company Van",
      dueDate: "2023-11-05",
      priority: "Low",
      assignedTo: "Auto Service",
    },
  ]

  return (
    <div className="space-y-4">
      {maintenanceTasks.map((task) => (
        <div key={task.id} className="flex items-start space-x-4">
          <div
            className={`bg-gray-100 rounded-full p-2 ${
              task.priority === "High" ? "bg-red-100" : task.priority === "Medium" ? "bg-amber-100" : "bg-blue-100"
            }`}
          >
            <Tool
              className={`h-4 w-4 ${
                task.priority === "High"
                  ? "text-red-500"
                  : task.priority === "Medium"
                    ? "text-amber-500"
                    : "text-blue-500"
              }`}
            />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{task.asset}</p>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Due: {task.dueDate}</span>
            </div>
            <p className="text-xs text-gray-500">Assigned to: {task.assignedTo}</p>
          </div>
          <Button variant="outline" size="sm">
            Schedule
          </Button>
        </div>
      ))}
    </div>
  )
}
