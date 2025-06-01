"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, LogIn, Heart } from "lucide-react"
import VerificationLoginForm from "@/components/membership/MembershipLogin"
import MembershipRegister from "./membership/MembershipRegister"
interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: () => void
  title?: string
  description?: string
}

export function AuthDialog({
  open,
  onOpenChange,
  onAuthSuccess,
  title = "Join Our Community",
  description = "Please login or register to continue",
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState("login")

  const handleAuthSuccess = () => {
    onAuthSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <VerificationLoginForm  />
          </TabsContent>

          <TabsContent value="register">
            <MembershipRegister/>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Authentication Required</span>
          </p>
          <p className="text-xs text-muted-foreground">
            You must be logged in to make a donation. This helps us track contributions and provide receipts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
