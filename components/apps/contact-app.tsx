'use client'

import {
  Turnstile,
  type TurnstileInstance,
} from '@marsidev/react-turnstile'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { usePortfolio } from '../os/portfolio-context'

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type FormState = {
  name: string
  email: string
  message: string
  website: string
}

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error'

export function ContactApp() {
  const { profile } = usePortfolio()
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    website: '',
  })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)

  const channels = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    {
      label: 'GitHub',
      value: profile.links.github,
      href: `https://${profile.links.github}`,
    },
    {
      label: 'LinkedIn',
      value: profile.links.linkedin,
      href: `https://${profile.links.linkedin}`,
    },
    { label: 'Location', value: profile.location, href: undefined },
  ]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitState === 'submitting') return

    if (turnstileSiteKey && !turnstileToken) {
      setSubmitState('error')
      setErrorMessage('Complete the security check and try again.')
      return
    }

    setSubmitState('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          website: form.website,
          turnstileToken: turnstileToken ?? undefined,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null

        if (data?.error === 'domain_not_verified') {
          setSubmitState('error')
          setErrorMessage(
            'Email delivery is not configured yet. Use the email link above for now.',
          )
          return
        }

        throw new Error(data?.error ?? 'send_failed')
      }

      setSubmitState('sent')
      setForm({ name: '', email: '', message: '', website: '' })
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      window.setTimeout(() => setSubmitState('idle'), 4000)
    } catch {
      setSubmitState('error')
      setErrorMessage(
        'Could not send your message right now. Try email instead.',
      )
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    }
  }

  return (
    <div className="core-scrollbar h-full overflow-auto bg-[oklch(0.155_0.004_270)] p-4 sm:p-6">
      <p className="text-[11px] uppercase tracking-wider text-primary">
        Get in touch
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        Let&apos;s build something
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Have a project, role, or idea worth exploring? Send a note and
        I&apos;ll get back to you.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {channels.map((c) =>
          c.href ? (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
              <p className="mt-0.5 truncate text-sm text-foreground group-hover:text-primary">
                {c.value}
              </p>
            </a>
          ) : (
            <div
              key={c.label}
              className="rounded-lg border border-border bg-card p-3"
            >
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
              <p className="mt-0.5 truncate text-sm text-foreground">
                {c.value}
              </p>
            </div>
          ),
        )}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          name="website"
          className="hidden"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            disabled={submitState === 'submitting'}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-60"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            disabled={submitState === 'submitting'}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-60"
          />
        </div>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Tell me about your project…"
          disabled={submitState === 'submitting'}
          className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-60"
        />

        {turnstileSiteKey ? (
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            options={{ theme: 'dark', size: 'flexible' }}
          />
        ) : null}

        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitState === 'submitting'
            ? 'Sending…'
            : submitState === 'sent'
              ? 'Message sent ✓'
              : 'Send message'}
        </button>

        {submitState === 'sent' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-emerald-400"
          >
            Thanks — I&apos;ll reply to your email shortly.
          </motion.p>
        )}

        {submitState === 'error' && errorMessage ? (
          <p className="text-center text-xs text-red-400">{errorMessage}</p>
        ) : null}
      </form>
    </div>
  )
}
