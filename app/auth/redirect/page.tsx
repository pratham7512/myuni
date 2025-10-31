import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function AfterLoginRedirect() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth")
  const role = session.user.role
  if (role === "university_admin") redirect("/admin")
  if (role === "teacher") redirect("/teacher")
  redirect("/student")
}


