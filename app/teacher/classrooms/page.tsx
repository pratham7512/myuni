import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function TeacherClassroomsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/teacher")
  if (session.user.role !== "teacher") redirect("/")

  const classrooms = await prisma.classrooms.findMany({ where: { teacher_id: session.user.id }, orderBy: { created_at: "desc" } })

  async function createClassroom(formData: FormData) {
    "use server"
    const sessionInner = await getServerSession(authOptions)
    if (!sessionInner || sessionInner.user.role !== "teacher") return
    const name = (formData.get("name") as string) || ""
    if (!name) return
    await prisma.classrooms.create({ data: { name, teacher_id: sessionInner.user.id, classroom_code: Math.random().toString(36).slice(2, 8).toUpperCase() } })
  }

  return (
    <div className="font-mono mx-50 w-auto space-y-6">
      <h1 className="text-2xl font-semibold">Your Classrooms</h1>
      <form action={createClassroom} className="flex gap-2">
        <input className="w-64 rounded-none border border-white/15 bg-transparent px-3 py-2 text-sm" placeholder="New classroom name" name="name" />
        <Button type="submit">Create</Button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {classrooms.map((c) => (
          <div key={c.id} className="rounded-none border border-white/15 bg-card/40 p-4">
            <div className="text-lg font-medium">{c.name}</div>
            <div className="text-sm text-muted-foreground">Code: {c.classroom_code}</div>
          </div>
        ))}
        {classrooms.length === 0 && <p className="text-muted-foreground">No classrooms yet.</p>}
      </div>
    </div>
  )
}


