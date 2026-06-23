import type { PortfolioData } from '@/lib/content/load-portfolio'
import {
  retrieveKnowledge,
  formatRetrievedContext,
  findProjectByQuery,
} from '@/lib/content/knowledge-base'

const UNKNOWN_RESPONSE = "I don't have enough information about that."

/**
 * Deterministic local fallback used when no AI gateway credentials are present.
 * Answers strictly from /content-backed portfolio data.
 */
export function localAnswer(portfolio: PortfolioData, query: string): string {
  const q = query.toLowerCase().trim()
  const { profile, projects, experience, skills } = portfolio

  if (!q) return UNKNOWN_RESPONSE

  if (/^(hi|hello|hey|yo)\b/.test(q)) {
    return `Hi — I'm Core, ${profile.name}'s assistant. Ask me about projects, experience, skills, or how to get in touch.`
  }

  if (/(contact|reach|touch|email|hire|available)/.test(q)) {
    return `You can reach ${profile.name} at ${profile.email}. GitHub: ${profile.links.github}. LinkedIn: ${profile.links.linkedin}. Open the Contact app to send a message.`
  }

  if (/(experience|career|work history|job|role|responsibilit)/.test(q)) {
    return (
      `Career timeline:\n\n` +
      experience
        .map((e) => `• ${e.role} @ ${e.company} (${e.period}) — ${e.summary}`)
        .join('\n')
    )
  }

  if (/(skill|stack|tech)/.test(q)) {
    return skills
      .map((group) => `${group.name}: ${group.skills.join(', ')}`)
      .join('\n')
  }

  const project = findProjectByQuery(projects, q)
  if (project) {
    const challenges = project.challenges?.length
      ? `\n\nKey challenges: ${project.challenges.join('; ')}.`
      : ''
    const outcome = project.outcome ? `\n\nOutcome: ${project.outcome}` : ''
    return `${project.name} (${project.year}, ${project.category}) — ${project.description}\n\nBuilt with: ${project.stack.join(', ')}. Status: ${project.status}.${challenges}${outcome}`
  }

  if (/(project|work|built|portfolio|ship)/.test(q)) {
    return (
      `${profile.name}'s selected projects:\n\n` +
      projects.map((p) => `• ${p.name} — ${p.category} (${p.status})`).join('\n') +
      `\n\nAsk about any one for details.`
    )
  }

  if (/(^who\b|about (you|him|her|them)\b|\bbio\b)/.test(q)) {
    return `${profile.name} is a ${profile.role} based in ${profile.location}. ${profile.bio}`
  }

  const retrieved = formatRetrievedContext(retrieveKnowledge(portfolio, q, 3))
  if (retrieved) {
    return retrieved
  }

  return UNKNOWN_RESPONSE
}
