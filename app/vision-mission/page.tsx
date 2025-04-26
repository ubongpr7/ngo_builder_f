import type { Metadata } from "next"
import { Lightbulb, Target, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Vision & Mission | Destiny Builders",
  description: "Our vision, mission and core values",
}

export default function VisionMissionPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Our Vision & Mission</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-green-50 rounded-xl p-8 shadow-sm border border-green-100">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-6">
              <Target className="h-8 w-8 text-green-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              Empowering individuals and communities to unlock their full potential, fostering a culture of
              self-directed learning and growth, making personal and community development accessible to all.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-8 shadow-sm border border-green-100">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-6">
              <Lightbulb className="h-8 w-8 text-green-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              Providing resources, support, and guidance to individuals and communities seeking control over their
              personal, professional, and community development.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Award className="mr-2 h-6 w-6 text-green-700" />
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CoreValue
              title="Divine Purpose"
              description="We believe that our work is guided by God's will and purpose. We seek divine guidance in all our endeavors and strive to fulfill our God-given mandate."
            />
            <CoreValue
              title="Integrity"
              description="We are committed to transparent leadership and ethical conduct in all our operations. We hold ourselves accountable to the highest standards of honesty and integrity."
            />
            <CoreValue
              title="Innovation"
              description="We embrace creative problem-solving and innovative approaches to address the complex challenges facing communities across Africa."
            />
            <CoreValue
              title="Accountability"
              description="We practice results-based stewardship, ensuring that resources are used effectively and efficiently to achieve our mission and create lasting impact."
            />
            <CoreValue
              title="Unity"
              description="We believe in the strength of community and the power of collective action. We foster unity and collaboration among our members and partners."
            />
            <CoreValue
              title="Excellence"
              description="We are committed to kingdom-standard delivery in all our programs and services, striving for excellence in everything we do."
            />
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
          <p className="mb-4">
            At Destiny Builders, we are committed to living out these values in our daily operations and long-term
            strategies. Our vision, mission, and values guide our decision-making, shape our organizational culture, and
            drive our impact across Africa.
          </p>
          <p>
            We invite you to join us in this journey of building African destinies and transforming lives. Together, we
            can create a future where every individual has the opportunity to reach their full potential and contribute
            to the development of their communities.
          </p>
        </div>
      </div>
    </div>
  )
}

function CoreValue({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
