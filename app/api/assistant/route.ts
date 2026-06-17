import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { loadPortfolio } from '@/lib/content/load-portfolio'
import { buildSystemPrompt } from '@/lib/ai/persona'
import { buildRecruiterPrompt } from '@/lib/ai/recruiter'
import { getAssistantModel } from '@/lib/ai/model'
import { retrieveKnowledge } from '@/lib/content/knowledge-base'

export const maxDuration = 30

interface AssistantRequestBody {
  messages: UIMessage[]
  mode?: 'default' | 'recruiter'
  jobDescription?: string
}

export async function POST(req: Request) {
  const model = getAssistantModel()
  if (!model) {
    return new Response(
      JSON.stringify({ error: 'assistant_unavailable' }),
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

    const trace = retrieveKnowledge(portfolio, lastQuery, 6).map(
      ({ id, source, title, text }) => ({
        id,
        source,
        title,
        preview: text.slice(0, 160).replace(/\s+/g, ' '),
      }),
    )

    const system =
      mode === 'recruiter' && jobDescription.trim()
        ? buildRecruiterPrompt(portfolio, jobDescription)
        : buildSystemPrompt(portfolio, lastQuery)

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      temperature: mode === 'recruiter' ? 0.3 : 0.4,
    })

    const response = result.toUIMessageStreamResponse()
    const headers = new Headers(response.headers)
    headers.set('x-nexus-trace', JSON.stringify(trace))
    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (err) {
    console.error('[assistant] route error:', err)
    return new Response(
      JSON.stringify({ error: 'assistant_unavailable' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    )
  }
}
