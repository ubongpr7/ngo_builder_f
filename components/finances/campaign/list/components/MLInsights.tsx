import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react"

interface MLInsight {
  type: "prediction" | "recommendation" | "alert" | "opportunity"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  actionable: boolean
}

interface MLInsightsProps {
  insights: MLInsight[]
}

export function MLInsights({ insights }: MLInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return <TrendingUp className="h-5 w-5" />
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />
      case "alert":
        return <AlertTriangle className="h-5 w-5" />
      case "opportunity":
        return <Target className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "prediction":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "recommendation":
        return "bg-green-50 border-green-200 text-green-800"
      case "alert":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "opportunity":
        return "bg-purple-50 border-purple-200 text-purple-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-6 w-6 mr-2" />
          AI Insights & Recommendations
        </CardTitle>
        <CardDescription>Machine learning-powered insights based on your campaign data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getImpactVariant(insight.impact)} className="text-xs">
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm">{insight.description}</p>
                  </div>
                </div>
                {insight.actionable && (
                  <Button variant="outline" size="sm" className="ml-4">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
