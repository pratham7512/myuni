import * as React from "react"
import { cn } from "@/lib/utils"

export function DashboardShell({ title, actions, children }: { title?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="font-mono mx-50 w-auto py-8">
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title ? <h1 className="text-2xl font-semibold tracking-tight">{title}</h1> : <div />}
          {actions}
        </div>
      )}
      <div className={cn("mt-6")}>{children}</div>
    </div>
  )
}

export function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mt-8", className)}>
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      {children}
    </section>
  )
}


