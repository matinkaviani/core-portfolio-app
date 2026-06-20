import { createGroq } from '@ai-sdk/groq'
import type { LanguageModel } from 'ai'

// Kimi models require Groq paid-tier access; llama-3.3-70b works on the free tier.
const DEFAULT_MODEL =
  process.env.CORE_AI_MODEL || 'llama-3.3-70b-versatile'

function resolveGroqApiKey(): string | undefined {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY

  const gatewayKey = process.env.AI_GATEWAY_API_KEY
  // Groq keys (gsk_…) are often pasted into AI_GATEWAY_API_KEY by mistake.
  if (gatewayKey?.startsWith('gsk_')) return gatewayKey

  return undefined
}

/**
 * Returns a model for streamText, or null when no AI credentials are configured.
 * Prefers direct Groq when a Groq API key is available; otherwise uses AI Gateway.
 */
export function getAssistantModel(): LanguageModel | string | null {
  const groqApiKey = resolveGroqApiKey()
  if (groqApiKey) {
    const groq = createGroq({ apiKey: groqApiKey })
    return groq(DEFAULT_MODEL)
  }

  if (process.env.AI_GATEWAY_API_KEY) {
    return DEFAULT_MODEL
  }

  return null
}
