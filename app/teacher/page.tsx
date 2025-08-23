import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/LogoutButton"

export default async function TeacherHome() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/teacher")

  if (session.user.role === "university_admin") redirect("/admin")

  if (session.user.role !== "teacher") {
    redirect("/")
  }

  const req = await prisma.teacher_access_requests.upsert({
    where: { user_id: session.user.id },
    create: { user_id: session.user.id },
    update: {},
  })
  const status = req.status

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Teacher Portal</h1>
        <LogoutButton />
      </div>
      {status === "approved" ? (
        <div className="space-y-4">
          <p>Your teacher access is approved.</p>
          <a href="/teacher/classrooms" className="rounded-none bg-primary px-3 py-2 text-primary-foreground">Manage Classrooms</a>
        </div>
      ) : status === "rejected" ? (
        <form action={async () => { "use server"; await prisma.teacher_access_requests.update({ where: { user_id: session.user.id }, data: { status: "pending" } }) }}>
          <p className="mb-4">Your teacher access request was rejected. You can resubmit a request.</p>
          <button className="rounded-none bg-primary px-3 py-2 text-primary-foreground" type="submit">Resubmit Request</button>
        </form>
      ) : (
        <form action={async () => { "use server"; await prisma.teacher_access_requests.delete({ where: { user_id: session.user.id } }) }}>
          <p className="mb-4">Your teacher access request is pending approval.</p>
          <button className="rounded-none bg-red-600 px-3 py-2 text-white" type="submit">Cancel Request</button>
        </form>
      )}
    </div>
  )
}


