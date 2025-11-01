import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/LogoutButton"

export default async function TeacherProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth")
  const user = await prisma.users.findUnique({ where: { id: session.user.id } })
  const classrooms = await prisma.classrooms.findMany({ 
    where: { teacher_id: session.user.id }, 
    orderBy: { created_at: "desc" }, 
    take: 10 
  })
  const modules = await prisma.modules.findMany({ 
    where: { classroom: { teacher_id: session.user.id } }, 
    orderBy: { created_at: "desc" }, 
    take: 10 
  })

  const quotes = [
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "A good teacher can inspire hope, ignite the imagination, and instill a love of learning. - Brad Henry",
    "Teaching is the one profession that creates all other professions. - Unknown",
    "The best teachers teach from the heart, not from the book. - Unknown",
    "Education is not the filling of a pail, but the lighting of a fire. - William Butler Yeats"
  ];

  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function getInitials(nameOrEmail?: string | null) {
    const source = (nameOrEmail || "").trim()
    if (!source) return "T"
    const parts = source.includes(" ") ? source.split(" ") : source.split("@")[0].split(".")
    const letters = parts.filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase())
    return letters.join("") || "T"
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
              <div className="text-sm text-muted-foreground">{user?.email} • Teacher</div>
            </div>
          </div>
          <div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-none border border-white/15 bg-card/40 p-6">
          <h2 className="text-lg font-medium mb-4">Recent Classrooms</h2>
          <div className="space-y-3">
            {classrooms.map(c => (
              <div key={c.id} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                <div>{c.name}</div>
                <div className="text-muted-foreground">Code: {c.classroom_code}</div>
              </div>
            ))}
            {classrooms.length === 0 && <p className="text-sm text-muted-foreground">No classrooms yet.</p>}
          </div>
        </div>

        <div className="rounded-none border border-white/15 bg-card/40 p-6">
          <h2 className="text-lg font-medium mb-4">Recent Modules</h2>
          <div className="space-y-3">
            {modules.map(m => (
              <div key={m.id} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                <div>{m.title}</div>
                <div className="text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            ))}
            {modules.length === 0 && <p className="text-sm text-muted-foreground">No modules yet.</p>}
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
