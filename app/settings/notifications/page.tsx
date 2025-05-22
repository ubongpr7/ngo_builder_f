"use client"

import { useState, useEffect } from "react"
import {
  useGetAllPreferencesQuery,
  useUpdatePreferencesMutation,
  useResetPreferencesToDefaultMutation,
  useGetNotificationCategoriesQuery,
} from "@/redux/features/notifications/notificationsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, Mail, Phone, RefreshCw, AlertTriangle, Info } from "lucide-react"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function NotificationSettingsPage() {
  const {
    data: preferences,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllPreferencesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: categories } = useGetNotificationCategoriesQuery()
  const [updatePreferences, { isLoading: isUpdating }] = useUpdatePreferencesMutation()
  const [resetToDefault, { isLoading: isResetting }] = useResetPreferencesToDefaultMutation()
  const [activeTab, setActiveTab] = useState("all")
  const [localPreferences, setLocalPreferences] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
      setHasChanges(false)
    }
  }, [preferences])

  const handleToggle = (category: string, id: number, field: string, value: boolean) => {
    setLocalPreferences((prev) => {
      const newPrefs = { ...prev }
      const categoryItems = [...(newPrefs[category] || [])]
      const itemIndex = categoryItems.findIndex((item) => item.id === id)

      if (itemIndex !== -1) {
        categoryItems[itemIndex] = {
          ...categoryItems[itemIndex],
          preferences: {
            ...categoryItems[itemIndex].preferences,
            [field]: value,
          },
        }
        newPrefs[category] = categoryItems
      }

      return newPrefs
    })

    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // Prepare data for API
      const preferencesToUpdate = []

      for (const category in localPreferences) {
        for (const item of localPreferences[category]) {
          preferencesToUpdate.push({
            notification_type: item.id,
            receive_in_app: item.preferences.receive_in_app,
            receive_email: item.preferences.receive_email,
            receive_sms: item.preferences.receive_sms,
            receive_push: item.preferences.receive_push,
          })
        }
      }

      await updatePreferences({ preferences: preferencesToUpdate }).unwrap()
      toast.success("Notification preferences updated successfully")
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to update preferences:", error)
      toast.error("Failed to update notification preferences")
    }
  }

  const handleReset = async () => {
    try {
      await resetToDefault().unwrap()
      toast.success("Notification preferences reset to default")

      // Force refetch after reset
      // await refetch()
      window.location.reload()



    } catch (error) {
      console.error("Failed to reset preferences:", error)
      toast.error("Failed to reset notification preferences")
    }
  }

  if (isLoading || isFetching) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading notification settings...</span>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load notification settings</h2>
          <p>Please try again later or contact support if the problem persists.</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  const categoriesList = Object.keys(preferences).sort()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset notification preferences?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your notification preferences to their default values. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} disabled={isResetting}>
                  {isResetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSave} disabled={!hasChanges || isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {categoriesList?.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {categoriesList?.map((category) => (
            <NotificationCategorySection
              key={category}
              category={category}
              items={localPreferences[category]}
              onToggle={(id, field, value) => handleToggle(category, id, field, value)}
            />
          ))}
        </TabsContent>

        {categoriesList?.map((category) => (
          <TabsContent key={category} value={category}>
            <NotificationCategorySection
              category={category}
              items={localPreferences[category]}
              onToggle={(id, field, value) => handleToggle(category, id, field, value)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface NotificationCategorySectionProps {
  category: string
  items: any[]
  onToggle: (id: number, field: string, value: boolean) => void
}

function NotificationCategorySection({ category, items, onToggle }: NotificationCategorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Notifications</CardTitle>
        <CardDescription>Configure how you receive {category.toLowerCase()} notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4 mb-2 px-4 font-medium text-sm">
            <div className="col-span-2">Notification</div>
            <div className="text-center flex items-center justify-center">
              <Bell className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">In-App</span>
            </div>
            <div className="text-center flex items-center justify-center">
              <Mail className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Email</span>
            </div>
            <div className="text-center flex items-center justify-center">
              <Phone className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">SMS</span>
            </div>
          </div>

          {items?.map((item) => (
            <div key={item.id} className="grid grid-cols-5 gap-4 py-3 px-4 border-t">
              <div className="col-span-2">
                <div className="flex items-center">
                  <h4 className="font-medium ">{item.name.replace("_", " ")}</h4>
                  {!item.can_disable && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This notification cannot be disabled</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="flex justify-center items-center">
                <Switch
                  checked={item.preferences.receive_in_app}
                  onCheckedChange={(checked) => onToggle(item.id, "receive_in_app", checked)}
                  disabled={!item.can_disable}
                />
              </div>
              <div className="flex justify-center items-center">
                <Switch
                  checked={item.preferences.receive_email}
                  onCheckedChange={(checked) => onToggle(item.id, "receive_email", checked)}
                  disabled={!item.can_disable}
                />
              </div>
              <div className="flex justify-center items-center">
                <Switch
                  checked={item.preferences.receive_sms}
                  onCheckedChange={(checked) => onToggle(item.id, "receive_sms", checked)}
                  disabled={!item.can_disable}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
