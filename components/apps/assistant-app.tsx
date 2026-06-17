'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useOS } from '../os/os-context'
import { PROFILE } from '@/lib/os-data'
import { localAnswer } from '@/lib/ai/local-answer'

const SUGGESTIONS = [
  'What does Alex work on?',
  'Tell me about Orbit',
  'Summarize the experience',
  'How can I get in touch?',
]

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

let fid = 0

export function AssistantApp() {
  const { openApp } = useOS()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Local fallback messages, used when the AI endpoint is unavailable.
  const [fallback, setFallback] = useState<
    { id: string; role: 'user' | 'assistant'; text: string }[]
  >([])
  const [fallbackMode, setFallbackMode] = useState(false)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/assistant' }),
    messages: [
      {
        id: 'greeting',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Hello. I'm NEXUS — the AI assistant for ${PROFILE.name}'s portfolio. What would you like to know?`,
          },
        ],
      },
    ],
  })

  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, fallback, busy])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setInput('')

    if (fallbackMode) {
      const userMsg = { id: `f${++fid}`, role: 'user' as const, text: trimmed }
      const reply = {
        id: `f${++fid}`,
        role: 'assistant' as const,
        text: localAnswer(trimmed),
      }
      setFallback((m) => [...m, userMsg, reply])
      if (/open contact/i.test(trimmed)) openApp('contact')
      return
    }

    sendMessage({ text: trimmed })
  }

  // When the AI endpoint errors, switch to local mode and answer the last query.
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
            (q ? `\n\n${localAnswer(q)}` : ''),
        },
      ])
    }
  }, [error, fallbackMode, messages])

  const showSuggestions =
    messages.length <= 1 && fallback.length === 0 && !busy

  // Merge streamed messages with any local-fallback messages for rendering.
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
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 font-mono text-xs font-semibold text-primary">
          AI
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">NEXUS Assistant</p>
          <p className="text-xs text-muted-foreground">
            {fallbackMode
              ? 'Offline mode · portfolio knowledge base'
              : busy
                ? 'Thinking…'
                : `Online · knows everything about ${PROFILE.name}`}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="nexus-scrollbar flex-1 space-y-4 overflow-auto px-4 py-5"
      >
        {rendered.map((m) => (
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

      {showSuggestions && (
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
          disabled={!input.trim() || busy}
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
