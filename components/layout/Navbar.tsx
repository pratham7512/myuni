"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import JoinClassroomButton from "@/components/student/JoinClassroomButton"
import CreateClassroomButton from "@/components/teacher/CreateClassroomButton"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (pathname === "/") {
    return (
      <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <div className="mx-50 mt-4 pointer-events-auto">
          <div className="flex items-center justify-between border-1 border-white bg-card px-4 py-3 font-mono">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-semibold tracking-tight">MyUni</Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/auth" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-4 py-2">Sign in</Link>
              <Link href="/auth?mode=signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold border border-white/20 px-4 py-2 hover:border-white/40">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (pathname.startsWith("/auth")) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="mx-50 mt-4 pointer-events-auto">
        <div className="flex items-center justify-between border-1 border-white bg-card px-4 py-3 font-mono">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-semibold tracking-tight">MyUni</Link>
          </div>
          <div className="flex items-center gap-2">
            {session?.user?.role === "student" && <JoinClassroomButton />}
            {session?.user?.role === "teacher" && <CreateClassroomButton />}
            {session?.user && (() => {
              const role = session.user.role
              const dashboardPath = role === "teacher" ? "/teacher" : role === "student" ? "/student" : "/"
              const profilePath = role === "teacher" ? "/teacher/profile" : role === "student" ? "/student/profile" : "/"
              const onProfile = pathname.startsWith(profilePath)
              const href = onProfile ? dashboardPath : profilePath
              const label = onProfile ? "Home" : "Profile"
              return (
                <Link href={href} className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-4 py-2">
                  {label}
                </Link>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
