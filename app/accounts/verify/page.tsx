"use client"

import { useEffect } from 'react'
import { useGetUserActiveStatusQuery } from '@/redux/features/authApiSlice'
import { getCookie } from 'cookies-next'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const userId = getCookie('userID')
  const { data, error, isFetching } = useGetUserActiveStatusQuery(Number(userId), {
    pollingInterval: 3000,
    skip: !userId,
  })

  useEffect(() => {
    if (data?.is_active) {
      toast.success('Email verified! Redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [data, router])

  if (!userId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Session Expired</h1>
        <p className="mt-4 text-gray-600">
          Please restart the registration process.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Verification Error</h1>
        <p className="mt-4 text-gray-600">
          {(error as any)?.data?.error || 'Failed to verify email status'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✉️</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Check Your Email
        </h1>
        
        <p className="text-gray-600">
          We've sent a verification link to <span className="font-medium">{data?.email}</span>.
          Please click the link to activate your account.
        </p>

        <div className="inline-flex items-center text-gray-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>{isFetching ? 'Checking status...' : 'Waiting for verification'}</span>
        </div>
{/*
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              type="button"
              className="text-green-600 hover:underline"
              // Add resend email functionality here
            >
              Resend verification email
            </button>
            </p>
            </div>
            .*/}
      </div>
    </div>
  )
}