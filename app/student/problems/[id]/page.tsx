import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardShell, Section } from "@/components/layout/DashboardShell"

export default async function ProblemEditorPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth")
  if (session.user.role !== "student") redirect("/")

  const problem = await prisma.problems.findUnique({ where: { id: params.id }, include: { classroom: true } })
  if (!problem) redirect("/student")

  const submissions = await prisma.code_submissions.findMany({
    where: { user_id: session.user.id, problem_id: params.id },
    orderBy: { submitted_at: "desc" },
    take: 5,
  });

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
    <DashboardShell title={problem.title}>
      <p className="text-sm text-muted-foreground mb-6">Classroom: {problem.classroom.name}</p>
      <div className="space-y-6">
        <article className="rounded-none border border-white/15 bg-card/40 p-6 prose prose-invert max-w-none">
          {problem.statement_md}
        </article>
        <div className="rounded-none border border-white/15 bg-card/40 p-6">
          <div className="text-sm text-muted-foreground mb-2">Code Editor</div>
          <textarea className="w-full h-96 bg-black text-white border border-white/15 p-4 font-mono text-sm" placeholder="Write your solution here..." />
          <div className="mt-4 flex gap-3 justify-end">
            <button className="rounded-none border border-white/15 px-4 py-2">Run</button>
            <button className="rounded-none bg-primary px-4 py-2 text-primary-foreground">Submit</button>
          </div>
        </div>
        <Section title="Recent Submissions">
          <div className="space-y-3">
            {submissions.map(s => (
              <div key={s.id} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                <div>{new Date(s.submitted_at).toLocaleString()}</div>
                <div className="text-muted-foreground">{s.language} • {s.verdict}</div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div>
                <p className="text-sm text-muted-foreground">No submissions yet. Give it a try!</p>
                <p className="mt-4 text-muted-foreground italic">&quot;{getRandomQuote()}&quot;</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </DashboardShell>
  )
}


