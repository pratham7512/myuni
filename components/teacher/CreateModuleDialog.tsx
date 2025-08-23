"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"

export default function CreateModuleDialog({ classroomId }: { classroomId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/teacher/classrooms/${classroomId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: "Failed" }))
        setError(data.error || "Failed to create module")
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
      <Button onClick={()=>setOpen(true)}>Create assignment</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Create assignment (module)</DialogHeader>
        <DialogContent>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Module title" />
            <label className="text-sm" htmlFor="desc">Description (optional)</label>
            <input id="desc" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Short description" />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button className="border border-white/20 bg-transparent text-white" type="button" onClick={()=>setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={create} disabled={loading}>{loading?"Creating...":"Create"}</Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}


