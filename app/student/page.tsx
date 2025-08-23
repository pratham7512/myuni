import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/LogoutButton"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/student")
  if (session.user.role !== "student") redirect("/")
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="text-muted-foreground mt-2">Overview cards and charts are placeholders.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-none border border-white/15 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Assignments</div>
          <div className="mt-1 text-2xl font-bold">--</div>
        </div>
        <div className="rounded-none border border-white/15 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="mt-1 text-2xl font-bold">--</div>
        </div>
        <div className="rounded-none border border-white/15 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Interview Readiness</div>
          <div className="mt-1 text-2xl font-bold">--</div>
        </div>
      </div>
    </div>
  )
}


