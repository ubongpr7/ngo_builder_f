"use client"

import { Button } from "@/components/ui/button"
import { ProfileDialog } from "@/components/profile/ProfileDialog"

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Example Page</h1>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Basic Usage</h2>
          <ProfileDialog />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Custom Trigger</h2>
          <ProfileDialog trigger={<Button variant="outline">View My Profile</Button>} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Open By Default</h2>
          <ProfileDialog defaultOpen={true} />
        </div>
      </div>
    </div>
  )
}
