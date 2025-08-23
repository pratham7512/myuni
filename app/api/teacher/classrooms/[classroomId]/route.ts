import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function ensureOwner(teacherId: string, classroomId: string) {
  const cls = await prisma.classrooms.findUnique({ where: { id: classroomId } })
  if (!cls || cls.teacher_id !== teacherId) return null
  return cls
}

export async function PATCH(req: NextRequest, { params }: { params: { classroomId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const owner = await ensureOwner(session.user.id, params.classroomId)
    if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await req.json()
    const name = (body?.name as string | undefined)?.trim()
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
    const updated = await prisma.classrooms.update({ where: { id: params.classroomId }, data: { name } })
    return NextResponse.json(updated)
  } catch (e) {
    console.error("PATCH /api/teacher/classrooms/[classroomId]", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { classroomId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const owner = await ensureOwner(session.user.id, params.classroomId)
    if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    await prisma.classrooms.delete({ where: { id: params.classroomId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("DELETE /api/teacher/classrooms/[classroomId]", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


