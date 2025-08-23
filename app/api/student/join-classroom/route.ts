import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { classroomCode } = await req.json()
    if (!classroomCode || typeof classroomCode !== "string") return NextResponse.json({ error: "Invalid code" }, { status: 400 })

    const classroom = await prisma.classrooms.findUnique({ where: { classroom_code: classroomCode.trim().toUpperCase() } })
    if (!classroom) return NextResponse.json({ error: "Classroom not found" }, { status: 404 })

    await prisma.classroom_members.upsert({
      where: { classroom_id_user_id: { classroom_id: classroom.id, user_id: session.user.id } },
      create: { classroom_id: classroom.id, user_id: session.user.id },
      update: {},
    })

    return NextResponse.json({ ok: true, classroomId: classroom.id })
  } catch (e: any) {
    console.error("POST /api/student/join-classroom", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


