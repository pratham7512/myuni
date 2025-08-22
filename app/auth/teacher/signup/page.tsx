"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function TeacherSignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role: "teacher" }),
    })
    if (!res.ok) {
      const data = await res.json().catch(()=>({error:"Signup failed"}))
      setError(data.error || "Signup failed")
      return
    }
    await signIn("credentials", { email, password, redirect: true, callbackUrl: "/teacher" })
  }

  return (
    <div className="mx-auto max-w-md py-20">
      <Card className="bg-card/40 rounded-none border border-white/15">
        <CardHeader className="bg-primary text-primary-foreground rounded-none">
          <CardTitle>Create teacher account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@university.edu" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <p className="text-sm text-muted-foreground">Your teacher access will be pending until an admin approves.</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" type="submit">Create account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


