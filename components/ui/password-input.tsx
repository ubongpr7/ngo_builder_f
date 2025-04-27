"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input, type InputProps } from "@/components/ui/input"

export interface PasswordInputProps extends Omit<InputProps, "type" | "className" | "children"> {
  className?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input type={showPassword ? "text" : "password"} className={cn("pr-10", className)} ref={ref} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </Button>
    </div>
  )
})

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
