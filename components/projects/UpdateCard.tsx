import Link from "next/link"
import Image from "next/image"
import { MessageSquare, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ReactionBar from "./ReactionBar"

interface UpdateCardProps {
  update: {
    id: string
    projectId: string
    title: string
    description: string
    date: string
    author: {
      id: string
      name: string
      avatar: string
    }
    category: string
    status: string
    project: {
      id: string
      name: string
      location: string
    }
    media: {
      type: string
      url: string
      caption: string
    }[]
    reactions: {
      likes: number
      celebrates: number
      supports: number
    }
    commentCount: number
  }
}

export default function UpdateCard({ update }: UpdateCardProps) {
  const formattedDate = new Date(update.date).toLocaleDateString()
  const formattedTime = new Date(update.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-xl">{update.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`
                ${
                  update.category === "milestone"
                    ? "bg-purple-100 text-purple-800"
                    : update.category === "progress"
                      ? "bg-blue-100 text-blue-800"
                      : update.category === "event"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }
              `}
              >
                {update.category.charAt(0).toUpperCase() + update.category.slice(1)}
              </Badge>
              <Badge
                className={`
                ${
                  update.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : update.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }
              `}
              >
                {update.status === "completed"
                  ? "Completed"
                  : update.status === "in-progress"
                    ? "In Progress"
                    : "Planned"}
              </Badge>
            </div>
          </div>
          <Link href={`/projects/updates/${update.projectId}`}>
            <Badge variant="outline" className="flex items-center gap-1 hover:bg-gray-100">
              {update.project.name}
              <ChevronRight className="h-3 w-3" />
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={update.author.avatar || "/placeholder.svg"} alt={update.author.name} />
            <AvatarFallback>
              {update.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{update.author.name}</p>
            <p className="text-xs text-gray-500">
              {formattedDate} at {formattedTime}
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">{update.description}</p>

        {update.media && update.media.length > 0 && (
          <div className="relative h-48 w-full rounded-md overflow-hidden mb-2">
            <Image
              src={update.media[0].url || "/placeholder.svg"}
              alt={update.media[0].caption || update.title}
              fill
              className="object-cover"
            />
            {update.media.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                +{update.media.length - 1} more
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 pb-3">
        <ReactionBar reactions={update.reactions} onReact={(type) => console.log(`Reacted with ${type}`)} />

        <div className="flex items-center">
          <div className="flex items-center mr-3 text-gray-500 text-sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{update.commentCount}</span>
          </div>
          <Button asChild>
            <Link href={`/projects/updates/${update.projectId}/${update.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
