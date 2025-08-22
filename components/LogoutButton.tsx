"use client"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button className="rounded-none" onClick={() => signOut({ callbackUrl: "/" })}>
      Log out
    </Button>
  )
}


