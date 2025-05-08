"use client"

import { Button } from "@/components/ui/button"
import { ProfileDialog } from "@/components/profile/ProfileDialog"

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-10 px-4">


        <div>
          <h2 className="text-lg font-semibold mb-2">Custom Trigger</h2>
          <ProfileDialog trigger={<Button variant="outline">View My Profile</Button>} />
        </div>

      </div>
  )
}
