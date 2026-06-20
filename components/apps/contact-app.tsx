'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePortfolio } from '../os/portfolio-context'

export function ContactApp() {
  const { profile } = usePortfolio()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3500)
    setForm({ name: '', email: '', message: '' })
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </div>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Tell me about your project…"
          className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {sent ? 'Message sent ✓' : 'Send message'}
        </button>
        {sent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-emerald-400"
          >
            Thanks — I&apos;ll reply to {profile.email} shortly.
          </motion.p>
        )}
      </form>
    </div>
  )
}
