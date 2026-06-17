import { loadPortfolio } from '@/lib/content/load-portfolio'
import { retrieveKnowledge } from '@/lib/content/knowledge-base'

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query?: string }
    const portfolio = loadPortfolio()
    const chunks = retrieveKnowledge(portfolio, query ?? '', 6).map(
      ({ id, source, title, text }) => ({
        id,
        source,
        title,
        preview: text.slice(0, 160).replace(/\s+/g, ' '),
      }),
    )

    return Response.json({ chunks })
  } catch {
    return Response.json({ chunks: [] }, { status: 500 })
  }
}
