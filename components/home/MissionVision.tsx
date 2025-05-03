import { Lightbulb, Target } from "lucide-react"
import Image from "next/image"

export default function MissionVision() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 lg:text-[45px]">Our Mission & Vision</h2>
          <div className="mt-2 h-3 w-20 bg-[#FDD65B] mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-green-50 rounded-xl p-10 shadow-sm border border-green-100 " style={{ boxShadow: "3px 4px 0px 1px rgba(0, 0, 0, 1)" }}>
            <Image src="/vision.svg" alt="Destiny Builders Logo" width={56} height={56} className="mb-4"/>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 lg:text-[29px]">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              Empowering individuals and communities to unlock their full potential, fostering a culture of
              self-directed learning and growth, making personal and community development accessible to all.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-10 shadow-sm border border-green-100" style={{ boxShadow: "3px 4px 0px 1px rgba(0, 0, 0, 1)" }}>
          <Image src="/mission.svg" alt="Destiny Builders Logo" width={56} height={56} className="mb-4"/>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 lg:text-[29px]">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Providing resources, support, and guidance to individuals and communities seeking control over their
              personal, professional, and community development.
            </p>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Core Values</h3>
          <div className="mb-5 h-1 w-20 bg-green-600 mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <CoreValue title="Divine Purpose" description="Guided by God's will" />
            <CoreValue title="Integrity" description="Transparent leadership" />
            <CoreValue title="Innovation" description="Creative problem-solving" />
            <CoreValue title="Accountability" description="Results-based stewardship" />
            <CoreValue title="Unity" description="Strength in community" />
            <CoreValue title="Excellence" description="Kingdom-standard delivery" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CoreValue({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h4 className="font-bold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
