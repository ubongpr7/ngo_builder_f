import type { Metadata } from "next"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Media Gallery | Destiny Builders",
  description: "Photos, videos, and media resources from our programs and events",
}

export default function MediaGalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Media Gallery</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Explore photos, videos, and other media resources from Destiny Builders' programs, events, and activities
            across Africa. These visual stories showcase our impact and the communities we serve.
          </p>
        </div>

        <Tabs defaultValue="photos" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="presentations">Presentations</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <PhotoCard
                  key={num}
                  image={`/gallery-photo${num}.jpg`}
                  title={`Program Activity ${num}`}
                  location="Various Locations"
                  date="2023"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <VideoCard
                thumbnail="/video-thumbnail1.jpg"
                title="Digital Skills Workshop Highlights"
                duration="3:45"
                date="August 2023"
              />
              <VideoCard
                thumbnail="/video-thumbnail2.jpg"
                title="Women Entrepreneurs Success Stories"
                duration="5:12"
                date="July 2023"
              />
              <VideoCard
                thumbnail="/video-thumbnail3.jpg"
                title="Youth Leadership Summit Recap"
                duration="4:30"
                date="April 2023"
              />
              <VideoCard
                thumbnail="/video-thumbnail4.jpg"
                title="Community Health Outreach"
                duration="6:18"
                date="March 2023"
              />
              <VideoCard
                thumbnail="/video-thumbnail5.jpg"
                title="Agricultural Training Program"
                duration="7:22"
                date="February 2023"
              />
              <VideoCard
                thumbnail="/video-thumbnail6.jpg"
                title="Destiny Builders: Our Story"
                duration="8:45"
                date="January 2023"
              />
            </div>
          </TabsContent>

          <TabsContent value="presentations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PresentationCard
                title="Strategic Plan 2023-2027"
                description="Overview of Destiny Builders' five-year strategic plan and vision for continental impact."
                date="December 2023"
              />
              <PresentationCard
                title="Digital Literacy Program Framework"
                description="Presentation on our approach to digital skills training and capacity building."
                date="October 2023"
              />
              <PresentationCard
                title="Women Empowerment Initiative"
                description="Comprehensive presentation on our women's economic empowerment programs."
                date="September 2023"
              />
              <PresentationCard
                title="Youth Leadership Development Model"
                description="Our framework for developing young leaders across Africa."
                date="August 2023"
              />
              <PresentationCard
                title="Community Health Approach"
                description="Presentation on our holistic approach to community health and wellbeing."
                date="July 2023"
              />
              <PresentationCard
                title="Organizational Structure Overview"
                description="Explanation of Destiny Builders' continental organizational framework."
                date="June 2023"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Media Resources for Partners</h2>
          <p className="mb-4">
            Partners and media organizations can access high-resolution logos, brand assets, and approved media
            materials for use in publications and communications about Destiny Builders.
          </p>
          <Button className="bg-green-600 hover:bg-green-700">Access Media Kit</Button>
        </div>
      </div>
    </div>
  )
}

function PhotoCard({
  image,
  title,
  location,
  date,
}: {
  image: string
  title: string
  location: string
  date: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg">
      <div className="relative h-64 w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold">{title}</h3>
        <p className="text-white/80 text-sm">
          {location}, {date}
        </p>
      </div>
    </div>
  )
}

function VideoCard({
  thumbnail,
  title,
  duration,
  date,
}: {
  thumbnail: string
  title: string
  duration: string
  date: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative h-48">
        <Image src={thumbnail || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-3">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{duration}</div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  )
}

function PresentationCard({
  title,
  description,
  date,
}: {
  title: string
  description: string
  date: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-green-100 p-6 flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-green-700" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{date}</span>
          <Button variant="outline" size="sm">
            View Slides
          </Button>
        </div>
      </div>
    </div>
  )
}
