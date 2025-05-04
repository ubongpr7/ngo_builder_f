"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, RotateCw, ArrowLeft } from "lucide-react"
import { useLoginMutation, useVerifyCodeMutation, useResendCodeMutation } from "@/redux/features/authApiSlice"

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
  const { toast } = useToast()
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

  // Handle API errors with detailed messages
  const handleApiError = (error: any, defaultTitle: string) => {
    const status = error?.status || 0
    const errorData = error?.data || {}

    // Default error message
    let errorTitle = defaultTitle
    let errorDescription = "Please try again later"

    // Handle specific error status codes
    switch (status) {
      case 400:
        errorTitle = "Invalid request"
        errorDescription = errorData.detail || "Please check your information and try again"
        break
      case 401:
        errorTitle = "Authentication failed"
        errorDescription = "Your credentials are incorrect"
        break
      case 403:
        errorTitle = "Access denied"
        errorDescription = "You don't have permission to perform this action"
        break
      case 404:
        errorTitle = "Account not found"
        errorDescription = "No account exists with this email address"
        break
      case 429:
        errorTitle = "Too many attempts"
        errorDescription = "Please wait a moment before trying again"
        break
      case 500:
      case 502:
      case 503:
        errorTitle = "Server error"
        errorDescription = "We're experiencing technical difficulties. Please try again later"
        break
      default:
        // Check if there's a network error
        if (!navigator.onLine) {
          errorTitle = "Network error"
          errorDescription = "Please check your internet connection and try again"
        } else if (errorData.detail) {
          // Use the error detail from the API if available
          errorDescription = errorData.detail
        }
    }

    toast({
      variant: "destructive",
      title: errorTitle,
      description: errorDescription,
    })

    console.error(`API Error (${defaultTitle}):`, error)
  }

  // Step 1: Handle email submission and send verification code
  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      await sendCode({ email: data.email }).unwrap()
      setVerifiedEmail(data.email)
      setCurrentStep("VERIFICATION")
      setResendCooldown(60)
      toast({
        title: "Verification code sent",
        description: "Check your email for the 6-digit code",
      })
    } catch (error) {
      handleApiError(error, "Failed to send verification code")
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
      toast({
        title: "Email verified",
        description: "Please enter your password to continue",
      })
    } catch (error) {
      handleApiError(error, "Verification failed")
    }
  }

  // Step 3: Handle password submission and login
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      const user = await login({
        email: verifiedEmail,
        password: data.password,
      }).unwrap()

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })

      router.push(user.profile ? "/dashboard" : "/profile/update")
    } catch (error) {
      handleApiError(error, "Login failed")
    }
  }

  // Handle resending verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    try {
      await sendCode({ email: verifiedEmail }).unwrap()
      setResendCooldown(60)
      toast({
        title: "Code resent",
        description: "Check your email for the new verification code",
      })
    } catch (error) {
      handleApiError(error, "Failed to resend code")
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
        <h1 className="text-2xl font-bold">Secure Login</h1>
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
