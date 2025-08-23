import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const classroom = await prisma.classrooms.findFirst({ where: { id: classroomId, teacher_id: session.user.id } })
  if (!classroom) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const modules = await prisma.modules.findMany({ where: { classroom_id: classroomId }, orderBy: { order_index: "asc" } })
  return NextResponse.json(modules)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const classroom = await prisma.classrooms.findFirst({ where: { id: classroomId, teacher_id: session.user.id } })
  if (!classroom) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { title, description } = await req.json()
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })
  const maxIndex = await prisma.modules.aggregate({ where: { classroom_id: classroomId }, _max: { order_index: true } })
  const order_index = (maxIndex._max.order_index ?? 0) + 1
  const mod = await prisma.modules.create({ data: { classroom_id: classroomId, title, description, order_index } })
  return NextResponse.json(mod, { status: 201 })
}


