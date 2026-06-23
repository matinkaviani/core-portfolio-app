import type { PortfolioData } from '@/lib/content/load-portfolio'
import type { ProjectItem } from '@/lib/os-data'

export interface KnowledgeChunk {
  id: string
  source: string
  title: string
  text: string
  keywords: string[]
}

/** Legacy or informal names that map to a project id. */
export const PROJECT_ALIASES: Record<string, string> = {
  'trading platform': 'qaay',
  'crypto dashboard': 'qaay',
  'finance dashboard': 'qaay',
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

    const aliases = Object.entries(PROJECT_ALIASES)
      .filter(([, id]) => id === project.id)
      .map(([alias]) => alias)

    const chunk = buildChunk(
      `project-${project.id}`,
      `projects/${project.id}.md`,
      project.name,
      `# ${project.name}\n${body}`,
    )

    if (aliases.length) {
      chunk.keywords.push(...aliases.flatMap((alias) => tokenize(alias)))
    }

    chunks.push(chunk)
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
  const q = query.toLowerCase().trim()
  const tokens = tokenize(query)
  if (!tokens.length) {
    return buildKnowledgeChunks(portfolio).slice(0, limit)
  }

  const aliasBoost = new Map<string, number>()
  for (const [alias, id] of Object.entries(PROJECT_ALIASES)) {
    if (q.includes(alias)) {
      aliasBoost.set(`project-${id}`, 20)
    }
  }

  const scored = buildKnowledgeChunks(portfolio)
    .map((chunk) => {
      const score =
        (aliasBoost.get(chunk.id) ?? 0) +
        tokens.reduce(
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

export function findProjectByQuery(
  projects: ProjectItem[],
  query: string,
): ProjectItem | undefined {
  const q = query.toLowerCase().trim()

  for (const [alias, id] of Object.entries(PROJECT_ALIASES)) {
    if (q.includes(alias)) {
      const match = projects.find((p) => p.id === id)
      if (match) return match
    }
  }

  return projects.find(
    (p) =>
      q.includes(p.name.toLowerCase()) ||
      q.includes(p.id.replace(/-/g, ' ')) ||
      q.includes(p.id),
  )
}

export function formatProjectAliases(portfolio: PortfolioData): string {
  return Object.entries(PROJECT_ALIASES)
    .map(([alias, id]) => {
      const project = portfolio.projects.find((p) => p.id === id)
      return project ? `- "${alias}" → ${project.name}` : null
    })
    .filter(Boolean)
    .join('\n')
}
