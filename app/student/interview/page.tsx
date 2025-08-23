"use client";
import { Room } from "livekit-client";
import React, { useContext } from "react";
import VoiceCallWidget from "@/components/student/VoiceCallWidget";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import TranscriptionView from "@/components/student/TranscriptionView";
import { RoomContext, VoiceAssistantControlBar, DisconnectButton } from "@livekit/components-react";
import { CloseIcon } from "@/components/student/CloseIcon";

export default function Page() {
  const router = useRouter();
  const room = useContext(RoomContext);
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interviewId") || undefined;

  if (!room) return null;

  return (
    <div className="relative font-mono">
      <div className="absolute top-10 left-10 z-20">
      </div>
      <div className="mx-50 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mt-6 min-h-[calc(100vh-250px)]">
          <div className="lg:col-span-2 h-full flex">
            <div className="w-full max-w-[820px] mr-2">
              <VoiceCallWidget room={room} interviewId={interviewId} className="w-full h-full" />
            </div>
          </div>
          <div className="h-full flex justify-center lg:justify-end">
            <div className="h-full">
              <TranscriptionView />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <Button
            className="rounded-none"
            onClick={() => router.push("/student/feedback")}
          >
            Submit
          </Button>
        </div>
      </div>
      {/* Bottom-centered control bar overlay */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
        <div className="mx-50 flex justify-center">
          <div className="pointer-events-auto bg-card text-white rounded-none border border-white/15 flex items-center gap-2 h-12">
            <VoiceAssistantControlBar controls={{ leave: false }} className="[&_*]:text-white [&_button]:text-white [&_svg]:text-white" />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </div>
        </div>
      </div>
    </div>
  );
}