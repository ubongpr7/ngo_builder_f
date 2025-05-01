import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  footer?: ReactNode
  className?: string
}

export function DashboardCard({ title, value, description, icon, trend, footer, className }: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden bg-white", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
          {description && <CardDescription className="text-gray-500">{description}</CardDescription>}
        </div>
        {icon && <div className="h-9 w-9 rounded-md flex items-center justify-center bg-gray-100">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="flex items-center mt-1">
            <span
              className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {trend.isPositive ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-.916.369l-4.453-1.675a.75.75 0 01.526-1.406l3.094 1.161A19.422 19.422 0 007.596 7.47L3.5 11.565a.75.75 0 01-1.06 0L.22 9.344a.75.75 0 010-1.06l1-1.061z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trend.value}% {trend.label || (trend.isPositive ? "increase" : "decrease")}
            </span>
          </div>
        )}
      </CardContent>
      {footer && <CardFooter className="border-t border-gray-200">{footer}</CardFooter>}
    </Card>
  )
}
