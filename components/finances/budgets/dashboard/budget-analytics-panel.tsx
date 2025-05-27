"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Building2, Activity, Zap } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface BudgetAnalyticsPanelProps {
  statistics: any
  isLoading: boolean
}

export function BudgetAnalyticsPanel({ statistics, isLoading }: BudgetAnalyticsPanelProps) {
  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  // Advanced analytics data
  const performanceMetrics = [
    {
      metric: "Budget Accuracy",
      value: Math.round(statistics?.performance_metrics?.budget_accuracy || 0),
      target: 90,
      trend: "up",
    },
    {
      metric: "Spend Velocity",
      value: Math.round(statistics?.performance_metrics?.spend_velocity || 0),
      target: 75,
      trend: "down",
    },
    {
      metric: "Forecast Precision",
      value: Math.round(statistics?.performance_metrics?.forecast_precision || 0),
      target: 85,
      trend: "up",
    },
    {
      metric: "Approval Efficiency",
      value: Math.round(statistics?.performance_metrics?.approval_efficiency || 0),
      target: 80,
      trend: "down",
    },
    {
      metric: "Resource Utilization",
      value: Math.round(statistics?.performance_metrics?.resource_utilization || 0),
      target: 85,
      trend: "stable",
    },
  ]

  const departmentPerformance =
    statistics?.by_department?.length > 0
      ? statistics.by_department.map((dept: any) => ({
          department: dept.department_name || "Unknown",
          efficiency: Math.round(dept.avg_utilization || 0),
          utilization: Math.round(dept.avg_utilization || 0),
          variance: Math.round((dept.avg_utilization || 0) - 75), // variance from 75% target
        }))
      : [{ department: "No Data", efficiency: 0, utilization: 0, variance: 0 }]

  const budgetHealthMatrix =
    statistics?.utilization_summary?.map((item: any) => ({
      name: item.budget_title.substring(0, 15),
      utilization: Number.parseFloat(item.utilization_percentage),
      variance: Math.random() * 20 - 10, // Mock variance data
      risk:
        Number.parseFloat(item.utilization_percentage) > 90
          ? "High"
          : Number.parseFloat(item.utilization_percentage) > 75
            ? "Medium"
            : "Low",
    })) || []

  const forecastData = [
    { month: "Jul", projected: 210000, actual: 195000, confidence: 85 },
    { month: "Aug", projected: 225000, actual: null, confidence: 82 },
    { month: "Sep", projected: 240000, actual: null, confidence: 78 },
    { month: "Oct", projected: 255000, actual: null, confidence: 75 },
    { month: "Nov", projected: 270000, actual: null, confidence: 72 },
    { month: "Dec", projected: 285000, actual: null, confidence: 70 },
  ]

  const riskAnalysis = [
    {
      category: "Overspend Risk",
      value: Math.round(statistics?.risk_analysis?.overspend_risk || 0),
      color: "#EF4444",
    },
    {
      category: "Underspend Risk",
      value: Math.round(statistics?.risk_analysis?.underspend_risk || 0),
      color: "#F59E0B",
    },
    {
      category: "Timeline Risk",
      value: Math.round(statistics?.risk_analysis?.timeline_risk || 0),
      color: "#8B5CF6",
    },
    {
      category: "Resource Risk",
      value: Math.round(statistics?.risk_analysis?.resource_risk || 0),
      color: "#06B6D4",
    },
    {
      category: "Compliance Risk",
      value: Math.round(statistics?.risk_analysis?.compliance_risk || 0),
      color: "#10B981",
    },
  ].filter((item) => item.value > 0) // Only show risks that exist

  // If no risks, show a default "No Risk" item
  if (riskAnalysis.length === 0) {
    riskAnalysis.push({ category: "No Active Risks", value: 100, color: "#10B981" })
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">{metric.metric}</h4>
                {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                {metric.trend === "stable" && <Activity className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="text-2xl font-bold mb-2">{metric.value}%</div>
              <Progress value={metric.value} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">Target: {metric.target}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Budget Forecast & Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecastData.every((item) => item.projected === 0) ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No forecast data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "confidence" ? `${value}%` : `$${value?.toLocaleString()}`,
                      name === "projected" ? "Projected" : name === "actual" ? "Actual" : "Confidence",
                    ]}
                  />
                  <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={3} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="confidence" stroke="#F59E0B" strokeWidth={2} yAxisId="right" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskAnalysis}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Risk Level"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            Department Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={departmentPerformance}>
              <PolarGrid />
              <PolarAngleAxis dataKey="department" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Efficiency" dataKey="efficiency" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Utilization" dataKey="utilization" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Health Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Budget Health Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={budgetHealthMatrix}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="utilization" name="Utilization %" domain={[0, 100]} />
              <YAxis type="number" dataKey="variance" name="Variance %" domain={[-20, 20]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => [`${value}%`, name === "utilization" ? "Utilization" : "Variance"]}
              />
              <Scatter
                name="Budgets"
                dataKey="variance"
                fill={(entry: any) =>
                  entry.risk === "High" ? "#EF4444" : entry.risk === "Medium" ? "#F59E0B" : "#10B981"
                }
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Top Performer</h3>
                <p className="text-sm text-muted-foreground">Operations Department</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Efficiency</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Needs Attention</h3>
                <p className="text-sm text-muted-foreground">Admin Department</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Efficiency</span>
                <span className="text-sm font-medium">76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Forecast Accuracy</h3>
                <p className="text-sm text-muted-foreground">Next Quarter</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Confidence</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
