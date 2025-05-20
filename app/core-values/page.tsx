import type { Metadata } from "next"
import { Award, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Core Values | Destiny Builders",
  description: "The core values that guide our work and organization",
}

export default function CoreValuesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Our Core Values</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            At Destiny Builders Empowerment Foundation, our core values are the foundation of everything we do. They
            guide our decisions, shape our culture, and define how we engage with our communities and partners.
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          <CoreValue
            title="Divine Purpose"
            description="We believe that our work is guided by God's will and purpose. We seek divine guidance in all our endeavors and strive to fulfill our God-given mandate."
            examples={[
              "Incorporating prayer and spiritual reflection in our planning processes",
              "Aligning our programs with biblical principles of service and compassion",
              "Recognizing and honoring the divine potential in every individual",
            ]}
          />

          <CoreValue
            title="Integrity"
            description="We are committed to transparent leadership and ethical conduct in all our operations. We hold ourselves accountable to the highest standards of honesty and integrity."
            examples={[
              "Maintaining transparent financial records and reporting",
              "Honoring commitments to our beneficiaries and partners",
              "Making decisions based on ethical principles rather than expediency",
            ]}
          />

          <CoreValue
            title="Innovation"
            description="We embrace creative problem-solving and innovative approaches to address the complex challenges facing communities across Africa."
            examples={[
              "Developing new methodologies for community engagement",
              "Leveraging technology to extend our reach and impact",
              "Encouraging creative thinking and experimentation in our programs",
            ]}
          />

          <CoreValue
            title="Accountability"
            description="We practice results-based stewardship, ensuring that resources are used effectively and efficiently to achieve our mission and create lasting impact."
            examples={[
              "Implementing robust monitoring and evaluation systems",
              "Regular reporting to stakeholders on program outcomes",
              "Responsible management of financial and material resources",
            ]}
          />

          <CoreValue
            title="Unity"
            description="We believe in the strength of community and the power of collective action. We foster unity and collaboration among our members and partners."
            examples={[
              "Building inclusive partnerships across diverse communities",
              "Promoting collaborative decision-making processes",
              "Celebrating diversity while working toward common goals",
            ]}
          />

          <CoreValue
            title="Excellence"
            description="We are committed to kingdom-standard delivery in all our programs and services, striving for excellence in everything we do."
            examples={[
              "Continuous improvement of our methodologies and approaches",
              "Investing in staff development and capacity building",
              "Setting high standards for program quality and impact",
            ]}
          />
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Living Our Values</h2>
          <p className="mb-4">
            These values are not just words on a page—they are principles that we strive to embody every day in our work
            and interactions. They shape our organizational culture and guide our approach to community development.
          </p>
          <p>
            We invite all our members, partners, and supporters to join us in upholding these values as we work together
            to build African destinies and transform lives.
          </p>
        </div>
      </div>
    </div>
  )
}

function CoreValue({
  title,
  description,
  examples,
}: {
  title: string
  description: string
  examples: string[]
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-full mr-4">
          <Award className="h-6 w-6 text-green-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="mt-4">
        <h3 className="font-medium text-gray-900 mb-2">How we apply this value:</h3>
        <ul className="space-y-2">
          {examples?.map((example, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{example}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
