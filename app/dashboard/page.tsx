import { DashboardCard } from "@/components/ui/dashboard-card"
import { Users, Calendar, FileText, Award } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard
          title="Members"
          value="2,350"
          description="Active members"
          icon={<Users className="h-4 w-4 text-black" />}
          trend={{ value: 10.1, isPositive: true }}
        />

        <DashboardCard
          title="Events"
          value="24"
          description="Upcoming events"
          icon={<Calendar className="h-4 w-4 text-black" />}
          trend={{ value: 5.2, isPositive: true }}
        />

        <DashboardCard
          title="Resources"
          value="156"
          description="Available resources"
          icon={<FileText className="h-4 w-4 text-black" />}
          trend={{ value: 12.2, isPositive: true }}
        />

        <DashboardCard
          title="Achievements"
          value="47"
          description="Community milestones"
          icon={<Award className="h-4 w-4 text-black" />}
          trend={{ value: 8.5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4  ">Recent Announcements</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium">New Community Initiative Launch</h3>
              <p className="text-sm text-gray-600">
                We're excited to announce our new youth empowerment program starting next month.
              </p>
              <p className="text-xs text-gray-500 mt-1">Posted 2 days ago</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-medium">Quarterly Membership Meeting</h3>
              <p className="text-sm text-gray-600">Join us for our quarterly membership meeting on August 15th.</p>
              <p className="text-xs text-gray-500 mt-1">Posted 1 week ago</p>
            </div>
            <div>
              <h3 className="font-medium">Website Updates</h3>
              <p className="text-sm text-gray-600">We've made several improvements to our membership portal.</p>
              <p className="text-xs text-gray-500 mt-1">Posted 2 weeks ago</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            <div className="flex gap-4 border-b pb-4">
              <div className="text-black bg-[#FDD65B] p-2 rounded text-center min-w-[60px]">
                <div className="text-sm font-bold">AUG</div>
                <div className="text-xl font-bold">15</div>
              </div>
              <div>
                <h3 className="font-medium">Quarterly Membership Meeting</h3>
                <p className="text-sm text-gray-600">Virtual • 3:00 PM WAT</p>
              </div>
            </div>
            <div className="flex gap-4 border-b pb-4">
              <div className="text-black bg-[#FDD65B] p-2 rounded text-center min-w-[60px]">
                <div className="text-sm font-bold">AUG</div>
                <div className="text-xl font-bold">22</div>
              </div>
              <div>
                <h3 className="font-medium">Leadership Workshop</h3>
                <p className="text-sm text-gray-600">Lagos Office • 10:00 AM WAT</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-black bg-[#FDD65B] p-2 rounded text-center min-w-[60px]">
                <div className="text-sm font-bold">SEP</div>
                <div className="text-xl font-bold">05</div>
              </div>
              <div>
                <h3 className="font-medium">Community Outreach Program</h3>
                <p className="text-sm text-gray-600">Abuja • 9:00 AM WAT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#171717] p-6 rounded-lg border border-black">
        <h2 className="text-xl font-bold mb-2 text-[#fdd65b]">Complete Your Profile</h2>
        <p className="mb-4 text-white">
          Your profile is 70% complete. Finish setting up your profile to get the most out of your membership.
        </p>
        <Link href="/dashboard/profile" className="bg-[#FDD65B] text-black px-4 py-2 rounded hover:bg-green-700 hover:text-white">
          Update Profile
        </Link>
      </div>
    </div>
  )
}
