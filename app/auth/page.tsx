"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff } from "lucide-react"

export default function UnifiedAuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // mode and role
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState<"student" | "teacher">("student")
  // form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  // ui
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const resetErrors = () => setError(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    const normalizedEmail = email.toLowerCase().trim()

    try {
      if (isSignUp) {
        // basic client validation
        if (!normalizedEmail || !password) {
          setError("Email and password are required")
          return
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters")
          return
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          return
        }

        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password, name, role }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Signup failed" }))
          setError(data.error || "Signup failed")
          return
        }
        const signInRes = await signIn("credentials", { email: normalizedEmail, password, redirect: false })
        if (signInRes?.ok) {
          router.push("/auth/redirect")
          return
        }
        setIsSignUp(false)
        setError("Account created. Please sign in.")
        return
      }

      // sign in
      const res = await signIn("credentials", { email: normalizedEmail, password, redirect: false })
      if (res?.ok) {
        router.push("/auth/redirect")
      } else {
        setError("Invalid credentials")
      }
    } catch (err) {
      console.error("auth submit error", err)
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const r = session.user.role
      if (r === "university_admin") router.replace("/admin")
      else if (r === "teacher") router.replace("/teacher")
      else router.replace("/student")
    }
  }, [status, session, router])

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="bg-black text-white flex items-center justify-center px-8 lg:px-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">{isSignUp ? "Create account" : "Welcome back"}</h1>
            <p className="text-white/70 text-base leading-relaxed">
              {isSignUp ? "Join MyUni to get started" : "Sign in to continue to your dashboard"}
            </p>
          </div>

          <form onSubmit={onSubmit} onChange={resetErrors} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white/90">Continue as</Label>
              <Tabs value={role} onValueChange={(v) => setRole(v as "student" | "teacher")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 border-0">
                  <TabsTrigger
                    value="student"
                    className="data-[state=active]:bg-white data-[state=active]:text-black text-white/80 font-medium"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger
                    value="teacher"
                    className="data-[state=active]:bg-white data-[state=active]:text-black text-white/80 font-medium"
                  >
                    Teacher
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-white/90">
                  Full name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-0 h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/90">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-0 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/90">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-0 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm font-medium text-white/90">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-0 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium transition-colors"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </div>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-blue-600 text-white flex items-center justify-center px-8 lg:px-16">
        <div className="max-w-lg space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Ace interviews and master DSA with MyUni
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Practice coding problems, track submissions, and run mock interviews in your classroom. Teachers curate
              modules and assignments; admins approve teacher access.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0" />
              <p className="text-blue-100">Clean, role-based dashboards for every user type</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0" />
              <p className="text-blue-100">Auto-graded code submissions with instant verdicts</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0" />
              <p className="text-blue-100">Interview sessions with transcripts and detailed feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
