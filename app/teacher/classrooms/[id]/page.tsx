import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import CreateModuleDialog from "@/components/teacher/CreateModuleDialog"
import Image from "next/image"

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
    <div className="font-mono mx-50 w-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage: {classroom.name}</h1>
        <div className="text-sm text-muted-foreground">Code: {classroom.classroom_code}</div>
      </div>
      <div className="flex items-center justify-end">
        <CreateModuleDialog classroomId={params.id} />
      </div>

      <div className="space-y-2">
        {modules.map((m) => (
          <div key={m.id} className="flex items-center justify-between border border-white/15 bg-card/40 p-3">
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-muted-foreground">Order: {m.order_index ?? "-"}</div>
            </div>
            <div className="flex items-center gap-2">
              <a href={`/teacher/modules/${m.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold border border-white/15 px-3 h-10 hover:border-white/40">Open</a>
              <form action={async () => { "use server"; await prisma.modules.delete({ where: { id: m.id } }) }}>
                <Button className="bg-red-600 hover:brightness-110" type="submit">Delete</Button>
              </form>
            </div>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Image src="/empty-class.svg" alt="Empty" width={320} height={200} />
            <p className="mt-4 text-muted-foreground">No assignments yet. Create your first assignment to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}


