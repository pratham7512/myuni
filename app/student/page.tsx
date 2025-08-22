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
      <p className="text-muted-foreground mt-2">This is a placeholder page after sign in.</p>
    </div>
  )
}


