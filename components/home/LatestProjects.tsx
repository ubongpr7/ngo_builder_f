import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "Digital Skills Workshop",
    description: "Training 200 youth in web development and digital marketing skills",
    image: "/project1.jpg",
    location: "Lagos, Nigeria",
    date: "June 15, 2023",
    category: "Digital Literacy",
  },
  {
    id: 2,
    title: "Community Health Outreach",
    description: "Free medical checkups and health education for underserved communities",
    image: "/project2.jpg",
    location: "Accra, Ghana",
    date: "July 8, 2023",
    category: "Health",
  },
  {
    id: 3,
    title: "Women Entrepreneurship Program",
    description: "Business training and microloans for women-owned small businesses",
    image: "/project3.jpg",
    location: "Nairobi, Kenya",
    date: "August 22, 2023",
    category: "Women Empowerment",
  },
]

export default function LatestProjects() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Our Latest Projects</h2>
            <p className="mt-2 text-gray-600">See how we're making an impact across Africa</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600 hover:bg-green-700">{project.category}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{project.date}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/projects/${project.id}`}>View Project Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
