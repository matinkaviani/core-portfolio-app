import type { PortfolioData } from '@/lib/content/load-portfolio'
import { retrieveKnowledge } from '@/lib/content/knowledge-base'

export function generateFollowUps(
  portfolio: PortfolioData,
  query: string,
  answer: string,
): string[] {
  const combined = `${query} ${answer}`.toLowerCase()
  const suggestions = new Set<string>()

  for (const project of portfolio.projects) {
    if (
      combined.includes(project.name.toLowerCase()) ||
      combined.includes(project.id.replace(/-/g, ' '))
    ) {
      suggestions.add(`What tech stack was used in ${project.name}?`)
      suggestions.add(`What were the main challenges in ${project.name}?`)
    }
  }

  if (/(experience|career|role|work)/i.test(combined)) {
    suggestions.add('What are the key achievements?')
    suggestions.add('Summarize the frontend experience')
  }

  if (/(skill|stack|tech|react|next)/i.test(combined)) {
    suggestions.add('Which skills are strongest for frontend roles?')
  }

  if (/(contact|reach|email|hire)/i.test(combined)) {
    suggestions.add('How can I get in touch?')
  }

  const chunks = retrieveKnowledge(portfolio, query, 3)
  for (const chunk of chunks) {
    if (chunk.source.startsWith('projects/')) {
      suggestions.add(`Tell me more about ${chunk.title}`)
    }
  }

  if (!suggestions.size) {
    suggestions.add('What projects stand out most?')
    suggestions.add('Summarize the experience timeline')
    suggestions.add('What frontend skills are listed?')
    suggestions.add('How can I contact you?')
  }

  return Array.from(suggestions).slice(0, 3)
}
