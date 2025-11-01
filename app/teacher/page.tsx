import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CreateClassroomButton from "@/components/teacher/CreateClassroomButton"
import { DashboardShell, Section } from "@/components/layout/DashboardShell"
import Image from "next/image"
import Link from "next/link"

export default async function TeacherHome() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth")

  if (session.user.role === "university_admin") redirect("/admin")

  if (session.user.role !== "teacher") {
    redirect("/")
  }

  const req = await prisma.teacher_access_requests.upsert({
    where: { user_id: session.user.id },
    create: { user_id: session.user.id },
    update: {},
  })
  // const status = req.status
  const status = "approved"; //hardcoded for now

  return (
    <div className="font-mono">
    <DashboardShell>
      <div className="mb-8 p-6 rounded-none border border-white/15 bg-card/40">
        <div className="flex items-center gap-4">
          <img src="/globe.svg" alt="Welcome" className="h-12 w-12 opacity-50" />
          <div>
            <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
            <p className="mt-2 text-muted-foreground italic">Manage your classrooms and assignments below.</p>
          </div>
        </div>
      </div>
      {status === "approved" ? (
        <div className="space-y-4">
          <p>Your teacher access is approved.</p>
          <Link href="/teacher/classrooms" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-4 py-2">Manage Classrooms</Link>
          <Section title="Your classrooms">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(await prisma.classrooms.findMany({ where: { teacher_id: session.user.id }, orderBy: { created_at: "desc" } })).map(c => (
                <Link key={c.id} href={`/teacher/classrooms/${c.id}`} className="rounded-none border border-white/15 bg-card/40 hover:border-primary">
                  <div className="h-24 w-full overflow-hidden border-b border-white/10">
                    <img src={`https://picsum.photos/seed/${encodeURIComponent(c.classroom_code)}/1200/300`} alt="Classroom banner" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Code: {c.classroom_code}</div>
                  </div>
                </Link>
              ))}
              {(await prisma.classrooms.count({ where: { teacher_id: session.user.id } })) === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-white/15 bg-card/40">
                  <Image src="/empty-class.svg" alt="No classrooms" width={360} height={200} />
                  <p className="mt-4 text-muted-foreground">Welcome! Create your first classroom to begin.</p>
                  <div className="mt-4"><CreateClassroomButton /></div>
                </div>
              )}
            </div>
          </Section>
        </div>
      ) : status === "rejected" ? (
        <form action={async () => { "use server"; await prisma.teacher_access_requests.update({ where: { user_id: session.user.id }, data: { status: "pending" } }) }}>
          <p className="mb-4">Your teacher access request was rejected. You can resubmit a request.</p>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-4 py-2" type="submit">Resubmit Request</button>
        </form>
      ) : (
        <form action={async () => { "use server"; await prisma.teacher_access_requests.delete({ where: { user_id: session.user.id } }) }}>
          <p className="mb-4">Your teacher access request is pending approval.</p>
          <button className="rounded-none bg-red-600 px-3 py-2 text-white font-semibold" type="submit">Cancel Request</button>
        </form>
      )}
    </DashboardShell>
    </div>
  )
}


