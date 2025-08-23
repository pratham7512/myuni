import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function StudentPublicPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/student")
  const user = await prisma.users.findUnique({ where: { id: session.user.id } })
  const submissions = await prisma.code_submissions.findMany({ where: { user_id: session.user.id }, orderBy: { submitted_at: "desc" }, take: 10 })
  const interviews = await prisma.interview_sessions.findMany({ where: { user_id: session.user.id }, orderBy: { started_at: "desc" }, take: 5 })

  return (
    <div className="space-y-8">
      <div className="rounded-none border border-white/15 bg-card/40 p-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <div className="mt-2 text-sm text-muted-foreground">{user?.name || "Unnamed"} • {user?.email} • {user?.role}</div>
      </div>

      <div className="rounded-none border border-white/15 bg-card/40 p-4">
        <h2 className="text-lg font-medium">Recent Code Submissions</h2>
        <div className="mt-3 space-y-2">
          {submissions.map(s => (
            <div key={s.id} className="flex items-center justify-between border border-white/10 p-2 text-sm">
              <div>{s.problem_id}</div>
              <div className="text-muted-foreground">{s.language} • {s.verdict}</div>
            </div>
          ))}
          {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
        </div>
      </div>

      <div className="rounded-none border border-white/15 bg-card/40 p-4">
        <h2 className="text-lg font-medium">Interview Sessions</h2>
        <div className="mt-3 space-y-2">
          {interviews.map(i => (
            <div key={i.id} className="flex items-center justify-between border border-white/10 p-2 text-sm">
              <div>{i.module_id}</div>
              <div className="text-muted-foreground">{i.status}</div>
            </div>
          ))}
          {interviews.length === 0 && <p className="text-sm text-muted-foreground">No interview sessions yet.</p>}
        </div>
      </div>
    </div>
  )
}


