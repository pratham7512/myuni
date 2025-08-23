import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ interviewId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { interviewId } = await params
    const interview = await prisma.interviews.findUnique({
      where: { id: interviewId },
      include: { module: { select: { id: true, title: true, classroom_id: true } } },
    })
    if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const member = await prisma.classroom_members.findFirst({
      where: { classroom_id: interview.module.classroom_id, user_id: session.user.id },
    })
    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json({
      id: interview.id,
      module_id: interview.module.id,
      title: interview.module.title,
      description: interview.description,
    })
  } catch (e) {
    console.error("GET /api/student/interviews/[interviewId]", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}



