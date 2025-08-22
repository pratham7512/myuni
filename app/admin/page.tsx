import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { LogoutButton } from "@/components/LogoutButton"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "university_admin") {
    redirect("/auth/admin")
  }

  const requests = await prisma.teacher_access_requests.findMany({
    where: { status: "pending" },
    include: { user: true },
    orderBy: { id: "asc" },
  })

  async function updateRequest(formData: FormData) {
    "use server"
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "university_admin") return
    const action = (formData.get("action") as string | null) ?? undefined
    const userId = (formData.get("userId") as string | null) ?? undefined
    if (!userId || !action || !["approve", "reject"].includes(action)) return
    const status = action === "approve" ? "approved" : "rejected"
    await prisma.teacher_access_requests.update({
      where: { user_id: userId },
      data: { status: status as any },
    })
    revalidatePath("/admin")
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pending Teacher Access Requests</h1>
        <LogoutButton />
      </div>
      <div className="space-y-4">
        {requests.length === 0 && <p>No pending requests</p>}
        {requests.map((r: any)=> (
          <form key={r.id} action={updateRequest} className="flex items-center justify-between border p-4 rounded">
            <div>
              <div className="font-medium">{r.user.email}</div>
              <div className="text-sm text-muted-foreground">User ID: {r.user_id}</div>
            </div>
            <div className="flex gap-2">
              <input type="hidden" name="userId" value={r.user_id} />
              <button className="px-3 py-1 rounded bg-green-600 text-white" name="action" value="approve">Approve</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" name="action" value="reject">Reject</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  )
}


