import type React from "react"
import { Users, BookOpen, Laptop, Home, Heart, GraduationCap, UserPlus, Church, Building, Leaf } from "lucide-react"

export default function FocusAreas() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Strategic Focus Areas</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our work spans across multiple domains to ensure holistic development of individuals and communities.
          </p>
          <div className="mt-2 h-1 w-20 bg-green-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <FocusArea
            icon={<Users className="h-8 w-8 " />}
            title="Leadership Development"
            description="Cultivating effective leaders at all levels of society"
          />
          <FocusArea
            icon={<Laptop className="h-8 w-8" />}
            title="Digital Literacy"
            description="Equipping communities with essential digital skills"
          />
          <FocusArea
            icon={<Home className="h-8 w-8" />}
            title="Community Development"
            description="Building stronger, more resilient communities"
          />
          <FocusArea
            icon={<Heart className="h-8 w-8" />}
            title="Health & Well-being"
            description="Promoting holistic health and wellness practices"
          />
          <FocusArea
            icon={<GraduationCap className="h-8 w-8" />}
            title="Education"
            description="Expanding access to quality education for all"
          />
          <FocusArea
            icon={<UserPlus className="h-8 w-8" />}
            title="Women Empowerment"
            description="Supporting women and girls to reach their potential"
          />
          <FocusArea
            icon={<Church className="h-8 w-8" />}
            title="Faith Integration"
            description="Incorporating values and faith in development"
          />
          <FocusArea
            icon={<Building className="h-8 w-8" />}
            title="Trade & Investment"
            description="Promoting economic growth and opportunity"
          />
          <FocusArea
            icon={<BookOpen className="h-8 w-8" />}
            title="Agriculture"
            description="Advancing sustainable food security solutions"
          />
          <FocusArea
            icon={<Leaf className="h-8 w-8" />}
            title="Climate Action"
            description="Implementing green initiatives for sustainability"
          />
        </div>
      </div>
    </section>
  )
}

function FocusArea({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className=" border border-[#469620] bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center">
      <div className="bg-green-50 p-3 rounded-full mb-4 text-green-700">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
