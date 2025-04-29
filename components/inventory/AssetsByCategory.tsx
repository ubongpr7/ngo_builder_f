"use client"

import { useEffect, useRef } from "react"

// This would be replaced with a real chart library like Chart.js or Recharts
// For now, we'll create a simple visual representation
export default function AssetsByCategory() {
  // Sample data - would come from your API
  const categories = [
    { name: "Electronics", count: 450, color: "#4ade80" },
    { name: "Furniture", count: 320, color: "#60a5fa" },
    { name: "Vehicles", count: 45, color: "#f97316" },
    { name: "Office Equipment", count: 210, color: "#8b5cf6" },
    { name: "Event Supplies", count: 180, color: "#ec4899" },
    { name: "Books", count: 79, color: "#14b8a6" },
  ]

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Calculate total for percentages
    const total = categories.reduce((sum, category) => sum + category.count, 0)

    // Draw pie chart
    let startAngle = 0
    categories.forEach((category) => {
      const sliceAngle = (2 * Math.PI * category.count) / total

      ctx.fillStyle = category.color
      ctx.beginPath()
      ctx.moveTo(100, 100)
      ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      startAngle += sliceAngle
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} width="200" height="200" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
            <div className="flex flex-1 justify-between">
              <span className="text-sm">{category.name}</span>
              <span className="text-sm font-medium">{category.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
