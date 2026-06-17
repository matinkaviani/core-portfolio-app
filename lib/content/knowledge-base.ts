import type { PortfolioData } from '@/lib/content/load-portfolio'

export interface KnowledgeChunk {
  id: string
  source: string
  title: string
  text: string
  keywords: string[]
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#./]+/)
    .filter((token) => token.length > 2)
}

function buildChunk(
  id: string,
  source: string,
  title: string,
  text: string,
): KnowledgeChunk {
  return {
    id,
    source,
    title,
    text,
    keywords: tokenize(`${title} ${text}`),
  }
}

export function buildKnowledgeChunks(portfolio: PortfolioData): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    buildChunk('about', 'about.md', 'About', portfolio.about.raw),
    buildChunk('skills', 'skills.md', 'Skills', portfolio.skillsDoc.raw),
    buildChunk(
      'experience',
      'experience.md',
      'Experience',
      portfolio.experienceDoc.raw,
    ),
    buildChunk('contact', 'contact.md', 'Contact', portfolio.contact.raw),
    buildChunk(
      'ai-instructions',
      'ai-instructions.md',
      'AI Instructions',
      portfolio.aiInstructions,
    ),
  ]

  for (const project of portfolio.projects) {
    const body = Object.entries(project.sections ?? {})
      .map(([heading, value]) => `## ${heading}\n${value}`)
      .join('\n\n')

    chunks.push(
      buildChunk(
        `project-${project.id}`,
        `projects/${project.id}.md`,
        project.name,
        `# ${project.name}\n${body}`,
      ),
    )
  }

  return chunks
}

export function buildKnowledgeContext(portfolio: PortfolioData): string {
  return buildKnowledgeChunks(portfolio)
    .map((chunk) => `### ${chunk.title} (${chunk.source})\n${chunk.text}`)
    .join('\n\n')
}

export function retrieveKnowledge(
  portfolio: PortfolioData,
  query: string,
  limit = 6,
): KnowledgeChunk[] {
  const tokens = tokenize(query)
  if (!tokens.length) {
    return buildKnowledgeChunks(portfolio).slice(0, limit)
  }

  const scored = buildKnowledgeChunks(portfolio)
    .map((chunk) => {
      const score = tokens.reduce(
        (total, token) =>
          total +
          (chunk.keywords.includes(token) ? 2 : 0) +
          (chunk.text.toLowerCase().includes(token) ? 1 : 0),
        0,
      )
      return { chunk, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) return []

  return scored.slice(0, limit).map((entry) => entry.chunk)
}

export function formatRetrievedContext(chunks: KnowledgeChunk[]): string {
  if (!chunks.length) return ''
  return chunks
    .map((chunk) => `### ${chunk.title} (${chunk.source})\n${chunk.text}`)
    .join('\n\n')
}
