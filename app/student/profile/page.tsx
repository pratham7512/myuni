import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/LogoutButton"

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/student")
  const user = await prisma.users.findUnique({ where: { id: session.user.id } })
  const submissions = await prisma.code_submissions.findMany({ 
    where: { user_id: session.user.id }, 
    orderBy: { submitted_at: "desc" }, 
    take: 10,
    include: { problem: { select: { title: true } } }
  })
  const interviews = await prisma.interview_sessions.findMany({ 
    where: { user_id: session.user.id }, 
    orderBy: { started_at: "desc" }, 
    take: 5,
  })

  const quotes = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "Learning is a treasure that will follow its owner everywhere. - Chinese Proverb",
    "The beautiful thing about learning is that nobody can take it away from you. - B.B. King",
    "Study hard, for the well is deep, and our brains are shallow. - Richard Baxter",
    "Learning never exhausts the mind. - Leonardo da Vinci"
  ];

  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function getInitials(nameOrEmail?: string | null) {
    const source = (nameOrEmail || "").trim()
    if (!source) return "U"
    const parts = source.includes(" ") ? source.split(" ") : source.split("@")[0].split(".")
    const letters = parts.filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase())
    return letters.join("") || "U"
  }

  return (
    <div className="font-mono mx-50 w-auto py-8 space-y-8">
      <div className="rounded-none border border-white/15 bg-card/40 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-600 text-white grid place-items-center text-3xl font-semibold">
              {getInitials(user?.name || user?.email)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{user?.name || "Unnamed"}</h1>
              <div className="text-sm text-muted-foreground">{user?.email} • Student</div>
            </div>
          </div>
          <div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-none border border-white/15 bg-card/40 p-6">
          <h2 className="text-lg font-medium mb-4">Recent Code Submissions</h2>
          <div className="space-y-3">
            {submissions.map(s => (
              <div key={s.id} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                <div>{s.problem?.title || s.problem_id}</div>
                <div className="text-muted-foreground">{s.language} • {s.verdict}</div>
              </div>
            ))}
            {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
          </div>
        </div>

        <div className="rounded-none border border-white/15 bg-card/40 p-6">
          <h2 className="text-lg font-medium mb-4">Recent Interviews</h2>
          <div className="space-y-3">
            {interviews.map(i => (
              <div key={i.id} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                <div>Session • {new Date(i.started_at).toLocaleString()}</div>
                <div className="text-muted-foreground">{i.status}</div>
              </div>
            ))}
            {interviews.length === 0 && <p className="text-sm text-muted-foreground">No interviews yet.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-none border border-white/15 bg-card/40 p-6">
        <h2 className="text-lg font-medium mb-4">Motivational Quote</h2>
        <p className="text-muted-foreground italic">&quot;{getRandomQuote()}&quot;</p>
      </div>
    </div>
  )
}
