import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "university_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const requests = await prisma.teacher_access_requests.findMany({
    where: { status: "pending" },
    include: { user: true },
    orderBy: { id: "asc" },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "university_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { userId, action } = await req.json()
  if (!userId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const status = action === "approve" ? "approved" : "rejected"
  const updated = await prisma.teacher_access_requests.update({
    where: { user_id: userId },
    data: { status: status as any },
  })
  return NextResponse.json(updated)
}


