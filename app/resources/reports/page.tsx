import type React from "react"
import type { Metadata } from "next"
import { FileText, BarChart, PieChart, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Reports | Destiny Builders",
  description: "Access our impact reports, project reports, and financial reports",
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Transparency and accountability are core values at Destiny Builders. We regularly publish reports on our
            activities, impact, and financial performance to keep our stakeholders informed and maintain trust.
          </p>
        </div>

        <Tabs defaultValue="impact" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="impact">Impact Reports</TabsTrigger>
            <TabsTrigger value="project">Project Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="impact" className="mt-6">
            <div className="space-y-4">
              <ReportCard
                title="Annual Impact Report 2023"
                description="A comprehensive overview of Destiny Builders' programs, activities, and impact across Africa in 2023."
                icon={<BarChart className="h-8 w-8 text-green-700" />}
                date="January 2024"
              />

              <ReportCard
                title="Semi-Annual Impact Report (July-December 2023)"
                description="Mid-year assessment of our programs and their impact on communities across our operational areas."
                icon={<BarChart className="h-8 w-8 text-green-700" />}
                date="January 2024"
              />

              <ReportCard
                title="Digital Literacy Program Impact Assessment"
                description="Detailed analysis of the outcomes and impact of our digital literacy programs in 10 African countries."
                icon={<BarChart className="h-8 w-8 text-green-700" />}
                date="November 2023"
              />

              <ReportCard
                title="Women Empowerment Initiative: 5-Year Impact Study"
                description="Longitudinal study of the impact of our women empowerment programs over a five-year period."
                icon={<BarChart className="h-8 w-8 text-green-700" />}
                date="October 2023"
              />
            </div>
          </TabsContent>

          <TabsContent value="project" className="mt-6">
            <div className="space-y-4">
              <ReportCard
                title="Lagos Digital Skills Workshop Final Report"
                description="Outcomes and lessons learned from the digital skills training program for 200 youth in Lagos."
                icon={<FileText className="h-8 w-8 text-green-700" />}
                date="August 2023"
              />

              <ReportCard
                title="Accra Community Health Outreach Report"
                description="Detailed report on the health education and services provided during the Accra outreach program."
                icon={<FileText className="h-8 w-8 text-green-700" />}
                date="July 2023"
              />

              <ReportCard
                title="Nairobi Women Entrepreneurship Program Mid-Term Report"
                description="Progress report on the business training and microloan program for women entrepreneurs in Nairobi."
                icon={<FileText className="h-8 w-8 text-green-700" />}
                date="June 2023"
              />

              <ReportCard
                title="Youth Leadership Summit Evaluation Report"
                description="Assessment of the outcomes and participant feedback from the virtual Youth Leadership Summit."
                icon={<FileText className="h-8 w-8 text-green-700" />}
                date="April 2023"
              />
            </div>
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <div className="space-y-4">
              <ReportCard
                title="Annual Financial Report 2023"
                description="Comprehensive financial statements and analysis for the fiscal year 2023."
                icon={<PieChart className="h-8 w-8 text-green-700" />}
                date="February 2024"
              />

              <ReportCard
                title="Q4 2023 Financial Summary"
                description="Financial performance and resource allocation for the fourth quarter of 2023."
                icon={<PieChart className="h-8 w-8 text-green-700" />}
                date="January 2024"
              />

              <ReportCard
                title="Q3 2023 Financial Summary"
                description="Financial performance and resource allocation for the third quarter of 2023."
                icon={<PieChart className="h-8 w-8 text-green-700" />}
                date="October 2023"
              />

              <ReportCard
                title="Q2 2023 Financial Summary"
                description="Financial performance and resource allocation for the second quarter of 2023."
                icon={<PieChart className="h-8 w-8 text-green-700" />}
                date="July 2023"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Request Specific Reports</h2>
          <p className="mb-4">
            If you're looking for a specific report that is not listed here, or if you need more detailed information
            about any of our programs or activities, please contact our reporting team.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReportCard({
  title,
  description,
  icon,
  date,
}: {
  title: string
  description: string
  icon: React.ReactNode
  date: string
}) {
  return (
    <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-green-100 p-4 flex items-center justify-center">{icon}</div>
      <div className="p-6 flex-1">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="text-xs text-gray-500">
          <span>Published: {date}</span>
        </div>
      </div>
      <div className="p-6 flex items-center">
        <div className="flex flex-col space-y-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Online
          </Button>
        </div>
      </div>
    </div>
  )
}
