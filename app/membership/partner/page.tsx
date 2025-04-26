import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Handshake, Building, Globe, Users, BarChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Partner With Us | Destiny Builders",
  description: "Partnership opportunities with Destiny Builders Empowerment Foundation",
}

export default function PartnerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Partner With Us</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Destiny Builders Empowerment Foundation seeks strategic partnerships with organizations that share our
            vision for transforming lives and building African destinies. Through collaborative efforts, we can achieve
            greater impact and create sustainable change across communities.
          </p>
        </div>

        <div className="relative h-80 rounded-xl overflow-hidden mb-12">
          <Image src="/partnership-hero.jpg" alt="Destiny Builders partnership meeting" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Strategic Partnerships</h2>
              <p className="max-w-lg">Together, we can create greater impact and sustainable change</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Partnership Opportunities</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <PartnershipCard
            icon={<Building className="h-8 w-8 text-green-600" />}
            title="Corporate Partnerships"
            description="Collaborate with us on CSR initiatives, employee engagement programs, or strategic philanthropy to create shared value and social impact."
          />
          <PartnershipCard
            icon={<Globe className="h-8 w-8 text-green-600" />}
            title="NGO & Foundation Partnerships"
            description="Join forces with us to implement complementary programs, share resources, and maximize our collective impact in communities."
          />
          <PartnershipCard
            icon={<Users className="h-8 w-8 text-green-600" />}
            title="Government Partnerships"
            description="Work with us to develop and implement programs that align with public policy objectives and address community needs."
          />
          <PartnershipCard
            icon={<BarChart className="h-8 w-8 text-green-600" />}
            title="Academic Partnerships"
            description="Collaborate on research, training programs, and knowledge sharing to enhance our evidence-based approach to community development."
          />
        </div>

        <h2 className="text-2xl font-bold mb-6">Partnership Benefits</h2>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">For Your Organization</h3>
              <ul className="space-y-3">
                <BenefitItem>Enhanced corporate social responsibility profile</BenefitItem>
                <BenefitItem>Access to our continental network and community reach</BenefitItem>
                <BenefitItem>Co-branding opportunities and visibility</BenefitItem>
                <BenefitItem>Employee engagement and volunteer opportunities</BenefitItem>
                <BenefitItem>Measurable social impact and outcomes</BenefitItem>
                <BenefitItem>Tax benefits for eligible contributions</BenefitItem>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">For Communities</h3>
              <ul className="space-y-3">
                <BenefitItem>Increased resources for community development</BenefitItem>
                <BenefitItem>Access to expertise and specialized knowledge</BenefitItem>
                <BenefitItem>Sustainable and scalable program implementation</BenefitItem>
                <BenefitItem>Enhanced capacity building and skills development</BenefitItem>
                <BenefitItem>Innovative solutions to community challenges</BenefitItem>
                <BenefitItem>Long-term support for community initiatives</BenefitItem>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Our Partnership Approach</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <PartnershipStepCard
            number="01"
            title="Initial Consultation"
            description="We begin with a thorough discussion to understand your organization's goals, values, and areas of interest."
          />
          <PartnershipStepCard
            number="02"
            title="Partnership Design"
            description="Together, we develop a customized partnership framework that aligns with both organizations' objectives."
          />
          <PartnershipStepCard
            number="03"
            title="Implementation"
            description="We execute the partnership activities with clear communication, regular updates, and collaborative decision-making."
          />
          <PartnershipStepCard
            number="04"
            title="Monitoring & Evaluation"
            description="We track progress, measure outcomes, and assess the impact of our partnership activities."
          />
          <PartnershipStepCard
            number="05"
            title="Reporting & Recognition"
            description="We provide comprehensive reports and ensure appropriate recognition for your organization's contribution."
          />
          <PartnershipStepCard
            number="06"
            title="Growth & Sustainability"
            description="We explore opportunities to expand and sustain the partnership for long-term impact."
          />
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100 mb-12">
          <h2 className="text-2xl font-bold mb-4">Current Partners</h2>
          <p className="text-gray-700 mb-6">
            We are proud to collaborate with a diverse range of partners who share our commitment to building African
            destinies and transforming lives.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <PartnerLogo name="Partner 1" />
            <PartnerLogo name="Partner 2" />
            <PartnerLogo name="Partner 3" />
            <PartnerLogo name="Partner 4" />
            <PartnerLogo name="Partner 5" />
            <PartnerLogo name="Partner 6" />
            <PartnerLogo name="Partner 7" />
            <PartnerLogo name="Partner 8" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Partner With Us?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Contact our partnerships team to discuss how we can collaborate to create meaningful impact and transform
            lives across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/contact">Contact Partnerships Team</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/resources/reports">View Impact Reports</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnershipCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="bg-green-50 p-3 rounded-full w-fit mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/contact">Learn More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <Handshake className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  )
}

function PartnershipStepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="bg-green-100 text-green-800 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="bg-white h-24 rounded-lg border border-gray-200 flex items-center justify-center">
      <span className="text-gray-400 font-medium">{name}</span>
    </div>
  )
}
