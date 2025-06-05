import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, User, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog | Destiny Builders",
  description: "Insights, stories, and updates from Destiny Builders Empowerment Foundation",
}

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Digital Literacy: A Pathway to Economic Empowerment in Africa",
    excerpt: "Exploring how digital skills are transforming economic opportunities for youth across Africa.",
    image: "https://images.unsplash.com/photo-1582848112469-3af4e8dc95cf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RGlnaXRhbCUyMExpdGVyYWN5JTNBJTIwQSUyMFBhdGh3YXklMjB0byUyMEVjb25vbWljJTIwRW1wb3dlcm1lbnQlMjBpbiUyMEFmcmljYXxlbnwwfDF8MHx8fDA%3D",
    author: "Dr. John Adeyemi",
    date: "April 15, 2023",
    category: "Digital Literacy",
    featured: true,
  },
  {
    id: 2,
    title: "Women Entrepreneurs: Overcoming Barriers in African Markets",
    excerpt: "Stories of resilience and success from women entrepreneurs in our empowerment programs.",
    image: "https://images.unsplash.com/photo-1686146711957-04aec031396b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8V29tZW4lMjBFbnRyZXByZW5ldXJzJTNBJTIwT3ZlcmNvbWluZyUyMEJhcnJpZXJzJTIwaW4lMjBBZnJpY2FuJTIwTWFya2V0c3xlbnwwfDF8MHx8fDA%3D",
    author: "Grace Okafor",
    date: "March 28, 2023",
    category: "Women Empowerment",
    featured: true,
  },
  {
    id: 3,
    title: "Community-Led Development: Lessons from Rural Nigeria",
    excerpt: "Key insights from our community development projects in rural Nigerian communities.",
    image: "https://images.unsplash.com/photo-1471771450139-6bfdb4b2609a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Q29tbXVuaXR5JTIwTGVkJTIwRGV2ZWxvcG1lbnQlM0ElMjBMZXNzb25zJTIwZnJvbSUyMFJ1cmFsJTIwTmlnZXJpYXxlbnwwfDB8MHx8fDA%3D",
    author: "Emmanuel Mwangi",
    date: "March 10, 2023",
    category: "Community Development",
    featured: false,
  },
  {
    id: 4,
    title: "Youth Leadership: Nurturing the Next Generation of African Leaders",
    excerpt: "How our leadership development programs are preparing young people for leadership roles.",
    image: "https://plus.unsplash.com/premium_photo-1723291238875-b9f0f5a8b95c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8WW91dGglMjBMZWFkZXJzaGlwJTNBJTIwTnVydHVyaW5nJTIwdGhlJTIwTmV4dCUyMEdlbmVyYXRpb24lMjBvZiUyMEFmcmljYW4lMjBMZWFkZXJzfGVufDB8MHwwfHx8MA%3D%3D",
    author: "Sarah Nkosi",
    date: "February 22, 2023",
    category: "Leadership",
    featured: false,
  },
  {
    id: 5,
    title: "Sustainable Agriculture: Innovations for Food Security in Africa",
    excerpt: "Exploring sustainable farming practices that are improving food security in African communities.",
    image: "https://plus.unsplash.com/premium_photo-1661762343339-817d600f7597?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8U3VzdGFpbmFibGUlMjBBZ3JpY3VsdHVyZSUzQSUyMElubm92YXRpb25zJTIwZm9yJTIwRm9vZCUyMFNlY3VyaXR5JTIwaW4lMjBBZnJpY2F8ZW58MHwwfDB8fHww",
    author: "David Osei",
    date: "February 5, 2023",
    category: "Agriculture",
    featured: false,
  },
  {
    id: 6,
    title: "Health Education: Empowering Communities for Better Wellbeing",
    excerpt: "The impact of health education on improving community health outcomes across Africa.",
    image: "https://images.unsplash.com/photo-1589104759909-e355f8999f7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8SGVhbHRoJTIwRWR1Y2F0aW9uJTNBJTIwRW1wb3dlcmluZyUyMENvbW11bml0aWVzJTIwZm9yJTIwQmV0dGVyJTIwV2VsbGJlaW5nfGVufDB8MHwwfHx8MA%3D%3D",
    author: "Fatima Ibrahim",
    date: "January 18, 2023",
    category: "Health",
    featured: false,
  },
]

export default function BlogPage() {
  // Separate featured posts from regular posts
  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog</h1>
            <p className="text-gray-600">Insights, stories, and updates from our work across Africa</p>
          </div>
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <Input placeholder="Search articles..." className="pr-10" />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts?.map((post) => (
              <FeaturedPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Regular Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Newsletter Signup
        <div className="bg-green-50 p-8 rounded-xl border border-green-500">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">
              Stay updated with the latest insights, stories, and updates from Destiny Builders. We'll send you a
              monthly digest of our best content and news.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Your email address" className="flex-1" />
              <Button className="bg-green-600 hover:bg-green-700 text-white">Subscribe</Button>
            </div>
          </div>
        </div>
         */}
      </div>
    </div>
  )
}

function FeaturedPostCard({ post }: { post: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-green-500 overflow-hidden flex flex-col md:flex-row ">
      <div className="relative h-64 md:h-auto md:w-1/2 ">
        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
      </div>
      <div className="p-6 md:w-1/2">
        <Badge className="mb-3 bg-green-100 text-green-800 hover:bg-green-200 border-0">{post.category}</Badge>
        <h3 className="text-xl font-bold mb-3 ">
          <Link href={`/blog/${post.id}`} className="hover:text-green-700 transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <User className="h-4 w-4 mr-1" />
          <span className="mr-4">{post.author}</span>
          <CalendarDays className="h-4 w-4 mr-1" />
          <span>{post.date}</span>
        </div>
        <Button asChild variant="outline" className="mt-2">
          <Link href={`/blog/${post.id}`} className="flex items-center">
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative h-48">
        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">{post.category}</Badge>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-3 w-[110%]">
          <Link href={`/blog/${post.id}`} className="hover:text-green-700 transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-4 w-[110%]">{post.excerpt}</p>
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <User className="h-3 w-3 mr-1" />
          <span className="mr-3">{post.author}</span>
          <CalendarDays className="h-3 w-3 mr-1" />
          <span>{post.date}</span>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full hover:bg-[#469620] hover:text-white">
          <Link href={`/blog/${post.id}`}>Read Article</Link>
        </Button>
      </div>
    </div>
  )
}
