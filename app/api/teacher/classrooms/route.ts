import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const req = await prisma.teacher_access_requests.findUnique({ where: { user_id: session.user.id } })
    if (!req || req.status !== "approved") return NextResponse.json({ error: "Teacher access not approved" }, { status: 403 })
    const classrooms = await prisma.classrooms.findMany({ where: { teacher_id: session.user.id }, orderBy: { created_at: "desc" } })
    return NextResponse.json(classrooms)
  } catch (e: any) {
    console.error("GET /api/teacher/classrooms", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const reqStatus = await prisma.teacher_access_requests.findUnique({ where: { user_id: session.user.id } })
    if (!reqStatus || reqStatus.status !== "approved") return NextResponse.json({ error: "Teacher access not approved" }, { status: 403 })
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
    const classroom = await prisma.classrooms.create({ data: { name, teacher_id: session.user.id, classroom_code: Math.random().toString(36).slice(2, 8).toUpperCase() } })
    return NextResponse.json(classroom, { status: 201 })
  } catch (e: any) {
    console.error("POST /api/teacher/classrooms", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


