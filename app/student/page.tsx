import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import JoinClassroomButton from "@/components/student/JoinClassroomButton"
import { DashboardShell, Section } from "@/components/layout/DashboardShell"

// Adding quotes array and function
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

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth")
  if (session.user.role !== "student") redirect("/")

  const memberships = await prisma.classroom_members.findMany({
    where: { user_id: session.user.id },
    include: { classroom: true },
    orderBy: { joined_at: "desc" },
  })

  const classroomIds = memberships.map(m => m.classroom_id)
  const problems = await prisma.problems.findMany({
    where: { classroom_id: { in: classroomIds } },
    include: { classroom: true, module_map: { include: { module: true } } },
    orderBy: { created_at: "desc" },
    take: 10,
  })

  return (
    <div className="font-mono">
      <DashboardShell>
      <div className="mb-8 p-6 rounded-none border border-white/15 bg-card/40">
        <div className="flex items-center gap-4">
          <img src="/globe.svg" alt="Welcome" className="h-12 w-12 opacity-50" />
          <div>
            <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
            <p className="mt-2 text-muted-foreground italic">&quot;{getRandomQuote()}&quot;</p>
          </div>
        </div>
      </div>

      <Section title="Classrooms">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberships.map((m) => {
            const seed = m.classroom.classroom_code || m.classroom_id
            const img = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/300`
            return (
              <Link key={m.id} href={`/student/classrooms/${m.classroom_id}`} className="rounded-none border border-white/15 bg-card/40 hover:border-primary">
                <div className="h-24 w-full overflow-hidden border-b border-white/10">
                  <img src={img} alt="Classroom banner" className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-base font-medium truncate">{m.classroom.name}</div>
                  <div className="text-xs text-muted-foreground">Code: {m.classroom.classroom_code}</div>
                </div>
              </Link>
            )
          })}
          {memberships.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-white/15 bg-card/40">
              <img src="/empty-class.svg" alt="No classrooms" width={360} height={200} />
              <p className="mt-4 text-muted-foreground">Welcome! Join a classroom using a code provided by your teacher.</p>
              <div className="mt-4"><JoinClassroomButton /></div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Pending assignments">
        <div className="grid grid-cols-1 gap-3">
          {problems.map((p) => {
            const firstMap = p.module_map[0]
            return (
              <div key={p.id} className="flex items-center justify-between border border-white/10 p-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {firstMap?.module?.title ? `Module: ${firstMap.module.title} • ` : ""}Classroom: {p.classroom.name}
                  </div>
                </div>
                <Link href={`/student/problems/${p.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-4">Open</Link>
              </div>
            )
          })}
          {problems.length === 0 && <p className="text-muted-foreground">No assignments yet.</p>}
        </div>
      </Section>

      <Section title="Learning Tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-white/15 bg-card/40">
            <h3 className="font-medium">Practice Daily</h3>
            <p className="text-sm text-muted-foreground">Consistency is key to mastering coding.</p>
          </div>
          <div className="p-4 border border-white/15 bg-card/40">
            <h3 className="font-medium">Ask for Help</h3>
            <p className="text-sm text-muted-foreground">Don&#39;t hesitate to discuss with teachers or peers.</p>
          </div>
          <div className="p-4 border border-white/15 bg-card/40">
            <h3 className="font-medium">Review Mistakes</h3>
            <p className="text-sm text-muted-foreground">Learn from errors to improve faster.</p>
          </div>
          <div className="p-4 border border-white/15 bg-card/40">
            <h3 className="font-medium">Stay Curious</h3>
            <p className="text-sm text-muted-foreground">Explore new concepts beyond assignments.</p>
          </div>
        </div>
      </Section>
      </DashboardShell>
    </div>
  )
}


