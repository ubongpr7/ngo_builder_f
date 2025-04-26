import type { Metadata } from "next"
import Image from "next/image"
import { CalendarDays } from "lucide-react"

export const metadata: Metadata = {
  title: "Our History | Destiny Builders",
  description: "The journey and history of Destiny Builders Empowerment Foundation",
}

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Our History</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Emerging from the impactful legacy of the Self Developers Empowerment Initiative (SDEI), the Destiny
            Builders Empowerment Foundation (DESTINY BUILDERS) represents a bold, pan-African evolution of the same
            divine vision. With over a decade of impact across Nigeria, DESTINY BUILDERS now scales this vision to reach
            the entirety of Africa and beyond.
          </p>
        </div>

        <div className="relative h-80 rounded-xl overflow-hidden mb-12">
          <Image src="/history-image.jpg" alt="Destiny Builders historical moments" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold">A Decade of Impact</h2>
              <p>Transforming lives across Africa since our founding</p>
            </div>
          </div>
        </div>

        <div className="space-y-12 mb-12">
          <TimelineItem
            year="2010"
            title="The Beginning"
            description="Self Developers Empowerment Initiative (SDEI) was founded in Nigeria with a focus on personal development and community empowerment."
          />

          <TimelineItem
            year="2013"
            title="First Major Project"
            description="Launched our first major community development project, providing educational support to underserved communities in Lagos."
          />

          <TimelineItem
            year="2015"
            title="Expansion of Programs"
            description="Expanded our programs to include digital literacy training, leadership development, and women empowerment initiatives."
          />

          <TimelineItem
            year="2018"
            title="National Recognition"
            description="Received national recognition for our impact, with our programs being implemented in multiple states across Nigeria."
          />

          <TimelineItem
            year="2020"
            title="Pan-African Vision"
            description="Began the transition to a pan-African organization, with pilot programs in Ghana and Kenya."
          />

          <TimelineItem
            year="2022"
            title="Rebirth as Destiny Builders"
            description="Officially rebranded as Destiny Builders Empowerment Foundation, with a renewed vision to reach all of Africa."
          />

          <TimelineItem
            year="2023"
            title="Continental Expansion"
            description="Established presence in 10 African countries, with a structured organizational framework to support continental growth."
          />

          <TimelineItem
            year="Present"
            title="Building for the Future"
            description="Currently implementing our strategic plan for comprehensive continental coverage, with a focus on sustainable impact and community transformation."
          />
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Our Continuing Journey</h2>
          <p className="mb-4">
            As we look to the future, Destiny Builders remains committed to our founding vision of empowering
            individuals and communities across Africa. Our history has shaped us, but it is our vision for the future
            that drives us forward.
          </p>
          <p>
            We invite you to be part of our continuing journey as we work to build African destinies and transform lives
            across the continent.
          </p>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({
  year,
  title,
  description,
}: {
  year: string
  title: string
  description: string
}) {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-6">
        <div className="bg-green-100 p-2 rounded-full">
          <CalendarDays className="h-6 w-6 text-green-700" />
        </div>
        <div className="h-full w-0.5 bg-green-200 mt-2"></div>
      </div>
      <div className="pb-8">
        <div className="bg-green-700 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
          {year}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  )
}
