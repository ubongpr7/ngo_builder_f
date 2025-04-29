"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, RotateCw } from "lucide-react"
import { 
  useLoginMutation, 
  useVerifyCodeMutation,
  useResendCodeMutation
} from '@/redux/features/authApiSlice'

interface LoginFormData {
  email: string
  password: string
  code?: string
}

export default function VerificationLoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormData>()
  
  // API mutations
  const [sendCode] = useResendCodeMutation()
  const [verifyCode] = useVerifyCodeMutation()
  const [login, { isLoading }] = useLoginMutation()

  const email = watch('email')
  const password = watch('password')

  useEffect(() => {
    if (resendCooldown > 0 && showCodeInput) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown, showCodeInput])

  const handleSendCode = async () => {
    try {
      await sendCode({ email }).unwrap()
      setShowCodeInput(true)
      setResendCooldown(60)
      toast({
        title: "Verification sent",
        description: "Check your email for the 6-digit code",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send code",
        description: "Please check your email and try again",
      })
    }
  }

  const handleVerification = async (data: LoginFormData) => {
    if (!showCodeInput) {
      await handleSendCode()
      return
    }

    try {
      await verifyCode({ 
        email: data.email,
        code: data.code! 
      }).unwrap()

      // Complete login after verification
      const user = await login({
        email: data.email,
        password: data.password
      }).unwrap()

      router.push(user.profile ? "/dashboard" : "/profile/create")
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Invalid code or expired. Please try again",
      })
    }
  }

  return (
    <div className="max-w-md w-full space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Secure Login</h1>
        <p className="mt-2 text-muted-foreground">
          {showCodeInput ? 
            "Enter your verification code" : 
            "Sign in with your credentials"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleVerification)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={showCodeInput}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={showCodeInput}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {showCodeInput && (
          <div className="space-y-2 animate-in fade-in">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              {...register("code", {
                required: "Code is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Must be 6 digits"
                }
              })}
              id="code"
              type="text"
              placeholder="123456"
              inputMode="numeric"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full gap-2"
          disabled={isLoading}
        >
          {isLoading && <RotateCw className="h-4 w-4 animate-spin" />}
          {showCodeInput ? "Verify Code" : "Login"}
        </Button>

        {showCodeInput && (
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Didn't receive code?{" "}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resendCooldown > 0}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend {resendCooldown > 0 && `(${resendCooldown})`}
              </button>
            </p>
          </div>
        )}
      </form>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <a 
            href="/register" 
            className="text-primary hover:underline"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}