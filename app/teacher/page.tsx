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

  const req = await prisma.teacher_access_requests.findUnique({ where: { user_id: session.user.id } })
  const status = req?.status ?? "pending"

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Teacher Portal</h1>
        <LogoutButton />
      </div>
      {status === "approved" ? (
        <p>Your teacher access is approved.</p>
      ) : status === "rejected" ? (
        <p>Your teacher access request was rejected. Contact admin.</p>
      ) : (
        <p>Your teacher access request is pending approval.</p>
      )}
    </div>
  )
}


