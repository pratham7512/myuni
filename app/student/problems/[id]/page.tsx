import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { EditorClient } from "./EditorClient"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth")
  }
  if (session.user.role !== "student") {
    redirect("/auth")
  }

  const { id } = await params

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <Suspense>
        <EditorClient problemId={id} />
      </Suspense>
    </div>
  )
}