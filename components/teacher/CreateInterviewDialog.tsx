"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"

export default function CreateInterviewDialog({ moduleId, initialDescription }: { moduleId: string; initialDescription?: string }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState(initialDescription ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDescription(initialDescription ?? "")
  }, [initialDescription])

  const save = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/teacher/modules/${moduleId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: "Failed" }))
        setError(data.error || "Failed to save interview")
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
      <Button onClick={()=>setOpen(true)}>{initialDescription ? "Edit interview" : "Add interview"}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>{initialDescription ? "Edit interview" : "Add interview"}</DialogHeader>
        <DialogContent>
          <div className="space-y-2">
            <label className="text-sm">Description</label>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full h-40 border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Describe the interview focus, format, and expectations" />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button className="border border-white/20 bg-transparent text-white" type="button" onClick={()=>setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={save} disabled={loading}>{loading? (initialDescription?"Saving...":"Creating...") : (initialDescription?"Save":"Create")}</Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}



