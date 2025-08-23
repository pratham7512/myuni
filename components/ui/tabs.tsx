"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({ defaultValue, value: controlled, onValueChange, className, children }:
  { defaultValue?: string; value?: string; onValueChange?: (v: string)=>void; className?: string; children: React.ReactNode }) {
  const isControlled = controlled !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<string>(defaultValue || "")
  const value = isControlled ? (controlled as string) : uncontrolled
  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v)
    onValueChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex border border-white/15", className)}>{children}</div>
  )
}

export function TabsTrigger({ value, className, children, onClick }:
  { value: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) return null
  const active = ctx.value === value
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-2 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground",
        className
      )}
      onClick={() => { ctx.setValue(value); onClick?.() }}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }:
  { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) return null
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}


