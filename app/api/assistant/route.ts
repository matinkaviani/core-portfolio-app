import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { buildSystemPrompt } from '@/lib/ai/persona'

// Do not use the edge runtime with the AI SDK.
export const maxDuration = 30

/**
 * Model is served by Groq through the Vercel AI Gateway. Override with the
 * NEXUS_AI_MODEL env var. Requires AI_GATEWAY_API_KEY to be set in the project.
 */
const MODEL = process.env.NEXUS_AI_MODEL || 'moonshotai/kimi-k2'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: MODEL,
      system: buildSystemPrompt(),
      messages: await convertToModelMessages(messages),
      temperature: 0.6,
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.log('[v0] assistant route error:', err)
    return new Response(
      JSON.stringify({ error: 'assistant_unavailable' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    )
  }
}
