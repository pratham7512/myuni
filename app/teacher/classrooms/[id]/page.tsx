import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function TeacherClassroomManage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/teacher")

  const classroom = await prisma.classrooms.findUnique({ where: { id: params.id } })
  if (!classroom || classroom.teacher_id !== session.user.id) redirect("/teacher/classrooms")

  const modules = await prisma.modules.findMany({ where: { classroom_id: params.id }, orderBy: { order_index: "asc" } })

  async function addModule(formData: FormData) {
    "use server"
    const title = (formData.get("title") as string) || ""
    const description = (formData.get("description") as string) || undefined
    if (!title) return
    const maxIndex = await prisma.modules.aggregate({ where: { classroom_id: params.id }, _max: { order_index: true } })
    const order_index = (maxIndex._max.order_index ?? 0) + 1
    await prisma.modules.create({ data: { classroom_id: params.id, title, description, order_index } })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage: {classroom.name}</h1>
      <form action={addModule} className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input name="title" placeholder="Module title" className="rounded-none border border-white/15 bg-transparent px-3 py-2 text-sm" />
        <input name="description" placeholder="Description (optional)" className="rounded-none border border-white/15 bg-transparent px-3 py-2 text-sm" />
        <Button type="submit">Add Module</Button>
      </form>

      <div className="space-y-2">
        {modules.map((m) => (
          <div key={m.id} className="flex items-center justify-between border border-white/15 bg-card/40 p-3">
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-muted-foreground">Order: {m.order_index ?? "-"}</div>
            </div>
            <form action={async () => { "use server"; await prisma.modules.delete({ where: { id: m.id } }) }}>
              <Button className="bg-red-600 hover:brightness-110" type="submit">Delete</Button>
            </form>
          </div>
        ))}
        {modules.length === 0 && <p className="text-muted-foreground">No modules yet.</p>}
      </div>
    </div>
  )
}


