"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDjoserVerifyAccountMutation } from '@/redux/features/authApiSlice'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'

export default function ActivationPage({
  params,
}: {
  params: { uid: string; token: string }
}) {
  const router = useRouter()
  const [activation, { isLoading }] = useDjoserVerifyAccountMutation()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Trigger activation automatically when component mounts
    handleActivation()
  }, [])

  const handleActivation = async () => {
    try {
      await activation({
        uid: params.uid,
        token: params.token,
      }).unwrap()
      
      toast.success('Account activated successfully! Redirecting...')
      
      // Start countdown for redirect
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            router.push('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      toast.error('Activation failed. The link may be invalid or expired.')
    }
  }

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      <div className="space-y-6">
        {isLoading ? (
          <>
            <div className="animate-pulse">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Activating Your Account...
            </h1>
          </>
        ) : (
          <>
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Activation Successful!
            </h1>
            <p className="text-gray-600">
              Redirecting to dashboard in {countdown} seconds...
            </p>
          </>
        )}

        {!isLoading && (
          <div className="pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline"
            >
              Go to Login immediately
            </button>
          </div>
        )}
      </div>
    </div>
  )
}