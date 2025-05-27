"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Activity, Zap, Eye } from "lucide-react"

interface BudgetUtilizationMatrixProps {
  budgets: any[]
  isLoading: boolean
}

export function BudgetUtilizationMatrix({ budgets, isLoading }: BudgetUtilizationMatrixProps) {
  // Mock utilization data - replace with real calculations
  const utilizationData = [
    {
      id: 1,
      name: "Emergency Relief Fund",
      type: "Emergency",
      allocated: 500000,
      spent: 425000,
      utilization: 85,
      efficiency: 92,
      velocity: 15000, // spending per day
      daysRemaining: 45,
      status: "healthy",
      trend: "stable",
      riskScore: 25,
    },
    {
      id: 2,
      name: "Education Program 2024",
      type: "Program",
      allocated: 750000,
      spent: 675000,
      utilization: 90,
      efficiency: 88,
      velocity: 12000,
      daysRemaining: 30,
      status: "warning",
      trend: "up",
      riskScore: 65,
    },
    {
      id: 3,
      name: "Healthcare Initiative",
      type: "Program",
      allocated: 1200000,
      spent: 840000,
      utilization: 70,
      efficiency: 95,
      velocity: 18000,
      daysRemaining: 60,
      status: "healthy",
      trend: "up",
      riskScore: 20,
    },
    {
      id: 4,
      name: "Administrative Operations",
      type: "Operational",
      allocated: 300000,
      spent: 285000,
      utilization: 95,
      efficiency: 78,
      velocity: 8000,
      daysRemaining: 15,
      status: "critical",
      trend: "up",
      riskScore: 85,
    },
    {
      id: 5,
      name: "Research & Development",
      type: "Project",
      allocated: 400000,
      spent: 200000,
      utilization: 50,
      efficiency: 96,
      velocity: 5000,
      daysRemaining: 120,
      status: "underutilized",
      trend: "down",
      riskScore: 15,
    },
    {
      id: 6,
      name: "Marketing Campaign Q1",
      type: "Marketing",
      allocated: 150000,
      spent: 135000,
      utilization: 90,
      efficiency: 85,
      velocity: 4500,
      daysRemaining: 20,
      status: "warning",
      trend: "stable",
      riskScore: 55,
    },
  ]

  const scatterData = utilizationData.map((budget) => ({
    x: budget.utilization,
    y: budget.efficiency,
    z: budget.allocated / 10000, // Size of bubble
    name: budget.name,
    status: budget.status,
    riskScore: budget.riskScore,
  }))

  const velocityData = utilizationData.map((budget, index) => ({
    name: budget.name.substring(0, 15) + "...",
    velocity: budget.velocity,
    utilization: budget.utilization,
    efficiency: budget.efficiency,
    index,
  }))

  const riskMatrix = utilizationData.map((budget) => ({
    name: budget.name,
    utilization: budget.utilization,
    riskScore: budget.riskScore,
    status: budget.status,
  }))

  function getStatusColor(status: string) {
    switch (status) {
      case "healthy":
        return "#10b981"
      case "warning":
        return "#f59e0b"
      case "critical":
        return "#ef4444"
      case "underutilized":
        return "#6b7280"
      default:
        return "#3b82f6"
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "underutilized":
        return <TrendingDown className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  function getRiskLevel(score: number) {
    if (score >= 70) return { level: "High", color: "destructive" }
    if (score >= 40) return { level: "Medium", color: "secondary" }
    return { level: "Low", color: "default" }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Utilization Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Utilization</p>
                <p className="text-3xl font-bold text-blue-900">
                  {Math.round(utilizationData.reduce((acc, b) => acc + b.utilization, 0) / utilizationData.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Efficiency</p>
                <p className="text-3xl font-bold text-green-900">
                  {Math.round(utilizationData.reduce((acc, b) => acc + b.efficiency, 0) / utilizationData.length)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High Risk</p>
                <p className="text-3xl font-bold text-orange-900">
                  {utilizationData.filter((b) => b.riskScore >= 70).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Velocity</p>
                <p className="text-3xl font-bold text-purple-900">
                  ${Math.round(utilizationData.reduce((acc, b) => acc + b.velocity, 0) / utilizationData.length / 1000)}
                  K/day
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization vs Efficiency Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization vs Efficiency Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Utilization" unit="%" domain={[0, 100]} />
                <YAxis type="number" dataKey="y" name="Efficiency" unit="%" domain={[0, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p>Utilization: {data.x}%</p>
                          <p>Efficiency: {data.y}%</p>
                          <p>Risk Score: {data.riskScore}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Budgets" data={scatterData} fill="#3b82f6">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending Velocity */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Velocity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}/day`, "Velocity"]} />
                <Bar dataKey="velocity" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Assessment Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="utilization" name="Utilization" unit="%" domain={[0, 100]} />
                <YAxis type="number" dataKey="riskScore" name="Risk Score" domain={[0, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p>Utilization: {data.utilization}%</p>
                          <p>Risk Score: {data.riskScore}</p>
                          <p>Status: {data.status}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Risk" data={riskMatrix} fill="#ef4444">
                  {riskMatrix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Efficiency Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#3b82f6" name="Utilization %" />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Utilization Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Velocity</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilizationData.map((budget) => {
                const risk = getRiskLevel(budget.riskScore)
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{budget.type}</Badge>
                    </TableCell>
                    <TableCell>${budget.allocated.toLocaleString()}</TableCell>
                    <TableCell>${budget.spent.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={budget.utilization} className="w-16 h-2" />
                        <span className="text-sm font-medium">{budget.utilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>{budget.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>${(budget.velocity / 1000).toFixed(1)}K/day</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{budget.daysRemaining} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={risk.color as any}>{risk.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(budget.status)}
                        {getTrendIcon(budget.trend)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
