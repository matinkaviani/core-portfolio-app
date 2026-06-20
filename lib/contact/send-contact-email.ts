import { Resend } from 'resend'

interface SendContactEmailInput {
  name: string
  email: string
  message: string
  to: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function sendContactEmail({
  name,
  email,
  message,
  to,
}: SendContactEmailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'missing_email_credentials' }
  }

  const from =
    process.env.RESEND_FROM?.trim() ||
    'Portfolio Contact <onboarding@resend.dev>'

  const resend = new Resend(apiKey)
  const subject = `Portfolio message from ${name}`

  const text = [
    `New message from your portfolio contact form`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    message,
  ].join('\n')

  const html = [
    '<p><strong>New message from your portfolio contact form</strong></p>',
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>`,
  ].join('')

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject,
    text,
    html,
  })

  if (error) {
    console.error('[contact] resend error:', error)

    const message =
      typeof error === 'object' && error && 'message' in error
        ? String(error.message)
        : ''

    if (message.includes('verify a domain')) {
      return { ok: false, error: 'domain_not_verified' }
    }

    return { ok: false, error: 'send_failed' }
  }

  return { ok: true }
}
