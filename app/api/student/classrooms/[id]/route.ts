import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const member = await prisma.classroom_members.findFirst({ where: { classroom_id: params.id, user_id: session.user.id } })
    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const classroom = await prisma.classrooms.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { order_index: "asc" },
          include: { module_map: { include: { problem: true }, orderBy: { order_index: "asc" } } },
        },
      },
    })
    if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(classroom)
  } catch (e: any) {
    console.error("GET /api/student/classrooms/[id]", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


