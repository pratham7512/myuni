import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { title, description, order_index } = await req.json()
  const mod = await prisma.modules.update({ where: { id: params.moduleId }, data: { title, description, order_index } })
  return NextResponse.json(mod)
}

export async function DELETE(_req: NextRequest, { params }: { params: { moduleId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.modules.delete({ where: { id: params.moduleId } })
  return NextResponse.json({ ok: true })
}


