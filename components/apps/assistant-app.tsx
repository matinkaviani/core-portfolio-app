'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useOS } from '../os/os-context'
import { usePortfolio } from '../os/portfolio-context'
import { useAchievements } from '../os/achievements-context'
import { buildAssistantGreeting } from '@/lib/ai/persona'
import { localAnswer } from '@/lib/ai/local-answer'
import { generateFollowUps } from '@/lib/ai/follow-ups'

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

let fid = 0

export function AssistantApp() {
  const { openApp, getAppParams } = useOS()
  const portfolio = usePortfolio()
  const { profile } = portfolio
  const { unlock } = useAchievements()
  const params = getAppParams('assistant')

  const [input, setInput] = useState('')
  const [recruiterMode, setRecruiterMode] = useState(
    params.mode === 'recruiter',
  )
  const [jobDescription, setJobDescription] = useState('')
  const [followUps, setFollowUps] = useState<string[]>([])
  const [fallback, setFallback] = useState<
    { id: string; role: 'user' | 'assistant'; text: string }[]
  >([])
  const [fallbackMode, setFallbackMode] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (params.mode === 'recruiter') {
      setRecruiterMode(true)
      unlock('recruiter')
    }
  }, [params.mode, unlock])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/assistant',
        body: () => ({
          mode: recruiterMode ? 'recruiter' : 'default',
          jobDescription: recruiterMode ? jobDescription : '',
        }),
      }),
    [recruiterMode, jobDescription],
  )

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [
      {
        id: 'greeting',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: buildAssistantGreeting(portfolio),
          },
        ],
      },
    ] as UIMessage[],
  })

  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, fallback, busy, followUps])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setInput('')
    setFollowUps([])

    if (recruiterMode) unlock('recruiter')

    if (fallbackMode) {
      const userMsg = { id: `f${++fid}`, role: 'user' as const, text: trimmed }
      const replyText = localAnswer(portfolio, trimmed)
      const reply = {
        id: `f${++fid}`,
        role: 'assistant' as const,
        text: replyText,
      }
      setFallback((m) => [...m, userMsg, reply])
      setFollowUps(generateFollowUps(portfolio, trimmed, replyText))
      if (/open contact/i.test(trimmed)) openApp('contact')
      return
    }

    sendMessage({ text: trimmed })
  }

  useEffect(() => {
    if (error && !fallbackMode) {
      setFallbackMode(true)
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')
      const q = lastUser ? textOf(lastUser) : ''
      setFallback([
        {
          id: `f${++fid}`,
          role: 'assistant',
          text:
            'The live AI service is unavailable right now, so I switched to offline mode. I can still answer from the portfolio data.' +
            (q ? `\n\n${localAnswer(portfolio, q)}` : ''),
        },
      ])
    }
  }, [error, fallbackMode, messages, portfolio])

  useEffect(() => {
    if (busy || fallbackMode) return
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastAssistant || !lastUser || lastAssistant.id === 'greeting') return

    const q = textOf(lastUser)
    const a = textOf(lastAssistant)
    if (a) setFollowUps(generateFollowUps(portfolio, q, a))
  }, [busy, messages, portfolio, fallbackMode])

  const initialSuggestions = [
    `What does ${profile.name} work on?`,
    'Tell me about Qaay',
    'Summarize the experience',
    'How can I get in touch?',
  ]

  const showInitialSuggestions =
    messages.length <= 1 && fallback.length === 0 && !busy && !recruiterMode

  const rendered = [
    ...messages.map((m) => ({
      id: m.id,
      role: m.role,
      text: textOf(m),
    })),
    ...fallback,
  ].filter((m) => m.text.length > 0 || m.role === 'user')

  return (
    <div className="flex h-full flex-col bg-[oklch(0.155_0.004_270)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-3 sm:gap-3 sm:px-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-mono text-xs font-semibold text-primary">
          AI
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Core Assistant</p>
          <p className="text-xs text-muted-foreground">
            {fallbackMode
              ? 'Offline mode · portfolio knowledge base'
              : recruiterMode
                ? 'Recruiter mode · strict portfolio matching'
                : busy
                  ? 'Thinking…'
                  : `Online · knows everything about ${profile.name}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRecruiterMode((v) => !v)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors sm:px-2.5 sm:py-1 ${
            recruiterMode
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Recruiter
        </button>
      </div>

      {recruiterMode && (
        <div className="border-b border-border px-4 py-3">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Job description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            placeholder="Paste a role description to match against the portfolio…"
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
          />
        </div>
      )}

      <div
        ref={scrollRef}
        className="core-scrollbar flex-1 space-y-4 overflow-auto px-4 py-5"
      >
        {rendered.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-md bg-primary text-primary-foreground'
                  : 'rounded-bl-md border border-border bg-card text-foreground'
              }`}
            >
              {m.text || '…'}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {status === 'submitted' && (
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

      {showInitialSuggestions && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {initialSuggestions.map((s) => (
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

      {!busy && followUps.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {followUps.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/50"
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
          placeholder={
            recruiterMode
              ? 'Ask how the portfolio matches this role…'
              : 'Ask the assistant…'
          }
          className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          aria-label="Message the assistant"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
