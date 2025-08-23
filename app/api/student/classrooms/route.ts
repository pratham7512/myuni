import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const memberships = await prisma.classroom_members.findMany({
      where: { user_id: session.user.id },
      include: { classroom: true },
      orderBy: { joined_at: "desc" },
    })
    return NextResponse.json(memberships)
  } catch (e) {
    console.error("GET /api/student/classrooms", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


