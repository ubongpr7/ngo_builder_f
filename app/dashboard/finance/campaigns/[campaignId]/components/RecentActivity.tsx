import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency-utils"
import { format, parseISO } from "date-fns"
import { Activity, DollarSign, User, Clock } from "lucide-react"

interface RecentActivityProps {
  donations: any
  campaignId: number
}

export function RecentActivity({ donations, campaignId }: RecentActivityProps) {
  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div>
        <h3 className="text-2xl font-bold">Recent Activity</h3>
        <p className="text-muted-foreground">Latest donations and campaign activities</p>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Recent Donations
          </CardTitle>
          <CardDescription>Latest {donations?.results?.length || 0} donations to this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donations?.results?.map((donation: any, index: number) => (
              <div key={donation.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {donation.donor?.name || `Donor #${donation.donor?.id || "Anonymous"}`}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {donation.donation_date
                        ? format(parseISO(donation.donation_date), "MMM dd, yyyy HH:mm")
                        : "Unknown date"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(donation.currency?.code || "USD", donation.amount)}
                  </div>
                  <Badge variant={donation.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {donation.status}
                  </Badge>
                </div>
              </div>
            ))}
            {(!donations?.results || donations.results.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent donations found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Campaign milestones and important events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Campaign launched</div>
                <div className="text-sm text-muted-foreground">Campaign went live and started accepting donations</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium">First donation received</div>
                <div className="text-sm text-muted-foreground">Campaign received its first contribution</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium">25% milestone reached</div>
                <div className="text-sm text-muted-foreground">Campaign reached 25% of its target goal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
