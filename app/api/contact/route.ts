import { contactFormSchema } from '@/lib/contact/schema'
import { sendContactEmail } from '@/lib/contact/send-contact-email'
import { verifyTurnstileToken } from '@/lib/contact/verify-turnstile'
import { loadPortfolio } from '@/lib/content/load-portfolio'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown
    const parsed = contactFormSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'invalid_input', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, email, message, website, turnstileToken } = parsed.data

    if (website) {
      return Response.json({ ok: true })
    }

    const turnstileRequired = Boolean(process.env.TURNSTILE_SECRET_KEY)
    if (turnstileRequired && !turnstileToken) {
      return Response.json({ error: 'turnstile_required' }, { status: 400 })
    }

    if (turnstileToken) {
      const remoteIp =
        req.headers.get('cf-connecting-ip') ??
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      const verified = await verifyTurnstileToken(turnstileToken, remoteIp)
      if (!verified) {
        return Response.json({ error: 'turnstile_failed' }, { status: 403 })
      }
    }

    const portfolio = loadPortfolio()
    const to = process.env.CONTACT_TO_EMAIL?.trim() || portfolio.profile.email

    if (!to) {
      return Response.json({ error: 'missing_recipient' }, { status: 500 })
    }

    const result = await sendContactEmail({ name, email, message, to })
    if (!result.ok) {
      const status = result.error === 'missing_email_credentials' ? 503 : 502
      return Response.json({ error: result.error }, { status })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[contact] route error:', err)
    return Response.json({ error: 'contact_unavailable' }, { status: 500 })
  }
}
