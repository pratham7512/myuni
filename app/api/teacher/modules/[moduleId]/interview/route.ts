import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function ensureTeacherOwnsModule(moduleId: string, userId: string) {
  const mod = await prisma.modules.findUnique({
    where: { id: moduleId },
    include: { classroom: true },
  })
  if (!mod) return { status: 404 as const, error: "Module not found" }
  if (mod.classroom.teacher_id !== userId) return { status: 403 as const, error: "Forbidden" }
  return { status: 200 as const, mod }
}

export async function GET(_req: NextRequest, { params }: { params: { moduleId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const ok = await ensureTeacherOwnsModule(params.moduleId, session.user.id)
  if (ok.status !== 200) return NextResponse.json({ error: ok.error }, { status: ok.status })
  const interview = await prisma.interviews.findUnique({ where: { module_id: params.moduleId } })
  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(interview)
}

export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const ok = await ensureTeacherOwnsModule(params.moduleId, session.user.id)
    if (ok.status !== 200) return NextResponse.json({ error: ok.error }, { status: ok.status })
    const { description } = await req.json()
    if (!description || typeof description !== "string") return NextResponse.json({ error: "Description required" }, { status: 400 })
    const saved = await prisma.interviews.upsert({
      where: { module_id: params.moduleId },
      update: { description },
      create: { module_id: params.moduleId, description },
    })
    return NextResponse.json(saved, { status: 200 })
  } catch (e:any) {
    console.error("POST /api/teacher/modules/[moduleId]/interview", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const ok = await ensureTeacherOwnsModule(params.moduleId, session.user.id)
    if (ok.status !== 200) return NextResponse.json({ error: ok.error }, { status: ok.status })
    const existing = await prisma.interviews.findUnique({ where: { module_id: params.moduleId } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    await prisma.interviews.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    console.error("DELETE /api/teacher/modules/[moduleId]/interview", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


