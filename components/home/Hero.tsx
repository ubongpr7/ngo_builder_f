import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative bg-green-50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
              DESTINY BUILDERS EMPOWERMENT FOUNDATION
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Building African Destinies, Transforming Lives
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Providing resources, support, and guidance to individuals and communities seeking control over their
              personal, professional, and community development.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="/membership/join" className="text-white">Join Our Community</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-xl">
            <Image src="https://images.unsplash.com/photo-1630068846062-3ffe78aa5049?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8RW1wb3dlcmluZyUyMGluZGl2aWR1YWxzJTIwYW5kJTIwY29tbXVuaXRpZXMlMjB0byUyMHVubG9jayUyMHRoZWlyJTIwZnVsbCUyMHBvdGVudGlhbHxlbnwwfHwwfHx8MA%3D%3D" alt="African community development" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg max-w-md">
                <p className="font-medium text-green-800">
                  "Empowering individuals and communities to unlock their full potential."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
