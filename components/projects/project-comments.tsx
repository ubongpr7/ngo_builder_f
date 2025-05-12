"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, ThumbsUp, Reply, MoreHorizontal, Loader2 } from "lucide-react"

// Mock API call - replace with actual API call
import { useGetProjectCommentsQuery } from "@/redux/features/projects/projectsAPISlice"

interface ProjectCommentsProps {
  projectId: number | string
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const { data: comments = [], isLoading } = useGetProjectCommentsQuery(projectId)
  const [newComment, setNewComment] = useState("")

  // Function to render nested comments recursively
  const renderComments = (comments: any[], parentId: number | null = null, level = 0) => {
    const filteredComments = comments.filter((comment) =>
      parentId === null ? !comment.parent : comment.parent?.id === parentId,
    )

    if (filteredComments.length === 0) return null

    return (
      <div className={`space-y-4 ${level > 0 ? "ml-12 mt-4" : ""}`}>
        {filteredComments.map((comment) => (
          <div key={comment.id}>
            <Card className={level > 0 ? "border-l-4 border-l-gray-200" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?height=40&width=40&query=${encodeURIComponent(comment.user.username)}`}
                    />
                    <AvatarFallback>
                      {comment.user.first_name?.[0]}
                      {comment.user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {comment.user.first_name} {comment.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Reply className="mr-1 h-4 w-4" />
                    Reply
                  </Button>
                </div>
                {comment.updated_at !== comment.created_at && (
                  <div className="text-xs text-gray-500">Edited {new Date(comment.updated_at).toLocaleString()}</div>
                )}
              </CardFooter>
            </Card>
            {renderComments(comments, comment.id, level + 1)}
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading comments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Project Comments</h2>
        <p className="text-gray-500">Discussions and feedback about the project</p>
      </div>

      {/* New Comment Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="/abstract-geometric-shapes.png" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                className="min-h-[100px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="mr-2 h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Comments Yet</h3>
            <p className="text-gray-500 text-center mb-4">Be the first to start a discussion about this project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{comments.length} Comments</h3>
            <div className="text-sm text-gray-500">
              Sort by: <span className="font-medium">Newest First</span>
            </div>
          </div>
          {renderComments(comments)}
        </div>
      )}
    </div>
  )
}
