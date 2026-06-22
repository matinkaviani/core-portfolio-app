import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { loadPortfolio } from '@/lib/content/load-portfolio'
import { buildSystemPrompt } from '@/lib/ai/persona'
import { buildRecruiterPrompt } from '@/lib/ai/recruiter'
import { getAssistantModel } from '@/lib/ai/model'

export const maxDuration = 30

interface AssistantRequestBody {
  messages: UIMessage[]
  mode?: 'default' | 'recruiter'
  jobDescription?: string
}

export async function POST(req: Request) {
  const model = getAssistantModel()
  if (!model) {
    console.error(
      '[assistant] missing AI credentials — set GROQ_API_KEY as a Cloudflare Worker secret (or AI_GATEWAY_API_KEY)',
    )
    return new Response(
      JSON.stringify({ error: 'assistant_unavailable', reason: 'missing_credentials' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    )
  }

  try {
    const body = (await req.json()) as AssistantRequestBody
    const { messages, mode = 'default', jobDescription = '' } = body
    const portfolio = loadPortfolio()

    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const lastQuery =
      lastUser?.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? ''

    const system =
      mode === 'recruiter' && jobDescription.trim()
        ? buildRecruiterPrompt(portfolio, jobDescription)
        : buildSystemPrompt(portfolio, lastQuery)

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      temperature: mode === 'recruiter' ? 0.3 : 0.4,
      onError: ({ error }) => {
        console.error('[assistant] stream error:', error)
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[assistant] route error:', err)
    return new Response(
      JSON.stringify({ error: 'assistant_unavailable' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    )
  }
}
