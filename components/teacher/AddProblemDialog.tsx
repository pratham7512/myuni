"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"

export default function AddProblemDialog({ moduleId, classroomId }: { moduleId: string; classroomId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [statement, setStatement] = useState("")
  const [testcasesText, setTestcasesText] = useState("[]")
  const [metadataText, setMetadataText] = useState("{}")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const add = async () => {
    setLoading(true)
    setError(null)
    try {
      let parsedTestcases: unknown = null
      let parsedMetadata: unknown = null
      try {
        parsedTestcases = testcasesText.trim() === "" ? [] : JSON.parse(testcasesText)
      } catch {
        setError("Testcases must be valid JSON (usually an array)")
        return
      }
      try {
        parsedMetadata = metadataText.trim() === "" ? {} : JSON.parse(metadataText)
      } catch {
        setError("Metadata must be valid JSON (object)")
        return
      }
      if (!Array.isArray(parsedTestcases)) {
        setError("Testcases JSON must be an array")
        return
      }
      if (parsedMetadata === null || typeof parsedMetadata !== "object" || Array.isArray(parsedMetadata)) {
        setError("Metadata JSON must be an object")
        return
      }
      const res = await fetch(`/api/teacher/modules/${moduleId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId, title, statement, testcases: parsedTestcases, metadata: parsedMetadata })
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: "Failed" }))
        setError(data.error || "Failed to add problem")
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
      <Button onClick={()=>setOpen(true)}>Add problem</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Add problem</DialogHeader>
        <DialogContent>
          <div className="space-y-2">
            <label className="text-sm">Title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Two Sum" />
            <label className="text-sm">Statement (markdown)</label>
            <textarea value={statement} onChange={(e)=>setStatement(e.target.value)} className="w-full h-40 border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder="Problem statement..." />
            <label className="text-sm">Testcases (JSON array)</label>
            <textarea value={testcasesText} onChange={(e)=>setTestcasesText(e.target.value)} className="w-full h-32 border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder='e.g. [{"input":"1 2","output":"3"}]' />
            <label className="text-sm">Metadata (JSON object)</label>
            <textarea value={metadataText} onChange={(e)=>setMetadataText(e.target.value)} className="w-full h-24 border border-white/20 bg-transparent px-3 py-2 rounded-none" placeholder='e.g. {"difficulty":"easy","tags":["array"]}' />
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


