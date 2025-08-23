import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Verdict } from "@prisma/client"
import { z } from "zod"

type Judge0Status = {
  id: number
  description: string
}

type Judge0Response = {
  token?: string
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
  status: Judge0Status
  time?: string | null
  memory?: number | null
}

function mapLanguageToJudge0Id(language: "python" | "cpp" | "js" | "java"): number {
  switch (language) {
    case "python":
      return 71
    case "cpp":
      return 54
    case "js":
      return 63
    case "java":
      return 62
    default:
      return 71
  }
}

function base64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64")
}

function decodeBase64(str?: string | null): string | null {
  if (!str) return null
  return Buffer.from(str, "base64").toString("utf8")
}

function ensureTrailingNewline(s: string | undefined): string | undefined {
  if (typeof s !== "string") return undefined
  return /\r?\n$/.test(s) ? s : s + "\n"
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a && b && typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
      return true
    }
    const ak = Object.keys(a).sort()
    const bk = Object.keys(b).sort()
    if (!deepEqual(ak, bk)) return false
    for (const k of ak) if (!deepEqual(a[k], b[k])) return false
    return true
  }
  return false
}

function stripQuotes(s: string): string {
  const t = s.trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1)
  }
  return t
}

function extractTokens(output: string): string[] {
  const re = /-?\d+\.\d+|-?\d+|[A-Za-z]+/g
  const tokens = output.match(re)
  return tokens ? tokens.map((t) => t) : []
}

type ComparatorConfig = {
  mode?: "auto" | "exact" | "json" | "tokens"
  ignoreOrder?: boolean
  floatEpsilon?: number
  caseInsensitive?: boolean
}

function normalizeComparatorConfig(meta: any | undefined | null): ComparatorConfig {
  const c = (meta && typeof meta === "object" ? (meta as any) : {}) as any
  const cfg: ComparatorConfig = {}
  if (typeof c.mode === "string") cfg.mode = c.mode
  if (typeof c.ignoreOrder === "boolean") cfg.ignoreOrder = c.ignoreOrder
  if (typeof c.floatEpsilon === "number") cfg.floatEpsilon = c.floatEpsilon
  if (typeof c.caseInsensitive === "boolean") cfg.caseInsensitive = c.caseInsensitive
  return cfg
}

function compareOutputFlexible(stdout: string | null | undefined, expected: any | string | undefined, cfg?: ComparatorConfig): boolean {
  const out = (stdout ?? "").trim()
  if (expected === undefined) {
    return out.length === 0
  }

  let expectedValue: any = expected
  if (typeof expected === "string") {
    try {
      expectedValue = JSON.parse(expected)
    } catch {
      // keep as string
    }
  }

  // anyOf: allow any of multiple acceptable outputs
  if (expectedValue && typeof expectedValue === "object" && !Array.isArray(expectedValue) && Array.isArray(expectedValue.anyOf)) {
    return expectedValue.anyOf.some((candidate: any) => compareOutputFlexible(out, candidate, cfg))
  }

  // If expected is structured (object/array) or cfg.mode === 'json', try JSON deep compare first
  if ((cfg?.mode === "json") || (expectedValue && typeof expectedValue === "object")) {
    try {
      const parsed = JSON.parse(out)
      return deepEqual(parsed, expectedValue)
    } catch {
      // fall through to token-based comparison if array-like
    }
  }

  if (Array.isArray(expectedValue)) {
    const expectedTokens = expectedValue.map((v) => String(v))
    const outTokens = extractTokens(out)
    if (cfg?.ignoreOrder) {
      const isNumArr = expectedTokens.every((t) => /^-?\d+(?:\.\d+)?$/.test(t)) && outTokens.every((t) => /^-?\d+(?:\.\d+)?$/.test(t))
      if (isNumArr) {
        const expNums = expectedTokens.map(Number).sort((a, b) => a - b)
        const outNums = outTokens.map(Number).sort((a, b) => a - b)
        if (expNums.length !== outNums.length) return false
        const eps = cfg?.floatEpsilon ?? 0
        for (let i = 0; i < expNums.length; i++) if (Math.abs(expNums[i] - outNums[i]) > eps) return false
        return true
      }
      const expSorted = [...expectedTokens].sort()
      const outSorted = [...outTokens].sort()
      if (expSorted.length !== outSorted.length) return false
      for (let i = 0; i < expSorted.length; i++) if (expSorted[i] !== outSorted[i]) return false
      return true
    } else {
      if (expectedTokens.length !== outTokens.length) return false
      const eps = cfg?.floatEpsilon ?? 0
      for (let i = 0; i < expectedTokens.length; i++) {
        const a = expectedTokens[i]
        const b = outTokens[i]
        if (/^-?\d+(?:\.\d+)?$/.test(a) && /^-?\d+(?:\.\d+)?$/.test(b) && eps > 0) {
          if (Math.abs(Number(a) - Number(b)) > eps) return false
        } else if (a !== b) {
          return false
        }
      }
      return true
    }
  }

  if (expectedValue && typeof expectedValue === "object") {
    try {
      const parsed = JSON.parse(out)
      return deepEqual(parsed, expectedValue)
    } catch {
      return false
    }
  }

  if (typeof expectedValue === "number") {
    const outTokens = extractTokens(out)
    if (outTokens.length !== 1) return false
    const n = Number(outTokens[0])
    const eps = cfg?.floatEpsilon ?? 0
    return eps > 0 ? Math.abs(n - expectedValue) <= eps : n === expectedValue
  }
  if (typeof expectedValue === "boolean") {
    const t = out.toLowerCase()
    if (expectedValue) return t === "true" || t === "1"
    return t === "false" || t === "0"
  }

  if (typeof expectedValue === "string") {
    const lhs = stripQuotes(out)
    const rhs = expectedValue.trim()
    return cfg?.caseInsensitive ? lhs.toLowerCase() === rhs.toLowerCase() : lhs === rhs
  }

  return out === String(expected).trim()
}

async function runSingleJudge0(
  source: string,
  languageId: number,
  stdin?: string,
  expectedOutput?: string
): Promise<Judge0Response> {
  const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com"
  const isRapid = /rapidapi/.test(JUDGE0_URL) || !!process.env.JUDGE0_API_KEY

  const url = `${JUDGE0_URL.replace(/\/$/, "")}/submissions?base64_encoded=true&wait=true`

  const body: Record<string, unknown> = {
    language_id: languageId,
    source_code: base64(source),
  }
  if (stdin !== undefined) body.stdin = base64(stdin)
  // We intentionally do not send expected_output; we compare outputs ourselves

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (isRapid) {
    if (process.env.JUDGE0_API_KEY) headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY
    if (process.env.JUDGE0_API_HOST) headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return {
      status: { id: 8, description: `Judge0 HTTP ${res.status}` },
      message: text,
    } as Judge0Response
  }

  const data = (await res.json()) as Judge0Response
  return data
}

const BodySchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(["python", "cpp", "js", "java"]),
  code: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { problemId, language, code } = parsed.data

  // Fast path for mock problem
  if (problemId === "mock") {
    const mockTestcases = [
      { input: "4\n2 7 11 15\n9\n", output: [0, 1] },
      { input: "3\n3 2 4\n6\n", output: [1, 2] },
      { input: "2\n3 3\n6\n", output: [0, 1] },
    ]

    const normalized: Array<{ stdin?: string; expected?: string; expectedRaw?: any }> = mockTestcases.map((tc) => ({
      stdin: tc?.input !== undefined ? String(tc.input) : undefined,
      expected: tc?.output !== undefined ? JSON.stringify(tc.output) + "\n" : undefined,
      expectedRaw: tc?.output,
    }))

    const langId = mapLanguageToJudge0Id(language)
    const perTest: Array<{
      index: number
      status: Judge0Status
      time_ms?: number | null
      memory_kb?: number | null
      stdout?: string | null
      stderr?: string | null
      compile_output?: string | null
      message?: string | null
    }> = []

    for (let i = 0; i < normalized.length; i++) {
      const tc = normalized[i]
      const result = await runSingleJudge0(code, langId, tc.stdin)
      const stdout = decodeBase64(result.stdout)
      const ok = compareOutputFlexible(stdout, tc.expectedRaw ?? tc.expected)
      const status: Judge0Status = (() => {
        if (result.status?.id === 6) return { id: 6, description: "Compilation Error" }
        if (result.status?.id === 7) return { id: 7, description: "Runtime Error" }
        if (result.status?.id === 5) return { id: 5, description: "Time Limit Exceeded" }
        if (result.status?.id === 8) return { id: 8, description: "Internal Error" }
        return ok ? { id: 3, description: "Accepted" } : { id: 4, description: "Wrong Answer" }
      })()
      perTest.push({
        index: i,
        status,
        time_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
        memory_kb: result.memory ?? null,
        stdout,
        stderr: decodeBase64(result.stderr),
        compile_output: decodeBase64(result.compile_output),
        message: decodeBase64(result.message),
      })
    }

    const aggregateVerdict = (() => {
      const statuses = perTest.map((t) => t.status.id)
      if (statuses.length === 0) return Verdict.unknown
      if (statuses.some((id) => id === 6)) return Verdict.compile_error
      if (statuses.some((id) => id === 7)) return Verdict.runtime_error
      if (statuses.some((id) => id === 5)) return Verdict.timeout
      if (statuses.some((id) => id === 4)) return Verdict.failed
      if (statuses.every((id) => id === 3)) return Verdict.accepted
      if (statuses.some((id) => id === 8)) return Verdict.error
      return Verdict.partial
    })()

    const runtimeMs = perTest.reduce<number>((acc, t) => (t.time_ms ?? 0) + acc, 0)
    const memoryKb = perTest.reduce<number>((acc, t) => Math.max(acc, t.memory_kb ?? 0), 0)

    return NextResponse.json({
      submissionId: "mock",
      verdict: aggregateVerdict,
      submittedAt: new Date().toISOString(),
      runtimeMs,
      memoryKb,
      testResults: perTest,
    })
  }

  // DB problem flow
  const problem = await prisma.problems.findUnique({
    where: { id: problemId },
    select: { id: true, classroom_id: true, testcases: true, metadata: true },
  })

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 })
  }

  const membership = await prisma.classroom_members.findFirst({
    where: {
      classroom_id: problem.classroom_id,
      user_id: session.user.id,
    },
    select: { id: true },
  })

  if (!membership) {
    return NextResponse.json({ error: "Access denied to this problem" }, { status: 403 })
  }

  const created = await prisma.code_submissions.create({
    data: {
      user_id: session.user.id,
      problem_id: problem.id,
      language,
      code,
      verdict: Verdict.unknown,
      runtime_ms: null,
      memory_kb: null,
    },
    select: { id: true },
  })

  const rawCases = Array.isArray(problem.testcases) ? (problem.testcases as any[]) : []
  const normalized: Array<{ stdin?: string; expected?: string; expectedRaw?: any }> = rawCases.map((tc, idx) => {
    if (typeof tc?.stdin === "string") {
      return {
        stdin: ensureTrailingNewline(tc.stdin),
        expected: ensureTrailingNewline(typeof tc.expected === "string" ? tc.expected : undefined),
        expectedRaw: tc?.expected,
      }
    }
    if (typeof tc?.input === "string") {
      return {
        stdin: ensureTrailingNewline(tc.input),
        expected: ensureTrailingNewline(typeof tc.output === "string" ? tc.output : undefined),
        expectedRaw: tc?.output,
      }
    }
    // Special handling for common shapes like Two Sum: { input: { nums: number[], target: number } }
    if (tc && tc.input && typeof tc.input === "object" && Array.isArray((tc.input as any).nums) && (tc.input as any).target !== undefined) {
      const nums = (tc.input as any).nums as any[]
      const target = (tc.input as any).target
      const n = Array.isArray(nums) ? nums.length : 0
      const line1 = `${n}\n`
      const line2 = `${nums.join(" ")}\n`
      const line3 = `${String(target)}\n`
      const stdin = line1 + line2 + line3
      const expected = tc?.output !== undefined ? JSON.stringify(tc.output) + "\n" : undefined
      return { stdin, expected, expectedRaw: tc?.output }
    }
    const stdin = tc?.input !== undefined ? JSON.stringify(tc.input) + "\n" : undefined
    const expected = tc?.output !== undefined ? JSON.stringify(tc.output) + "\n" : undefined
    return { stdin, expected, expectedRaw: tc?.output }
  })

  const langId = mapLanguageToJudge0Id(language)

  const perTest: Array<{
    index: number
    status: Judge0Status
    time_ms?: number | null
    memory_kb?: number | null
    stdout?: string | null
    stderr?: string | null
    compile_output?: string | null
    message?: string | null
  }> = []

  const comparatorCfg = normalizeComparatorConfig((problem as any)?.metadata?.comparator)
  for (let i = 0; i < normalized.length; i++) {
    const tc = normalized[i]
    const result = await runSingleJudge0(code, langId, tc.stdin)
    const stdout = decodeBase64(result.stdout)
    const ok = compareOutputFlexible(stdout, tc.expectedRaw ?? tc.expected, comparatorCfg)
    const status: Judge0Status = (() => {
      if (result.status?.id === 6) return { id: 6, description: "Compilation Error" }
      if (result.status?.id === 7) return { id: 7, description: "Runtime Error" }
      if (result.status?.id === 5) return { id: 5, description: "Time Limit Exceeded" }
      if (result.status?.id === 8) return { id: 8, description: "Internal Error" }
      return ok ? { id: 3, description: "Accepted" } : { id: 4, description: "Wrong Answer" }
    })()
    perTest.push({
      index: i,
      status,
      time_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
      memory_kb: result.memory ?? null,
      stdout,
      stderr: decodeBase64(result.stderr),
      compile_output: decodeBase64(result.compile_output),
      message: decodeBase64(result.message),
    })
  }

  const aggregateVerdict = (() => {
    const statuses = perTest.map((t) => t.status.id)
    if (statuses.length === 0) return Verdict.unknown
    if (statuses.some((id) => id === 6)) return Verdict.compile_error
    if (statuses.some((id) => id === 7)) return Verdict.runtime_error
    if (statuses.some((id) => id === 5)) return Verdict.timeout
    if (statuses.some((id) => id === 4)) return Verdict.failed
    if (statuses.every((id) => id === 3)) return Verdict.accepted
    if (statuses.some((id) => id === 8)) return Verdict.error
    return Verdict.partial
  })()

  const runtimeMs = perTest.reduce<number>((acc, t) => (t.time_ms ?? 0) + acc, 0)
  const memoryKb = perTest.reduce<number>((acc, t) => Math.max(acc, t.memory_kb ?? 0), 0)

  const updated = await prisma.code_submissions.update({
    where: { id: created.id },
    data: {
      verdict: aggregateVerdict,
      runtime_ms: Number.isFinite(runtimeMs) ? runtimeMs : null,
      memory_kb: Number.isFinite(memoryKb) ? memoryKb : null,
      test_results: perTest,
    },
    select: { id: true, verdict: true, submitted_at: true, runtime_ms: true, memory_kb: true, test_results: true },
  })

  return NextResponse.json({
    submissionId: updated.id,
    verdict: updated.verdict,
    submittedAt: updated.submitted_at,
    runtimeMs: updated.runtime_ms,
    memoryKb: updated.memory_kb,
    testResults: updated.test_results,
  })
}