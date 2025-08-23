import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const classrooms = await prisma.classroom_members.findMany({
      where: { user_id: session.user.id },
      include: { classroom: { include: { teacher: true } } },
      orderBy: { joined_at: "desc" },
    })

    // Pending assignments: problems in joined classrooms (simple placeholder filter)
    const classroomIds = classrooms.map((m) => m.classroom_id)
    const problems = await prisma.problems.findMany({
      where: { classroom_id: { in: classroomIds } },
      include: { classroom: true, author: true, module_map: { include: { module: true } } },
      orderBy: { created_at: "desc" },
      take: 20,
    })

    return NextResponse.json({ classrooms, problems })
  } catch (e) {
    console.error("GET /api/student/dashboard", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


