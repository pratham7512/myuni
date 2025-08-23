import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ClassroomDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/student")

  const classroom = await prisma.classrooms.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order_index: "asc" },
        include: { interview: true, module_map: { include: { problem: true }, orderBy: { order_index: "asc" } } },
      },
    },
  })
  if (!classroom) redirect("/student")

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

  return (
    <div className="font-mono mx-50 w-auto py-8 space-y-8">
      <div className="h-40 w-full overflow-hidden border border-white/15">
        <img src={`https://picsum.photos/seed/${encodeURIComponent(classroom.classroom_code)}/1600/400`} alt="Class banner" className="h-full w-full object-cover" />
      </div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{classroom.name}</h1>
          <p className="text-sm text-muted-foreground">Code: {classroom.classroom_code}</p>
        </div>
      </header>

      {classroom.modules.map((mod) => (
        <div key={mod.id} className="border border-white/15 bg-card/40 p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium">{mod.title}</h3>
            {mod.interview && (
              <Link href="/student/interview" className="text-xs border border-white/20 px-3 py-1 hover:bg-white/10">
                Open interview
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {mod.module_map.map((map) => (
              <Link
                key={map.id}
                href={`/student/problems/${map.problem_id}`}
                className="block text-sm hover:text-primary"
              >
                {map.problem.title}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {classroom.modules.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-white/15 bg-card/40">
          <img src="/empty-class.svg" alt="No modules" width={360} height={200} />
          <p className="mt-4 text-muted-foreground">No modules yet. Check back later or contact your teacher.</p>
          <p className="mt-2 text-muted-foreground italic">&quot;{getRandomQuote()}&quot;</p>
        </div>
      )}
    </div>
  )
}


