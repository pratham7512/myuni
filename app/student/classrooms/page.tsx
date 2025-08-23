import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function StudentClassroomsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/student")
  if (session.user.role !== "student") redirect("/")

  const memberships = await prisma.classroom_members.findMany({
    where: { user_id: session.user.id },
    include: { classroom: true },
    orderBy: { joined_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Classrooms</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {memberships.map((m) => (
          <Link key={m.id} href={`/student/classrooms/${m.classroom_id}`} className="block rounded-none border border-white/15 bg-card/40 p-4 hover:border-primary">
            <div className="text-lg font-medium">{m.classroom.name}</div>
            <div className="text-sm text-muted-foreground">Code: {m.classroom.classroom_code}</div>
          </Link>
        ))}
        {memberships.length === 0 && <p className="text-muted-foreground">You haven't joined any classrooms yet.</p>}
      </div>
    </div>
  )
}


