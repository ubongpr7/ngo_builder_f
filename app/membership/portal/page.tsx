import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MembershipLogin from "@/components/membership/MembershipLogin"
import MembershipRegister from "@/components/membership/MembershipRegister"

export default function MembershipPortalPage() {
  return (
    <div className="container mx-auto px-4 py-12 ">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Membership Portal</h1>
          <p className="text-gray-600 mt-2">Access your membership account or register to join our community</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="login"
              className="py-2 px-4 text-center text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="py-2 px-4 text-center text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600"
            >
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Member Login</CardTitle>
                <CardDescription>Enter your credentials to access your membership account</CardDescription>
              </CardHeader>
              <CardContent>
                <MembershipLogin />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="link" className="px-0">
                  Forgot password?
                </Button>
                <Button variant="link" className="px-0">
                  Need help?
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>New Member Registration</CardTitle>
                <CardDescription>Join our community and access exclusive resources and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <MembershipRegister />
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  By registering, you agree to our{" "}
                  <a href="/terms" className="text-green-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-green-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
