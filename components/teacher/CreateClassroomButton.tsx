"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"

export default function CreateClassroomButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const createClassroom = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/teacher/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: "Failed" }))
        setError(data.error || "Failed to create classroom")
        return
      }
      setOpen(false)
      window.location.reload()
    } catch (e) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create classroom</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Create classroom</DialogHeader>
        <DialogContent>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm">Name</label>
            <input id="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. DSA Batch A" className="w-full border border-white/20 bg-transparent px-3 py-2 rounded-none" />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" onClick={()=>setOpen(false)} className="border border-white/20 bg-transparent text-white">Cancel</Button>
          <Button type="button" onClick={createClassroom} disabled={loading}>{loading?"Creating...":"Create"}</Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}


