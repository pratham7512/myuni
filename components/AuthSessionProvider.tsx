"use client"
import React from "react"
import { RoomContext } from "@livekit/components-react"
import { SessionProvider } from "next-auth/react"
import { Room } from 'livekit-client';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [room] = React.useState(() => new Room());
  return (
    <SessionProvider>
      <RoomContext.Provider value={room}>
        {children}
      </RoomContext.Provider>
    </SessionProvider>
  )
}


