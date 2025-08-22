import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  role: z.enum(["student", "teacher", "university_admin"]).default("student"),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = SignupSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { email, password, name, role } = parsed.data

    // Single hardcoded admin rule
    const isAdmin = email === "prathameshdesai679@gmail.com"
    const adminRole = isAdmin ? "university_admin" : role

    const existing = await prisma.users.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.users.create({
      data: { email, name, role: adminRole as any, password_hash },
    })

    // For teachers, create pending access request if not admin
    if (adminRole === "teacher") {
      await prisma.teacher_access_requests.upsert({
        where: { user_id: user.id },
        create: { user_id: user.id },
        update: {},
      })
    }

    return NextResponse.json({ id: user.id, role: user.role }, { status: 201 })
  } catch (err: any) {
    console.error("/api/signup error:", err)
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 })
  }
}


