"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, RotateCw, ArrowLeft } from 'lucide-react'
import { useLoginMutation, useVerifyCodeMutation, useResendCodeMutation } from "@/redux/features/authApiSlice"
import { toast } from "react-toastify"

export interface LoginErrorResponse {
  data?: {
    detail?: string;
    non_field_errors?: string[];
    email?: string[];
    password?: string[];
    code?: string[];
  };
  status?: number;
}

// Step types for the multi-step form
type FormStep = "EMAIL" | "VERIFICATION" | "PASSWORD"

// Form data interfaces for each step
interface EmailFormData {
  email: string
}

interface VerificationFormData {
  code: string
}

interface PasswordFormData {
  password: string
}

export default function VerificationLoginForm() {
  const router = useRouter()

  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>("EMAIL")
  const [showPassword, setShowPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verifiedEmail, setVerifiedEmail] = useState<string>("")

  // Form handlers for each step
  const emailForm = useForm<EmailFormData>()
  const verificationForm = useForm<VerificationFormData>()
  const passwordForm = useForm<PasswordFormData>()

  // API mutations
  const [sendCode, { isLoading: isSendingCode }] = useResendCodeMutation()
  const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation()
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()

  // Cooldown timer for resending code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  // Extract error message from API response
  const extractErrorMessage = (error: any): string => {
    if (!error) return "An unknown error occurred"
    
    const errorData = error.data || {}
    
    // Check for specific field errors
    if (errorData.email && errorData.email.length > 0) {
      return `Email: ${errorData.email[0]}`
    }
    
    if (errorData.password && errorData.password.length > 0) {
      return `Password: ${errorData.password[0]}`
    }
    
    if (errorData.code && errorData.code.length > 0) {
      return `Code: ${errorData.code[0]}`
    }
    
    if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
      return errorData.non_field_errors[0]
    }
    
    if (errorData.detail) {
      return errorData.detail
    }
    
    // Handle network errors
    if (!navigator.onLine) {
      return "Network error: Please check your internet connection"
    }
    
    // Default error messages based on status code
    switch (error.status) {
      case 400: return "Invalid request: Please check your information"
      case 401: return "Authentication failed: Your credentials are incorrect"
      case 403: return "Access denied: You don't have permission for this action"
      case 404: return "Account not found: No account exists with this email"
      case 429: return "Too many attempts: Please wait a moment before trying again"
      case 500:
      case 502:
      case 503: return "Server error: We're experiencing technical difficulties"
      default: return "An error occurred. Please try again"
    }
  }

  // Step 1: Handle email submission and send verification code
  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      await sendCode({ email: data.email }).unwrap()
      setVerifiedEmail(data.email)
      setCurrentStep("VERIFICATION")
      setResendCooldown(60)
      toast.success("Verification code sent. Check your email.")
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    }
  }

  // Step 2: Handle verification code submission
  const handleVerificationSubmit = async (data: VerificationFormData) => {
    try {
      await verifyCode({
        email: verifiedEmail,
        code: data.code,
      }).unwrap()

      setCurrentStep("PASSWORD")
      toast.success("Email verified. Please enter your password to continue.")
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    }
  }

  // Step 3: Handle password submission and login
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      const user = await login({
        email: verifiedEmail,
        password: data.password,
      }).unwrap()

      toast.success("Login successful. Welcome back!")
      router.push(user.profile ? "/dashboard" : "/profile/update")
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    }
  }

  // Handle resending verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    try {
      await sendCode({ email: verifiedEmail }).unwrap()
      setResendCooldown(60)
      toast.success("Code resent. Check your email for the new verification code")
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    }
  }

  // Go back to previous step
  const goBack = () => {
    if (currentStep === "VERIFICATION") {
      setCurrentStep("EMAIL")
    } else if (currentStep === "PASSWORD") {
      setCurrentStep("VERIFICATION")
    }
  }

  return (
    <div className="max-w-md w-full space-y-6 mx-auto">
    <div className="text-center">
        {/* Title and subtitle 
        <h1 className="text-2xl font-bold">Secure Login</h1>
        */}
        <p className="mt-2 text-[14px]">
          {currentStep === "EMAIL" && "Enter your email to begin"}
          {currentStep === "VERIFICATION" && "Enter the verification code sent to your email"}
          {currentStep === "PASSWORD" && "Enter your password to complete login"}
        </p>
      </div>

      {/* Step 1: Email Form */}
      {currentStep === "EMAIL" && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...emailForm.register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              id="email"
              type="email"
              placeholder="name@example.com"
              defaultValue={verifiedEmail}
            />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
            disabled={isSendingCode}
          >
            {isSendingCode && <RotateCw className="h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      )}

      {/* Step 2: Verification Form */}
      {currentStep === "VERIFICATION" && (
        <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="code">Verification Code</Label>
              <span className="text-sm text-muted-foreground">{verifiedEmail}</span>
            </div>
            <Input
              {...verificationForm.register("code", {
                required: "Code is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Must be 6 digits",
                },
              })}
              id="code"
              type="text"
              placeholder="123456"
              inputMode="numeric"
              autoFocus
            />
            {verificationForm.formState.errors.code && (
              <p className="text-sm text-destructive">{verificationForm.formState.errors.code.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
            disabled={isVerifying}
          >
            {isVerifying && <RotateCw className="h-4 w-4 animate-spin" />}
            Verify Code
          </Button>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Change email
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isSendingCode}
              className="text-primary hover:underline disabled:opacity-50"
            >
              Resend code {resendCooldown > 0 && `(${resendCooldown}s)`}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Password Form */}
      {currentStep === "PASSWORD" && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <span className="text-sm text-muted-foreground">{verifiedEmail}</span>
            </div>
            <div className="relative">
              <Input
                {...passwordForm.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
            disabled={isLoggingIn}
          >
            {isLoggingIn && <RotateCw className="h-4 w-4 animate-spin" />}
            Login
          </Button>

          <button
            type="button"
            onClick={goBack}
            className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to verification
          </button>
        </form>
      )}

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}