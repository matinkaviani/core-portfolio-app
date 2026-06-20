import { getTurnstileSiteKey } from '@/lib/contact/turnstile-config'

export async function GET() {
  const turnstileSiteKey = getTurnstileSiteKey() ?? null
  return Response.json({ turnstileSiteKey })
}
