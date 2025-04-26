import Link from "next/link"
import type { Metadata } from "next"
import { FileText, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Publications | Destiny Builders",
  description: "Access our publications, research papers, and resources",
}

export default function PublicationsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Publications</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Destiny Builders Empowerment Foundation produces various publications to share knowledge, insights, and best
            practices in community development and empowerment. Browse our collection of reports, research papers,
            guides, and other resources.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Annual Reports</h2>

          <div className="space-y-4">
            <PublicationCard
              title="Annual Impact Report 2023"
              description="A comprehensive overview of Destiny Builders' programs, activities, and impact across Africa in 2023."
              type="PDF"
              size="4.2 MB"
              date="January 2024"
            />

            <PublicationCard
              title="Annual Impact Report 2022"
              description="Detailed report on our activities, achievements, and financial performance for the year 2022."
              type="PDF"
              size="3.8 MB"
              date="January 2023"
            />

            <PublicationCard
              title="Annual Impact Report 2021"
              description="Overview of our programs and impact during the challenging year of the global pandemic."
              type="PDF"
              size="3.5 MB"
              date="January 2022"
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Research Papers</h2>

          <div className="space-y-4">
            <PublicationCard
              title="Digital Literacy and Economic Empowerment in Rural Africa"
              description="Research study on the impact of digital skills training on economic opportunities in rural communities."
              type="PDF"
              size="2.7 MB"
              date="June 2023"
            />

            <PublicationCard
              title="Women Entrepreneurship: Challenges and Opportunities in African Markets"
              description="Analysis of the unique challenges faced by women entrepreneurs and strategies for success."
              type="PDF"
              size="3.1 MB"
              date="March 2023"
            />

            <PublicationCard
              title="Youth Leadership Development: A Framework for African Contexts"
              description="Comprehensive framework for developing youth leadership capacity in African contexts."
              type="PDF"
              size="2.4 MB"
              date="November 2022"
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Guides and Toolkits</h2>

          <div className="space-y-4">
            <PublicationCard
              title="Community Mobilization Toolkit"
              description="Practical guide for community leaders on mobilizing resources and engagement for development initiatives."
              type="PDF"
              size="5.2 MB"
              date="August 2023"
            />

            <PublicationCard
              title="Digital Skills Training Manual"
              description="Comprehensive training manual for digital literacy programs, including lesson plans and activities."
              type="PDF"
              size="6.8 MB"
              date="May 2023"
            />

            <PublicationCard
              title="Sustainable Agriculture Practices Guide"
              description="Guide to sustainable farming techniques adapted for different African climates and contexts."
              type="PDF"
              size="4.5 MB"
              date="February 2023"
            />
          </div>
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Request Custom Resources</h2>
          <p className="mb-4">
            Can't find what you're looking for? Destiny Builders can develop custom resources tailored to your specific
            needs or context. Contact our publications team to discuss your requirements.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function PublicationCard({
  title,
  description,
  type,
  size,
  date,
}: {
  title: string
  description: string
  type: string
  size: string
  date: string
}) {
  return (
    <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-green-100 p-4 flex items-center justify-center">
        <FileText className="h-8 w-8 text-green-700" />
      </div>
      <div className="p-6 flex-1">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>Type: {type}</span>
          <span>Size: {size}</span>
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
