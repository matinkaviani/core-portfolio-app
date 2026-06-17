import { PROFILE, PROJECTS, EXPERIENCE } from '@/lib/os-data'

/**
 * Deterministic local fallback used when no AI gateway credentials are present.
 * Lives in the service layer so the UI never contains AI/answer logic.
 */
export function localAnswer(query: string): string {
  const q = query.toLowerCase()

  if (/^(hi|hello|hey|yo)\b/.test(q)) {
    return `Hi — I'm NEXUS, ${PROFILE.name}'s assistant. Ask me about projects, experience, or how to get in touch.`
  }
  if (/(contact|reach|touch|email|hire|available)/.test(q)) {
    return `You can reach ${PROFILE.name} at ${PROFILE.email}. Also on ${PROFILE.links.github} and ${PROFILE.links.x}. Open the Contact app to send a message.`
  }
  if (/(experience|career|work history|job|role)/.test(q)) {
    return (
      `Here's the career timeline:\n\n` +
      EXPERIENCE.map(
        (e) => `• ${e.role} @ ${e.company} (${e.period}) — ${e.summary}`,
      ).join('\n')
    )
  }
  const project = PROJECTS.find((p) => q.includes(p.name.toLowerCase()))
  if (project) {
    return `${project.name} (${project.year}, ${project.category}) — ${project.description}\n\nBuilt with: ${project.stack.join(', ')}. Status: ${project.status}.`
  }
  if (/(project|work|built|portfolio|ship)/.test(q)) {
    return (
      `${PROFILE.name} has shipped these selected projects:\n\n` +
      PROJECTS.map((p) => `• ${p.name} — ${p.category} (${p.status})`).join('\n') +
      `\n\nAsk about any one for details.`
    )
  }
  if (/(who|about|skill|stack|bio)/.test(q)) {
    return `${PROFILE.name} is a ${PROFILE.role} based in ${PROFILE.location}. ${PROFILE.bio}`
  }
  return `I can tell you about ${PROFILE.name}'s projects, experience, and contact details. Try "tell me about Orbit" or "summarize the experience".`
}
