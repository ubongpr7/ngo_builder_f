import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Clock, Users, MapPin, Briefcase, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Volunteer | Destiny Builders",
  description: "Volunteer opportunities with Destiny Builders Empowerment Foundation",
}

export default function VolunteerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Volunteer With Us</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Volunteering with Destiny Builders is a rewarding way to contribute your skills, time, and passion to
            transforming lives across Africa. Our volunteers play a crucial role in implementing our programs and
            initiatives, while gaining valuable experience and making a meaningful impact.
          </p>
        </div>

        <div className="relative h-80 rounded-xl overflow-hidden mb-12">
          <Image
            src="/volunteer-hero.jpg"
            alt="Destiny Builders volunteers working in a community"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Make a Difference</h2>
              <p className="max-w-lg">Join our team of dedicated volunteers working to build African destinies</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <VolunteerBenefitCard
            icon={<Heart className="h-8 w-8 text-green-600" />}
            title="Make an Impact"
            description="Contribute directly to transforming lives and communities across Africa."
          />
          <VolunteerBenefitCard
            icon={<Users className="h-8 w-8 text-green-600" />}
            title="Build Your Network"
            description="Connect with like-minded individuals committed to positive change."
          />
          <VolunteerBenefitCard
            icon={<Briefcase className="h-8 w-8 text-green-600" />}
            title="Develop Skills"
            description="Gain valuable experience and enhance your personal and professional skills."
          />
        </div>

        <h2 className="text-2xl font-bold mb-6">Volunteer Opportunities</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <VolunteerOpportunityCard
            title="Program Facilitator"
            commitment="4-6 hours per week"
            location="Various Locations"
            description="Lead workshops and training sessions in areas such as digital literacy, leadership development, or entrepreneurship."
            skills={["Teaching experience", "Communication skills", "Subject matter expertise"]}
          />
          <VolunteerOpportunityCard
            title="Community Outreach"
            commitment="3-5 hours per week"
            location="Various Locations"
            description="Help identify community needs, build relationships with local stakeholders, and promote Destiny Builders' programs."
            skills={["Strong interpersonal skills", "Cultural sensitivity", "Community engagement experience"]}
          />
          <VolunteerOpportunityCard
            title="Event Support"
            commitment="As needed (project-based)"
            location="Various Locations"
            description="Assist with planning and executing events, workshops, and conferences organized by Destiny Builders."
            skills={["Event planning", "Organizational skills", "Attention to detail"]}
          />
          <VolunteerOpportunityCard
            title="Content Creation"
            commitment="2-4 hours per week"
            location="Remote"
            description="Create educational content, training materials, blog posts, or social media content to support our programs."
            skills={["Writing skills", "Creativity", "Digital content creation"]}
          />
          <VolunteerOpportunityCard
            title="Mentorship"
            commitment="2-3 hours per week"
            location="In-person or Virtual"
            description="Provide guidance and support to program participants in your area of expertise."
            skills={["Professional experience", "Coaching skills", "Patience and empathy"]}
          />
          <VolunteerOpportunityCard
            title="Technical Support"
            commitment="As needed (project-based)"
            location="Remote"
            description="Support our digital initiatives, website maintenance, or IT infrastructure."
            skills={["Technical skills", "Problem-solving abilities", "Reliability"]}
          />
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold mb-4">Volunteer Recognition</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <p className="text-gray-600 mb-4">
                At Destiny Builders, we value and recognize the contributions of our volunteers. Our volunteer
                recognition program includes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Certificates of appreciation and service</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Annual volunteer appreciation events</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Volunteer of the Month/Year awards</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Letters of recommendation for dedicated volunteers</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Professional development opportunities</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/3">
              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 className="font-bold mb-2">Volunteer Hours</h3>
                <p className="text-gray-600 mb-4">We track and verify volunteer hours, which can be used for:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Academic requirements</li>
                  <li>• Professional certifications</li>
                  <li>• Resume building</li>
                  <li>• Community service credits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Join our team of dedicated volunteers and help us build African destinies and transform lives. Complete our
            volunteer application form to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="border border-green-700  hover:bg-green-700">
              <Link href="/membership/join" >Apply to Volunteer</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact Volunteer Coordinator</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function VolunteerBenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
      <div className="bg-green-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function VolunteerOpportunityCard({
  title,
  commitment,
  location,
  description,
  skills,
}: {
  title: string
  commitment: string
  location: string
  description: string
  skills: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-1" />
              <span>{commitment}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span>{location}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{description}</p>
        <div>
          <h4 className="font-medium mb-2">Required Skills:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {skills.map((skill, index) => (
              <li key={index} className="text-sm text-gray-600">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/membership/join" >Apply for this Role</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
