import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AddProblemDialog from "@/components/teacher/AddProblemDialog"
import CreateInterviewDialog from "@/components/teacher/CreateInterviewDialog"

export default async function ModuleDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth")
  const mod = await prisma.modules.findUnique({
    where: { id: params.id },
    include: { classroom: true, interview: true, module_map: { include: { problem: true }, orderBy: { order_index: "asc" } } },
  })
  if (!mod) redirect("/teacher")

  const submissionsByProblem = await prisma.code_submissions.groupBy({
    by: ["problem_id"],
    where: { problem_id: { in: mod.module_map.map(m => m.problem_id) }, verdict: "accepted" },
    _count: { _all: true },
  })
  const completedCounts = Object.fromEntries(submissionsByProblem.map(s => [s.problem_id, s._count._all]))

  return (
    <div className="font-mono mx-50 w-auto py-8">
      <h1 className="text-2xl font-semibold">{mod.title}</h1>
      <p className="text-sm text-muted-foreground">Classroom: {mod.classroom.name}</p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="border border-white/15 bg-card/40">
          <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <div>Interview</div>
            <CreateInterviewDialog moduleId={mod.id} initialDescription={mod.interview?.description ?? ""} />
          </div>
          <div className="p-4">
            {mod.interview ? (
              <p className="text-sm whitespace-pre-wrap">{mod.interview.description}</p>
            ) : (
              <p className="text-muted-foreground text-sm">No interview configured yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-white/15 bg-card/40">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div>Problems</div>
          <AddProblemDialog moduleId={mod.id} classroomId={mod.classroom_id} />
        </div>
        <div className="p-4 space-y-2">
          {mod.module_map.map(mm => (
            <div key={mm.id} className="flex items-center justify-between border border-white/10 p-3">
              <div>
                <div className="font-medium">{mm.problem.title}</div>
                <div className="text-xs text-muted-foreground">Problem ID: {mm.problem_id}</div>
              </div>
              <div className="text-xs text-muted-foreground">Completed: {completedCounts[mm.problem_id] ?? 0}</div>
            </div>
          ))}
          {mod.module_map.length === 0 && <p className="text-muted-foreground">No problems yet.</p>}
        </div>
      </div>
    </div>
  )
}


