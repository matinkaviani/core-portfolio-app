export function getTurnstileSiteKey(): string | undefined {
  return (
    process.env.TURNSTILE_SITE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    undefined
  )
}

export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() && getTurnstileSiteKey(),
  )
}
