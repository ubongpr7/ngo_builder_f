"use client"

import { useState } from "react"
import { ThumbsUp, Heart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ReactionBarProps {
  reactions: {
    likes: number
    celebrates: number
    supports: number
  }
  onReact: (type: "like" | "celebrate" | "support") => void
}

export default function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  const [userReactions, setUserReactions] = useState({
    like: false,
    celebrate: false,
    support: false,
  })

  const handleReaction = (type: "like" | "celebrate" | "support") => {
    setUserReactions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
    onReact(type)
  }

  const totalReactions = reactions.likes + reactions.celebrates + reactions.supports

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 ${userReactions.like ? "text-blue-600" : "text-gray-500"}`}
                onClick={() => handleReaction("like")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{reactions.likes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Like</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 ${userReactions.celebrate ? "text-yellow-600" : "text-gray-500"}`}
                onClick={() => handleReaction("celebrate")}
              >
                <Award className="h-4 w-4 mr-1" />
                <span>{reactions.celebrates}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Celebrate</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 ${userReactions.support ? "text-red-600" : "text-gray-500"}`}
                onClick={() => handleReaction("support")}
              >
                <Heart className="h-4 w-4 mr-1" />
                <span>{reactions.supports}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Support</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {totalReactions > 0 && (
        <span className="text-xs text-gray-500 ml-2">
          {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
        </span>
      )}
    </div>
  )
}
