import type { PortfolioData } from '@/lib/content/load-portfolio'
import {
  buildKnowledgeContext,
  retrieveKnowledge,
  formatRetrievedContext,
  formatProjectAliases,
} from '@/lib/content/knowledge-base'

const UNKNOWN_RESPONSE = "I don't have enough information about that."

/**
 * Builds the system prompt from /content files only.
 * Kept in the service layer so UI components never embed AI logic.
 */
export function buildSystemPrompt(portfolio: PortfolioData, query?: string): string {
  const retrieved = query
    ? formatRetrievedContext(retrieveKnowledge(portfolio, query, 8))
    : ''
  const knowledge = retrieved || buildKnowledgeContext(portfolio)

  const projects = portfolio.projects
    .map(
      (p) =>
        `- ${p.name} (${p.year}, ${p.category}, ${p.status}): ${p.description} Stack: ${p.stack.join(', ')}.`,
    )
    .join('\n')

  const experience = portfolio.experience
    .map(
      (e) =>
        `- ${e.role} @ ${e.company} (${e.period}, ${e.location}): ${e.summary} Highlights: ${e.highlights.join(' ')}`,
    )
    .join('\n')

  const skills = portfolio.skills
    .map((group) => `- ${group.name}: ${group.skills.join(', ')}`)
    .join('\n')

  const aliases = formatProjectAliases(portfolio)

  return `${portfolio.aiInstructions.trim()}

If a question cannot be answered from the knowledge below, respond exactly with: "${UNKNOWN_RESPONSE}"

ABOUT ${portfolio.profile.name.toUpperCase()}
- Role: ${portfolio.profile.role}
- Location: ${portfolio.profile.location}
- Email: ${portfolio.profile.email}
- Links: GitHub ${portfolio.profile.links.github}, LinkedIn ${portfolio.profile.links.linkedin}
- Bio: ${portfolio.profile.bio}

SKILLS
${skills}

PROJECTS
${projects}
${aliases ? `\nPROJECT ALIASES\n${aliases}` : ''}

EXPERIENCE
${experience}

KNOWLEDGE BASE
${knowledge}

When users ask how to get in touch, share the email and suggest opening the Contact app.`
}

export function buildAssistantGreeting(portfolio: PortfolioData): string {
  return `Hello. I'm Core — the AI assistant for ${portfolio.profile.name}'s portfolio. Ask me about projects, experience, skills, or how to get in touch.`
}
