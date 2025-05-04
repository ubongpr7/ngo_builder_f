import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MembershipLogin from "@/components/membership/MembershipLogin"

export default function MembershipPortalPage() {
  return (
    <div className="container mx-auto px-4 py-12 ">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Membership Portal</h1>
          <p className="text-gray-600 mt-2">Access your membership account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your membership account</CardDescription>
          </CardHeader>
          <CardContent>
            <MembershipLogin />
          </CardContent>
          <CardFooter className="flex justify-evenly">
            <Button variant="link" className="px-0">
              Forgot password?
            </Button>
            <Button variant="link" className="px-0">
              Need help?
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}