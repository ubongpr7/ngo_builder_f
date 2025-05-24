"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, UserPlus, LogIn } from "lucide-react"
import MembershipRegister from "@/components/membership/MembershipRegister"
import MembershipLogin from "@/components/membership/MembershipLogin"

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
  title = "Join Our Community to Donate",
  description = "Please login or register to continue with your donation. As a member, you'll be able to track your donations and stay updated on our impact.",
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState("login")

  const handleAuthSuccess = () => {
    onAuthSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Welcome Back!</h3>
                  <p className="text-sm text-gray-600">Login to your account to continue</p>
                </div>
                <MembershipLogin />
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Join Our Mission!</h3>
                  <p className="text-sm text-gray-600">Create an account to become part of our community</p>
                </div>
                <MembershipRegister />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Why become a member?</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Track your donation history</li>
              <li>• Receive impact updates</li>
              <li>• Access exclusive member content</li>
              <li>• Connect with our community</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Continue as Guest
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              You can still donate as a guest, but you'll miss out on member benefits
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
