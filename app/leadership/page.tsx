import type { Metadata } from "next"
import Image from "next/image"
import { Linkedin, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Leadership | Destiny Builders",
  description: "Meet the leadership team of Destiny Builders Empowerment Foundation",
}

export default function LeadershipPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Our Leadership</h1>

        <div className="prose max-w-none mb-12">
          <p className="text-lg">
            Destiny Builders Empowerment Foundation is led by a dedicated team of visionaries committed to transforming
            lives across Africa. Our leadership brings together diverse expertise, experience, and passion for community
            development.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Executive Leadership</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LeadershipCard
              name="Dr. John Adeyemi"
              title="Founder & President"
              bio="Dr. Adeyemi has over 20 years of experience in community development and leadership training. He founded SDEI in 2010 and has led its evolution into Destiny Builders."
              image="/leader1.jpg"
              social={{
                linkedin: "https://linkedin.com",
                twitter: "https://twitter.com",
                email: "john@destinybuilders.africa",
              }}
            />

            <LeadershipCard
              name="Mrs. Grace Okafor"
              title="Executive Director"
              bio="With a background in organizational management and strategic planning, Mrs. Okafor oversees the day-to-day operations and implementation of Destiny Builders' programs."
              image="/leader2.jpg"
              social={{
                linkedin: "https://linkedin.com",
                twitter: "https://twitter.com",
                email: "grace@destinybuilders.africa",
              }}
            />

            <LeadershipCard
              name="Mr. Emmanuel Mwangi"
              title="Director of Programs"
              bio="Mr. Mwangi leads the design and implementation of Destiny Builders' programs across Africa, ensuring alignment with our mission and strategic objectives."
              image="/leader3.jpg"
              social={{
                linkedin: "https://linkedin.com",
                twitter: "https://twitter.com",
                email: "emmanuel@destinybuilders.africa",
              }}
            />

            <LeadershipCard
              name="Ms. Fatima Ibrahim"
              title="Director of Finance"
              bio="Ms. Ibrahim manages Destiny Builders' financial resources, ensuring transparency, accountability, and effective stewardship in all our operations."
              image="/leader4.jpg"
              social={{
                linkedin: "https://linkedin.com",
                email: "fatima@destinybuilders.africa",
              }}
            />

            <LeadershipCard
              name="Dr. Sarah Nkosi"
              title="Director of Research & Innovation"
              bio="Dr. Nkosi leads our research initiatives and drives innovation in our approaches to community development and empowerment."
              image="/leader5.jpg"
              social={{
                linkedin: "https://linkedin.com",
                twitter: "https://twitter.com",
                email: "sarah@destinybuilders.africa",
              }}
            />

            <LeadershipCard
              name="Mr. David Osei"
              title="Director of Partnerships"
              bio="Mr. Osei develops and manages strategic partnerships with organizations, governments, and donors to support Destiny Builders' mission and programs."
              image="/leader6.jpg"
              social={{
                linkedin: "https://linkedin.com",
                email: "david@destinybuilders.africa",
              }}
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Board of Trustees</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LeadershipCard
              name="Prof. Chidi Okonkwo"
              title="Board Chair"
              bio="Professor of Development Studies with extensive experience in governance and organizational leadership."
              image="/board1.jpg"
              social={{
                linkedin: "https://linkedin.com",
              }}
            />

            <LeadershipCard
              name="Mrs. Amina Diallo"
              title="Board Member"
              bio="Renowned entrepreneur and philanthropist with a passion for women's economic empowerment."
              image="/board2.jpg"
              social={{
                linkedin: "https://linkedin.com",
              }}
            />

            <LeadershipCard
              name="Dr. James Mensah"
              title="Board Member"
              bio="Expert in public health and community development with over 25 years of experience in the non-profit sector."
              image="/board3.jpg"
              social={{
                linkedin: "https://linkedin.com",
              }}
            />
          </div>
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Continental Leadership Structure</h2>
          <p className="mb-4">
            In addition to our executive leadership and board, Destiny Builders operates through a structured
            continental framework with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">54 African Country Directors</li>
            <li className="mb-2">National Executive Councils in each country</li>
            <li className="mb-2">State/Provincial Directors and Executives</li>
            <li className="mb-2">Local Government Area (LGA) Coordinators</li>
            <li>Ward-level Representatives</li>
          </ul>
          <p>
            This hierarchical structure ensures effective governance and streamlined operations across all levels of our
            organization, allowing us to maintain a cohesive vision while addressing local needs and contexts.
          </p>
        </div>
      </div>
    </div>
  )
}

interface SocialLinks {
  linkedin?: string
  twitter?: string
  email?: string
}

function LeadershipCard({
  name,
  title,
  bio,
  image,
  social,
}: {
  name: string
  title: string
  bio: string
  image: string
  social: SocialLinks
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative h-64">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="text-green-700 font-medium mb-3">{title}</p>
        <p className="text-sm text-gray-600 mb-4">{bio}</p>
        <div className="flex space-x-3">
          {social.linkedin && (
            <Link
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-green-700"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          )}
          {social.twitter && (
            <Link
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-green-700"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          )}
          {social.email && (
            <Link href={`mailto:${social.email}`} className="text-gray-500 hover:text-green-700">
              <Mail className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
