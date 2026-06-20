interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true

  const body = new URLSearchParams({
    secret,
    response: token,
  })

  if (remoteIp) {
    body.set('remoteip', remoteIp)
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    },
  )

  if (!response.ok) return false

  const data = (await response.json()) as TurnstileVerifyResponse
  return data.success
}
