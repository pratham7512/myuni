"use client"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useMemo } from "react"

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

  const resetErrors = () => setError(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
          body: JSON.stringify({ email: normalizedEmail, password, name, role })
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
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-2">
      {/* Left: black panel with form */}
      <div className="bg-black text-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{isSignUp ? "Create account" : "Welcome back"}</div>
            <p className="text-sm text-muted-foreground mt-1">{isSignUp ? "Join MyUni to get started" : "Sign in to continue"}</p>
          </div>
          <form onSubmit={onSubmit} onChange={resetErrors} className="space-y-4">
            <div className="space-y-2">
              <Label>Continue as</Label>
              <Tabs value={role} onValueChange={(v)=>setRole(v as any)}>
                <TabsList>
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                </TabsList>
                <TabsContent value="student"><div className="hidden" /></TabsContent>
                <TabsContent value="teacher"><div className="hidden" /></TabsContent>
              </Tabs>
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@university.edu" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} />
                <button type="button" onClick={()=>setShow((s)=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-80 hover:opacity-100">
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
                  <button type="button" onClick={()=>setShowConfirm((s)=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-80 hover:opacity-100">
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full rounded-none" type="submit">{isSignUp ? "Create account" : "Sign in"}</Button>
            <div className="text-xs text-muted-foreground text-center">
              {isSignUp ? (
                <button type="button" className="text-primary underline" onClick={()=>setIsSignUp(false)}>Already have an account? Sign in</button>
              ) : (
                <button type="button" className="text-primary underline" onClick={()=>setIsSignUp(true)}>Don’t have an account? Create one</button>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Right: blue promotional panel */}
      <div className="bg-primary text-primary-foreground flex items-center justify-center px-10 py-16">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold tracking-tight">Ace interviews and master DSA with MyUni</h2>
          <p className="mt-4 text-primary-foreground/90">Practice coding problems, track submissions, and run mock interviews in your classroom. Teachers curate modules and assignments; admins approve teacher access.</p>
          <ul className="mt-6 space-y-2 text-sm opacity-90 list-disc list-inside">
            <li>Clean, role-based dashboards</li>
            <li>Auto-graded code submissions with verdicts</li>
            <li>Interview sessions with transcripts and feedback</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


