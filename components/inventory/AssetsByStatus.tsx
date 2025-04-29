"use client"

import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"

export default function AssetsByStatus() {
  // Sample data - would come from your API
  const statuses = [
    { name: "Available", count: 720, percentage: 56, color: "#22c55e" },
    { name: "In Use", count: 380, percentage: 30, color: "#3b82f6" },
    { name: "Maintenance", count: 120, percentage: 9, color: "#f59e0b" },
    { name: "Disposed", count: 64, percentage: 5, color: "#ef4444" },
  ]

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw bar chart
    const barWidth = 30
    const spacing = 15
    const startX = 40
    const startY = 150

    statuses.forEach((status, index) => {
      const barHeight = status.percentage * 1.5
      const x = startX + index * (barWidth + spacing)

      // Draw bar
      ctx.fillStyle = status.color
      ctx.fillRect(x, startY - barHeight, barWidth, barHeight)

      // Draw label
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(status.name, x + barWidth / 2, startY + 15)

      // Draw percentage
      ctx.fillStyle = "#111827"
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${status.percentage}%`, x + barWidth / 2, startY - barHeight - 5)
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} width="200" height="180" />
      </div>

      <div className="space-y-2">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="text-sm">{status.name}</span>
            </div>
            <Badge
              variant="outline"
              style={{ backgroundColor: `${status.color}20`, color: status.color, borderColor: `${status.color}40` }}
            >
              {status.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
