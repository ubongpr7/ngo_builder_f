import { Suspense } from "react"
import { DonatePageContent } from "@/components/donate-content"

function DonatePageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Loading donation page...</p>
        </div>
        <div className="animate-pulse">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-48"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-xl h-64 mb-12"></div>
          <div className="bg-gray-200 rounded-xl h-96"></div>
        </div>
      </div>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense fallback={<DonatePageFallback />}>
      <DonatePageContent />
    </Suspense>
  )
}
