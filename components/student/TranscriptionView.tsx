import useCombinedTranscriptions from "@/hooks/useCombinedTranscriptions";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TranscriptionView() {
  const combinedTranscriptions = useCombinedTranscriptions();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // scroll to bottom when new transcription is added
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [combinedTranscriptions]);

  return (
    <Card className="rounded-none border-white/15 bg-card/40 w-[360px] max-w-[90vw] h-[calc(100vh-220px)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          Live Transcription
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 h-[calc(100%-56px)]">
        <div ref={containerRef} className="h-full flex flex-col gap-2 overflow-y-auto px-1 py-2 text-sm hide-scrollbar">
          {combinedTranscriptions.map((segment) => (
            <div
              id={segment.id}
              key={segment.id}
              className={
                segment.role === "assistant"
                  ? "p-2 self-start text-blue-400"
                  : "p-2 self-start text-foreground"
              }
            >
              {segment.text}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}