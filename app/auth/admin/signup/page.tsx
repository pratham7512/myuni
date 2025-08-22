"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function AdminSignupPage() {
  const [email, setEmail] = useState("prathameshdesai679@gmail.com")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("Admin")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role: "university_admin" }),
    })
    if (!res.ok) {
      const data = await res.json().catch(()=>({error:"Signup failed"}))
      setError(data.error || "Signup failed")
      return
    }
    await signIn("credentials", { email, password, redirect: true, callbackUrl: "/admin" })
  }

  return (
    <div className="mx-auto max-w-md py-20">
      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Create admin account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Admin" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="admin@university.edu" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" type="submit">Create admin</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


