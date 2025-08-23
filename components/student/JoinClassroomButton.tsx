"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"

export default function JoinClassroomButton() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const join = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/student/join-classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomCode: code }),
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: "Failed to join" }))
        setError(data.error || "Failed to join")
        return
      }
      // reload page content
      window.location.reload()
    } catch (e) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Join classroom</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Join classroom</DialogHeader>
        <DialogContent>
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm">Classroom code</label>
            <input id="code" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="ABCDE1" className="w-full border border-white/20 bg-transparent px-3 py-2 rounded-none" />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" onClick={()=>setOpen(false)} className="border border-white/20 bg-transparent text-white">Cancel</Button>
          <Button type="button" onClick={join} disabled={loading}>{loading ? "Joining..." : "Join"}</Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}


