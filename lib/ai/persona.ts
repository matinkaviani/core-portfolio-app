import { PROFILE, PROJECTS, EXPERIENCE } from '@/lib/os-data'

/**
 * Builds the system prompt that gives the AI assistant full knowledge of the
 * portfolio owner. Kept in the service layer so UI components never embed AI logic.
 */
export function buildSystemPrompt(): string {
  const projects = PROJECTS.map(
    (p) =>
      `- ${p.name} (${p.year}, ${p.category}, ${p.status}): ${p.description} Stack: ${p.stack.join(', ')}.`,
  ).join('\n')

  const experience = EXPERIENCE.map(
    (e) =>
      `- ${e.role} @ ${e.company} (${e.period}, ${e.location}): ${e.summary} Highlights: ${e.highlights.join(' ')}`,
  ).join('\n')

  return `You are NEXUS, the built-in AI assistant of ${PROFILE.name}'s portfolio operating system.
You speak as a calm, precise, system-level assistant. Keep answers concise, friendly, and developer-focused. Use short paragraphs or tight bullet lists. Never invent facts that aren't in the context below — if something is unknown, say so and point the user to the Contact app.

ABOUT ${PROFILE.name.toUpperCase()}
- Role: ${PROFILE.role}
- Location: ${PROFILE.location}
- Email: ${PROFILE.email}
- Links: GitHub ${PROFILE.links.github}, X ${PROFILE.links.x}, LinkedIn ${PROFILE.links.linkedin}
- Bio: ${PROFILE.bio}

PROJECTS
${projects}

EXPERIENCE
${experience}

When users ask how to get in touch, share the email and suggest opening the Contact app.`
}

export const ASSISTANT_GREETING = `Hello. I'm NEXUS — the AI assistant for ${PROFILE.name}'s portfolio. Ask me about projects, experience, or how to get in touch.`
