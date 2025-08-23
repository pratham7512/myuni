"use client";
import { NoAgentNotification } from "./NoAgentNotification";

import { RoomAudioRenderer, useVoiceAssistant } from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect } from "react";
import type { ConnectionDetails } from "@/app/api/student/connection-details/route";
import React from "react";
import VoiceCallTimer from "./VoiceCallTimer";

const CONNECTION_TIMEOUT_MS = 300 * 60 * 1000; // 30 minutes timeout

export default function VoiceCallWidget({ room, interviewId, className = "", style = {} }: { room: Room; interviewId?: string; className?: string; style?: React.CSSProperties }) {
  const [isReconnecting, setIsReconnecting] = React.useState(false);

  const onConnectButtonClicked = useCallback(async () => {
    try {
      let connectionDetailsData: ConnectionDetails;
      const storedDetails = localStorage.getItem('voiceCallConnectionDetails');
      
      if (storedDetails) {
        const { details, timestamp } = JSON.parse(storedDetails);
        const isExpired = Date.now() - timestamp > CONNECTION_TIMEOUT_MS;
        
        if (!isExpired) {
          connectionDetailsData = details;
        } else {
          // Clear expired details
          localStorage.removeItem('voiceCallConnectionDetails');
          throw new Error('Connection details expired');
        }
      } else {
        const url = new URL(
          process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/student/connection-details",
          window.location.origin
        );
        
        const response = await fetch(url.toString());
        connectionDetailsData = await response.json();
        
        // Store the new connection details with timestamp
        localStorage.setItem('voiceCallConnectionDetails', JSON.stringify({
          details: connectionDetailsData,
          timestamp: Date.now()
        }));
      }

      await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);

      // Fetch interview details from DB and set as participant attributes
      if (interviewId) {
        try {
          const apiUrl = new URL(`/api/student/interviews/${interviewId}`, window.location.origin);
          const resp = await fetch(apiUrl.toString(), { cache: 'no-store' });
          if (resp.ok) {
            const data: { id: string; module_id: string; title: string; description: string } = await resp.json();
            room.localParticipant.setAttributes({
              interviewId: data.id,
              moduleId: data.module_id,
              interviewTitle: data.title,
              interviewDescription: data.description,
            });
          }
        } catch (e) {
          console.error('Failed to fetch interview details', e);
        }
      }
      
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsReconnecting(false);
      
      // No localStorage usage for interview info anymore
    } catch (error) {
      console.error('Connection error:', error);
      // Clear stored details if there's an error
      localStorage.removeItem('voiceCallConnectionDetails');
      throw error;
    }
  }, [room, interviewId]);

  // Add reconnection logic on page load
  useEffect(() => {
    const storedDetails = localStorage.getItem('voiceCallConnectionDetails');
    if (storedDetails) {
      const { timestamp } = JSON.parse(storedDetails);
      const isExpired = Date.now() - timestamp > CONNECTION_TIMEOUT_MS;
      
      if (!isExpired) {
        setIsReconnecting(true);
        onConnectButtonClicked().catch(() => {
          setIsReconnecting(false);
        });
      } else {
        localStorage.removeItem('voiceCallConnectionDetails');
      }
    }
  }, [onConnectButtonClicked]);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);
    room.on(RoomEvent.Disconnected, () => {
      // Clear stored details on disconnect
      //localStorage.removeItem('voiceCallConnectionDetails');
    });

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
      room.off(RoomEvent.Disconnected, () => {
        //localStorage.removeItem('voiceCallConnectionDetails');
      });
    };
  }, [room]);

  const handleManualDisconnect = () => {
    room.disconnect();
    localStorage.removeItem('voiceCallConnectionDetails');
  };

  return (
    <div className={`w-full ${className}`} style={style}>
      
      <div className="rounded-none border border-white/15 bg-card/40 p-4 h-full relative">
      
        <div className="lk-room-container w-full h-full">
          <VoiceCallTimer redirectTo="/student/feedback" durationMinutes={100} />
          <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} onManualDisconnect={handleManualDisconnect} />
        </div>
        <div className="absolute bottom-2 right-3 z-10 text-lg text-white/60 font-mono select-none">
          soham parekh
        </div>
      </div>
    </div>
  );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void, onManualDisconnect: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  // Automatically connect on mount if disconnected
  useEffect(() => {
    if (agentState === "disconnected") {
      props.onConnectButtonClicked();
    }
    // Only run when agentState changes
  }, [agentState, props]);

  return (
    <>
      <AnimatePresence mode="wait">
        {agentState !== "disconnected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex flex-col items-center justify-center gap-4 h-full"
          >
            <AgentVisualizer />
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AgentVisualizer() {
  const { state: agentState } = useVoiceAssistant();
  const isSpeaking = agentState === "speaking";
  const [isBlinking, setIsBlinking] = React.useState(false);

  React.useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    let unblinkTimeout: ReturnType<typeof setTimeout> | null = null;

    function scheduleBlink() {
      const nextIn = 120 + Math.random() * 280; // fast, irregular
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        unblinkTimeout = setTimeout(() => {
          setIsBlinking(false);
          if (isSpeaking) scheduleBlink();
        }, 60); // short, snappy off interval
      }, nextIn);
    }

    if (isSpeaking) {
      scheduleBlink();
    } else {
      setIsBlinking(false);
    }

    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      if (unblinkTimeout) clearTimeout(unblinkTimeout);
    };
  }, [isSpeaking]);
  const baseFill = isSpeaking ? "#ffffff" : "#2a2a2a";
  const accentFill = "#60a5fa"; // tailwind blue-400
  const fillColor = isSpeaking ? (isBlinking ? accentFill : baseFill) : baseFill;

  return (
    <div className="h-[260px] w-full grid place-items-center">
      <div>
        <svg
          width="300"
          height="250"
          viewBox="0 0 24 24"
          fill="none"
          className={isSpeaking ? "" : "opacity-80 mb-30"}
          style={{
            filter: isSpeaking ? "drop-shadow(0 0 12px rgba(37,99,235,0.45))" : undefined,
          }}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Incognito assistant"
        >
          <g fillRule="evenodd" clipRule="evenodd">
            <path
              d="M17.5,11.75 C20.1233526,11.75 22.25,13.8766474 22.25,16.5 C22.25,19.1233526 20.1233526,21.25 17.5,21.25 C15.4019872,21.25 13.6216629,19.8898135 12.9927596,18.0031729 L11.0072404,18.0031729 C10.3783371,19.8898135 8.59801283,21.25 6.5,21.25 C3.87664744,21.25 1.75,19.1233526 1.75,16.5 C1.75,13.8766474 3.87664744,11.75 6.5,11.75 C8.9545808,11.75 10.9743111,13.6118164 11.224028,16.0002862 L12.775972,16.0002862 C13.0256889,13.6118164 15.0454192,11.75 17.5,11.75 Z M6.5,13.75 C4.98121694,13.75 3.75,14.9812169 3.75,16.5 C3.75,18.0187831 4.98121694,19.25 6.5,19.25 C8.01878306,19.25 9.25,18.0187831 9.25,16.5 C9.25,14.9812169 8.01878306,13.75 6.5,13.75 Z M17.5,13.75 C15.9812169,13.75 14.75,14.9812169 14.75,16.5 C14.75,18.0187831 15.9812169,19.25 17.5,19.25 C19.0187831,19.25 20.25,18.0187831 20.25,16.5 C20.25,14.9812169 19.0187831,13.75 17.5,13.75 Z M15.5119387,3 C16.7263613,3 17.7969992,3.79658742 18.145961,4.95979331 L19.1520701,8.31093387 C19.944619,8.44284508 20.7202794,8.59805108 21.4790393,8.77658283 C22.0166428,8.90307776 22.3499121,9.44143588 22.2234172,9.9790393 C22.0969222,10.5166428 21.5585641,10.8499121 21.0209607,10.7234172 C18.2654221,10.0750551 15.258662,9.75 12,9.75 C8.74133802,9.75 5.73457794,10.0750551 2.97903933,10.7234172 C2.44143588,10.8499121 1.90307776,10.5166428 1.77658283,9.9790393 C1.6500879,9.44143588 1.98335721,8.90307776 2.52096067,8.77658283 C3.27940206,8.59812603 4.05472975,8.4429754 4.8469317,8.31110002 L5.85403902,4.95979331 C6.20300079,3.79658742 7.2736387,3 8.4880613,3 L15.5119387,3 Z"
              fill={fillColor}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

// Control bar moved to page-level overlay for unified placement

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}