import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { problemId, title, statement, testcases, metadata, classroomId } = await req.json()
    let problemIdToUse = problemId as string | undefined
    if (!problemIdToUse) {
      if (!classroomId || !title || !statement) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
      const created = await prisma.problems.create({
        data: {
          classroom_id: classroomId,
          author_id: session.user.id,
          title,
          statement_md: statement,
          testcases: testcases ?? [],
          metadata: metadata ?? {},
        }
      })
      problemIdToUse = created.id
    }
    const maxIdx = await prisma.module_problem_map.aggregate({ where: { module_id: params.moduleId }, _max: { order_index: true } })
    await prisma.module_problem_map.create({ data: { module_id: params.moduleId, problem_id: problemIdToUse, order_index: (maxIdx._max.order_index ?? 0) + 1 } })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    console.error("POST /api/teacher/modules/[moduleId]/problems", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { mappingId } = await req.json()
    if (!mappingId) return NextResponse.json({ error: "mappingId required" }, { status: 400 })
    await prisma.module_problem_map.delete({ where: { id: mappingId } })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    console.error("DELETE /api/teacher/modules/[moduleId]/problems", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


