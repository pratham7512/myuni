"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"

export default function AddProblemDialog({ moduleId, classroomId }: { moduleId: string; classroomId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [statement, setStatement] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const add = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/teacher/modules/${moduleId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId, title, statement })
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: "Failed" }))
        setError(data.error || "Failed to add problem")
        return
      }
      setOpen(false)
      window.location.reload()
    } catch (e:any) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={()=>setOpen(true)}>Add problem</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Add problem</DialogHeader>
        <DialogContent>
          <div className="space-y-2">
            <label className="text-sm">Title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Two Sum" />
            <label className="text-sm">Statement (markdown)</label>
            <textarea value={statement} onChange={(e)=>setStatement(e.target.value)} className="w-full h-40 border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Problem statement..." />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button className="border border-white/20 bg-transparent text-white" type="button" onClick={()=>setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={add} disabled={loading}>{loading?"Adding...":"Add"}</Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}


