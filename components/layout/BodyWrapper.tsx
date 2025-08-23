"use client"

import { usePathname } from "next/navigation"

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const needsTopPad = pathname === "/" || pathname.startsWith("/student") || pathname.startsWith("/teacher")
  return <div className={needsTopPad ? "pt-24" : ""}>{children}</div>
}
