"use client"
import { useEffect, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type Problem = {
  id: string
  title: string
  statement_md: string
  metadata: unknown
  testcases: unknown
}

const LANGUAGE_OPTIONS = ["python", "cpp", "js", "java"] as const
export type Language = typeof LANGUAGE_OPTIONS[number]

export function EditorClient({ problemId }: { problemId: string }) {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>("python")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<
    | null
    | {
        submissionId: string
        verdict: string
        submittedAt: string
        runtimeMs?: number | null
        memoryKb?: number | null
        testResults?: Array<{
          index: number
          status: { id: number; description: string }
          time_ms?: number | null
          memory_kb?: number | null
          stdout?: string | null
          stderr?: string | null
          compile_output?: string | null
          message?: string | null
        }>
      }
  >(null)
  const codeTemplates = useMemo(
    () => ({
      python: "# Write your solution here\n\n",
      cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Write your solution here\n    return 0;\n}\n",
      js: "// Write your solution here\n\n",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        // Write your solution here\n    }\n}\n",
    }),
    []
  )
  const [code, setCode] = useState(codeTemplates[language])

  useEffect(() => {
    setCode(codeTemplates[language])
  }, [language, codeTemplates])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/student/problems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId }),
        })
        if (!res.ok) {
          const e = await res.json().catch(() => ({}))
          throw new Error(e?.error || `Failed to load problem (${res.status})`)
        }
        const data = await res.json()
        if (!cancelled) setProblem(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [problemId])

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/student/problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, language, code }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e?.error || `Submit failed (${res.status})`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading problem...</div>
    )
  }
  if (error) {
    return (
      <div className="text-sm text-red-600">{error}</div>
    )
  }
  if (!problem) return null

  const monacoLanguageMap: Record<Language, string> = {
    python: "python",
    cpp: "cpp",
    js: "javascript",
    java: "java",
  }

  const ioInstructions = (() => {
    const meta = problem?.metadata
    if (!meta || typeof meta !== "object") return undefined
    const io = (meta as Record<string, unknown>).io
    if (!io || typeof io !== "object") return undefined
    return (io as Record<string, unknown>).instructions
  })()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="min-h-[70vh] rounded-md border p-4">
        <h1 className="mb-4 text-xl font-semibold">{problem.title}</h1>
        <article className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {problem.statement_md}
          </ReactMarkdown>
        </article>
        <div className="mt-4 rounded-md border bg-muted/20 p-3 text-sm">
          <div className="font-medium mb-1">Input/Output Specification</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your program must read all input from standard input (stdin) and write the answer to standard output (stdout).</li>
            <li>Do not print extra prompts or labels. Print only the required output.</li>
            <li>Multiple test cases are run. Your code executes separately for each test case.</li>
            <li>If the problem provides custom IO instructions below, follow them exactly.</li>
            <li>Default token-based input (if unspecified): first line n, second line n space-separated integers, third line target.</li>
            <li>Array outputs are compared flexibly. Any of these are accepted: <code>[1,2]</code>, <code>[1, 2]</code>, <code>1 2</code>, <code>1,2</code>. Keep order correct.</li>
            <li>Trailing newlines are ignored, but avoid extra spaces beyond what is shown.</li>
          </ul>
          {ioInstructions && (
            <div className="mt-2 rounded bg-background p-2">
              <div className="mb-1 font-medium">Custom IO</div>
              <pre className="whitespace-pre-wrap text-xs">{String(ioInstructions)}</pre>
            </div>
          )}
        </div>
      </div>
      <div className="flex min-h-[70vh] flex-col rounded-md border">
        <div className="flex items-center justify-between gap-3 border-b p-3">
          <div className="flex items-center gap-2">
            <label htmlFor="language" className="text-sm">Language</label>
            <select
              id="language"
              className="rounded-md border px-2 py-1 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
        <div className="flex-1 p-0">
          <MonacoEditor
            language={monacoLanguageMap[language]}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
            height="100%"
          />
        </div>
        {result && (
          <div className="border-t p-3 text-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium">Verdict:</span>
              <span
                className={
                  "inline-flex items-center rounded px-2 py-0.5 " +
                  (result.verdict === "accepted"
                    ? "bg-green-100 text-green-700"
                    : result.verdict === "failed" || result.verdict === "runtime_error" || result.verdict === "compile_error"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800")
                }
              >
                {result.verdict}
              </span>
              {Array.isArray(result.testResults) && (
                <span className="text-muted-foreground">
                  Passed {result.testResults.filter(t => t.status?.id === 3).length}/{result.testResults.length}
                </span>
              )}
              {typeof result.runtimeMs === "number" && (
                <span className="text-muted-foreground">Time: {result.runtimeMs} ms</span>
              )}
              {typeof result.memoryKb === "number" && (
                <span className="text-muted-foreground">Memory: {result.memoryKb} KB</span>
              )}
            </div>
            {Array.isArray(result.testResults) && result.testResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1">#</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Time</th>
                      <th className="px-2 py-1">Memory</th>
                      <th className="px-2 py-1">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.testResults.map((t) => {
                      const notes = t.compile_output || t.stderr || t.message || ""
                      return (
                        <tr key={t.index} className="border-t">
                          <td className="px-2 py-1">{t.index + 1}</td>
                          <td className="px-2 py-1">{t.status?.description ?? ""}</td>
                          <td className="px-2 py-1">{t.time_ms ?? "-"}</td>
                          <td className="px-2 py-1">{t.memory_kb ?? "-"}</td>
                          <td className="px-2 py-1 max-w-[360px] truncate" title={notes ?? undefined}>
                            {notes ? notes.slice(0, 200) : ""}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}