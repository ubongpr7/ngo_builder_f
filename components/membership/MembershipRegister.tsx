"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { setCookie } from "cookies-next"
import { useState, useMemo } from "react"
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react"
import { useRegisterMutation } from "@/redux/features/authApiSlice"
import type { ErrorResponse, RegisterResponse } from "../interfaces/authResponse"
import { Progress } from "@/components/ui/progress"

export default function MembershipRegister() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [passwordFocused, setPasswordFocused] = useState(false)
  const router = useRouter()
  const [registerUser, { isLoading }] = useRegisterMutation()

  // Password validation criteria
  const hasMinLength = password?.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  const passwordsMatch = password === confirmPassword && password !== ""

  // Additional password validation per policy
  const hasNoNameOrEmail = useMemo(() => {
    if (!password) return true

    const lowerPassword = password.toLowerCase()
    const lowerFirstName = firstName.toLowerCase()
    const lowerLastName = lastName.toLowerCase()
    const lowerEmail = email.toLowerCase().split("@")[0]

    return (
      !lowerPassword.includes(lowerFirstName) &&
      !lowerPassword.includes(lowerLastName) &&
      (lowerEmail?.length <= 3 || !lowerPassword.includes(lowerEmail))
    )
  }, [password, firstName, lastName, email])

  const hasNoRepeatedPatterns = useMemo(() => {
    if (!password) return true

    // Check for repeated characters (more than 3 of the same character)
    const repeatedChars = /(.)\1{3,}/.test(password)

    // Check for simple sequences
    const simpleSequences = [
      "12345",
      "23456",
      "34567",
      "45678",
      "56789",
      "67890",
      "abcde",
      "bcdef",
      "cdefg",
      "defgh",
      "efghi",
      "fghij",
      "qwert",
      "asdfg",
      "zxcvb",
    ]

    const hasSimpleSequence = simpleSequences.some((seq) => password.toLowerCase().includes(seq))

    // Check for common passwords
    const commonPasswords = [
      "password",
      "admin",
      "123456",
      "qwerty",
      "welcome",
      "letmein",
      "football",
      "iloveyou",
      "monkey",
      "abc123",
    ]

    const isCommonPassword = commonPasswords.some((common) => password.toLowerCase() === common)

    return !repeatedChars && !hasSimpleSequence && !isCommonPassword
  }, [password])

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    let strength = 0
    if (hasMinLength) strength += 15
    if (hasUppercase) strength += 15
    if (hasLowercase) strength += 15
    if (hasNumber) strength += 15
    if (hasSpecialChar) strength += 15
    if (hasNoNameOrEmail) strength += 10
    if (hasNoRepeatedPatterns) strength += 15

    return strength
  }, [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar, hasNoNameOrEmail, hasNoRepeatedPatterns])

  // Get strength label and color
  const getStrengthLabel = () => {
    if (passwordStrength < 50) return { label: "Weak", color: "bg-red-500" }
    if (passwordStrength < 80) return { label: "Moderate", color: "bg-yellow-500" }
    return { label: "Strong", color: "bg-green-500" }
  }

  const strengthInfo = getStrengthLabel()

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.trim() !== "" &&
      passwordStrength >= 70 && // Require at least moderate-to-strong strength
      passwordsMatch
    )
  }, [firstName, lastName, email, passwordStrength, passwordsMatch])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isFormValid) {
      toast.error("Please fix the errors in the form before submitting", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
      return
    }

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      re_password: confirmPassword,
    }

    try {
      const userData = (await registerUser(formData).unwrap()) as RegisterResponse
      toast.success("Registration successful! Redirecting...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
      setCookie("userID", userData.id)
      router.push("/accounts/verify")
    } catch (error) {
      const apiError = error as ErrorResponse

      // Handle different types of errors
      if (apiError.status === 400) {
        // Field-specific errors
        const fieldErrors = apiError.data || {}

        if (fieldErrors.email) {
          toast.error(`Email: ${fieldErrors.email}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          })
        }
        if (fieldErrors.password) {
          toast.error(`Password: ${fieldErrors.password}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          })
        }
        if (fieldErrors.first_name) {
          toast.error(`First Name: ${fieldErrors.first_name}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          })
        }
        if (fieldErrors.last_name) {
          toast.error(`Last Name: ${fieldErrors.last_name}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          })
        }
        if (fieldErrors.non_field_errors) {
          toast.error(fieldErrors.non_field_errors, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          })
        }
      } else {
        // General error
        const errorMessage = apiError.data?.detail || "Registration failed"
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={password && passwordStrength < 70 ? "border-red-300 focus:border-red-500" : ""}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-sm">
              <span>Password strength:</span>
              <span
                className={`font-medium ${
                  strengthInfo.label === "Weak"
                    ? "text-red-500"
                    : strengthInfo.label === "Moderate"
                      ? "text-yellow-500"
                      : "text-green-500"
                }`}
              >
                {strengthInfo.label}
              </span>
            </div>
            <Progress value={passwordStrength} className={`h-2 ${strengthInfo.color}`} />

            {/* Password requirements */}
            <div className="space-y-1 text-sm mt-2">
              <p className="font-medium text-gray-700">Password requirements:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  {hasMinLength ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  <span className={hasMinLength ? "text-gray-700" : "text-red-500"}>At least 8 characters</span>
                </li>
                <li className="flex items-center gap-2">
                  {hasUppercase ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  <span className={hasUppercase ? "text-gray-700" : "text-red-500"}>
                    At least one uppercase letter (A-Z)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {hasLowercase ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  <span className={hasLowercase ? "text-gray-700" : "text-red-500"}>
                    At least one lowercase letter (a-z)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {hasNumber ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  <span className={hasNumber ? "text-gray-700" : "text-red-500"}>At least one number (0-9)</span>
                </li>
                <li className="flex items-center gap-2">
                  {hasSpecialChar ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={hasSpecialChar ? "text-gray-700" : "text-red-500"}>
                    At least one special character (!@#$%^&*)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {hasNoNameOrEmail ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={hasNoNameOrEmail ? "text-gray-700" : "text-red-500"}>
                    Must not contain your name or email
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {hasNoRepeatedPatterns ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={hasNoRepeatedPatterns ? "text-gray-700" : "text-red-500"}>
                    No repeated patterns or common passwords
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="Enter Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={confirmPassword && !passwordsMatch ? "border-red-300 focus:border-red-500" : ""}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password match indicator */}
        {confirmPassword && (
          <div className="flex items-center gap-2 text-sm mt-1">
            {passwordsMatch ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
            <span className={passwordsMatch ? "text-green-500" : "text-red-500"}>
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? "Registering..." : "Register"}
      </Button>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Password Security Notice</p>
            <p className="mt-1">
              Your password must meet all the requirements listed above to comply with Destiny Builders Empowerment
              Foundation's security policy.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        By clicking "Register", you agree to our{" "}
        <Link href="/terms" className="text-green-600 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-green-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}
