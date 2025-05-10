"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, Reply, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  author: {
    id: string
    name: string
    avatar: string
  }
  content: string
  date: string
  likes: number
  replies?: Comment[]
}

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (comment: string) => void
  onAddReply: (commentId: string, reply: string) => void
  onLikeComment: (commentId: string) => void
}

export default function CommentSection({ comments, onAddComment, onAddReply, onLikeComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment("")
    }
  }

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onAddReply(commentId, replyContent)
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Comments ({comments.length})</h3>

      <div className="mb-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] mb-2"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                <AvatarFallback>
                  {comment.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.date)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                </div>

                <div className="flex items-center gap-4 mt-2 ml-2">
                  <button
                    className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => onLikeComment(comment.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {comment.likes > 0 ? comment.likes : "Like"}
                  </button>
                  <button
                    className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </button>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-3 ml-6 flex items-start gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Reply to ${comment.author.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[60px] mb-2 text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyContent.trim()}>
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-6 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                          <AvatarFallback>
                            {reply.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{reply.author.name}</p>
                                <p className="text-xs text-gray-500">{formatDate(reply.date)}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Report</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="mt-1 text-gray-700 text-sm">{reply.content}</p>
                          </div>

                          <div className="flex items-center gap-4 mt-1 ml-2">
                            <button
                              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                              onClick={() => onLikeComment(reply.id)}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {reply.likes > 0 ? reply.likes : "Like"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
