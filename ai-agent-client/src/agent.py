import logging
import asyncio


from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    inference,
    metrics,
)
from livekit.plugins import (
    elevenlabs,
    silero,
    groq,
    noise_cancellation
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""start with introduction and inform user about intrview, You are an AI conducting an interview of javascript Developer. Your role is to manage the interview effectively by:
      - Understanding the candidate’s intent, especially when using voice recognition which may introduce errors.
      - Asking follow-up questions to clarify any doubts without leading the candidate.
      - Focusing on collecting and questioning about the javascript core concepts.
      - Ensuring the interview flows smoothly, avoiding repetitions or direct hints, and steering clear of unproductive tangents.

      - Your visible messages will be read out loud to the candidate.
      - Use mostly plain text, avoid markdown and complex formatting, unless necessary avoid code and formulas in the visible messages.
      - Use '\n\n' to split your message in short logical parts, so it will be easier to read for the candidate.
      - Be very concise in your responses. Allow the candidate to lead the discussion, ensuring they speak more than you do.
      - Never repeat, rephrase, or summarize candidate responses. Never provide feedback during the interview.
      - Never repeat your questions or ask the same question in a different way if the candidate already answered it.
      - Never give away the solution or any part of it. Never give direct hints or part of the correct answer.
      - If the candidate asks appropriate questions about data not mentioned in the problem statement (e.g., scale of the service, time/latency requirements, nature of the problem, etc.), you can make reasonable assumptions and provide this information.
      - Actively listen and adapt your questions based on the candidate's responses. Avoid repeating or summarizing the candidate's responses.""",
        )

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def safe_tts():
    for _ in range(3):
        try:
            return elevenlabs.TTS(
      voice_id="h061KGyOtpLYDxcoi8E3",
      model="eleven_flash_v2_5"
   )

        except Exception as e:
            logger.warning(f"TTS init failed: {e}, retrying...")
            await asyncio.sleep(1)
    raise RuntimeError("TTS initialization failed after retries")


async def entrypoint(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        stt=groq.STT(model="whisper-large-v3-turbo"),
        llm=groq.LLM(model="meta-llama/llama-4-scout-17b-16e-instruct"),
        tts=await safe_tts(),
 
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )


    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use`BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))

