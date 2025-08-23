import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function ClassroomDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/student")

  const classroom = await prisma.classrooms.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order_index: "asc" },
        include: { module_map: { include: { problem: true }, orderBy: { order_index: "asc" } } },
      },
    },
  })
  if (!classroom) redirect("/student/classrooms")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{classroom.name}</h1>
        <p className="text-sm text-muted-foreground">Code: {classroom.classroom_code}</p>
      </div>

      {classroom.modules.map((mod) => (
        <div key={mod.id} className="rounded-none border border-white/15 bg-card/40">
          <div className="border-b border-white/10 bg-primary/10 px-4 py-3">
            <h2 className="text-lg font-medium">{mod.title}</h2>
          </div>
          <div className="p-4 space-y-2">
            {mod.module_map.length === 0 && (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            )}
            {mod.module_map.map((mm) => (
              <div key={mm.id} className="flex items-center justify-between border border-white/10 p-3">
                <div>
                  <div className="font-medium">{mm.problem.title}</div>
                  <div className="text-xs text-muted-foreground">Problem ID: {mm.problem_id}</div>
                </div>
                <a href="#" className="rounded-none bg-primary px-3 py-2 text-primary-foreground">Open Assignment</a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


