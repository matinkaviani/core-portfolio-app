'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOS } from '../os/os-context'
import { PROFILE, PROJECTS, EXPERIENCE } from '@/lib/os-data'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

let mid = 0
const next = () => ++mid

const SUGGESTIONS = [
  'What does Alex work on?',
  'Tell me about Orbit',
  'Summarize the experience',
  'How can I get in touch?',
]

function answer(query: string): string {
  const q = query.toLowerCase()

  if (/(hi|hello|hey|yo)\b/.test(q)) {
    return `Hi — I'm NEXUS, ${PROFILE.name}'s assistant. Ask me about projects, experience, or how to get in touch.`
  }
  if (q.includes('contact') || q.includes('reach') || q.includes('touch') || q.includes('email')) {
    return `You can reach ${PROFILE.name} at ${PROFILE.email}. Also on ${PROFILE.links.github} and ${PROFILE.links.x}. Want me to open the Contact app?`
  }
  if (q.includes('experience') || q.includes('career') || q.includes('work history') || q.includes('job')) {
    return (
      `Here's the career timeline:\n\n` +
      EXPERIENCE.map((e) => `• ${e.role} @ ${e.company} (${e.period}) — ${e.summary}`).join('\n')
    )
  }
  const project = PROJECTS.find((p) => q.includes(p.name.toLowerCase()))
  if (project) {
    return `${project.name} (${project.year}, ${project.category}) — ${project.description}\n\nBuilt with: ${project.stack.join(', ')}. Status: ${project.status}.`
  }
  if (q.includes('project') || q.includes('work') || q.includes('built') || q.includes('portfolio')) {
    return (
      `${PROFILE.name} has shipped these selected projects:\n\n` +
      PROJECTS.map((p) => `• ${p.name} — ${p.category} (${p.status})`).join('\n') +
      `\n\nAsk about any one for details.`
    )
  }
  if (q.includes('who') || q.includes('about') || q.includes('skill') || q.includes('stack')) {
    return `${PROFILE.name} is a ${PROFILE.role} based in ${PROFILE.location}. ${PROFILE.bio}`
  }
  if (q.includes('hire') || q.includes('available') || q.includes('freelance')) {
    return `${PROFILE.name} is open to selective collaborations and interesting problems. Reach out at ${PROFILE.email}.`
  }
  return `I can tell you about ${PROFILE.name}'s projects, experience, and contact details. Try asking "what does ${PROFILE.handle} work on?" or "tell me about Orbit".`
}

export function AssistantApp() {
  const { openApp } = useOS()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: next(),
      role: 'assistant',
      text: `Hello. I'm NEXUS — the assistant for ${PROFILE.name}'s portfolio. What would you like to know?`,
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typing])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    setMessages((m) => [...m, { id: next(), role: 'user', text: trimmed }])
    setInput('')
    setTyping(true)
    const reply = answer(trimmed)
    if (/contact app|open the contact/i.test(reply)) {
      // small nudge to open contact when relevant
    }
    setTimeout(() => {
      setMessages((m) => [...m, { id: next(), role: 'assistant', text: reply }])
      setTyping(false)
      if (trimmed.toLowerCase().includes('open contact')) openApp('contact')
    }, 650 + Math.min(1200, reply.length * 6))
  }

  return (
    <div className="flex h-full flex-col bg-[oklch(0.155_0.004_270)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 font-mono text-xs font-semibold text-primary">
          AI
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">NEXUS Assistant</p>
          <p className="text-xs text-muted-foreground">
            Online · knows everything about {PROFILE.name}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="nexus-scrollbar flex-1 space-y-4 overflow-auto px-4 py-5">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-md bg-primary text-primary-foreground'
                  : 'rounded-bl-md border border-border bg-card text-foreground'
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant…"
          className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          aria-label="Message the assistant"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
