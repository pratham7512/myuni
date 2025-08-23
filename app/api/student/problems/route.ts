import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BodySchema = z.object({
  problemId: z.string().min(1),
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

  const { problemId } = parsed.data

  // Mock problem for testing: navigate to /student/problems/mock so the body sends "mock"
  if (problemId === "mock") {
    return NextResponse.json({
      id: "00000000-0000-0000-0000-000000000000",
      title: "Two Sum (Mock)",
      statement_md: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Return the answer in any order.

### Example
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9.`,
      metadata: { difficulty: "easy", tags: ["array", "hashmap"], source: "mock" },
      testcases: [
        { input: { nums: [2,7,11,15], target: 9 }, output: [0,1] },
        { input: { nums: [3,2,4], target: 6 }, output: [1,2] },
        { input: { nums: [3,3], target: 6 }, output: [0,1] },
      ],
    })
  }

  const problem = await prisma.problems.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      title: true,
      statement_md: true,
      metadata: true,
      testcases: true,
      classroom_id: true,
    },
  })

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 })
  }

  // Ensure the student is a member of the classroom that owns this problem
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

  return NextResponse.json({
    id: problem.id,
    title: problem.title,
    statement_md: problem.statement_md,
    metadata: problem.metadata,
    testcases: problem.testcases,
  })
}