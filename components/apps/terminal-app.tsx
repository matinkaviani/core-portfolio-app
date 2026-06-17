'use client'

import { useEffect, useRef, useState } from 'react'
import { useOS } from '../os/os-context'
import { PROFILE, PROJECTS, EXPERIENCE, type AppId } from '@/lib/os-data'

interface Line {
  id: number
  type: 'input' | 'output' | 'system'
  text: string
}

let lineId = 0
const next = () => ++lineId

const HELP = `Available commands:
  help          show this list
  about         who is ${PROFILE.name}
  projects      list selected work
  experience    show career timeline
  contact       how to reach me
  open <app>    launch an app (assistant, projects, experience, contact)
  whoami        current session user
  date          current date and time
  clear         clear the screen`

export function TerminalApp() {
  const { openApp } = useOS()
  const [lines, setLines] = useState<Line[]>([
    { id: next(), type: 'system', text: `NEXUS shell — type 'help' to begin.` },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const push = (type: Line['type'], text: string) =>
    setLines((prev) => [...prev, { id: next(), type, text }])

  const run = (raw: string) => {
    const cmd = raw.trim()
    push('input', cmd)
    if (!cmd) return
    setHistory((h) => [...h, cmd])
    setHIndex(-1)

    const [name, ...args] = cmd.toLowerCase().split(/\s+/)

    switch (name) {
      case 'help':
        push('output', HELP)
        break
      case 'about':
        push('output', `${PROFILE.name} — ${PROFILE.role}\n${PROFILE.bio}`)
        break
      case 'whoami':
        push('output', `${PROFILE.handle}@nexus`)
        break
      case 'date':
        push('output', new Date().toString())
        break
      case 'projects':
        push(
          'output',
          PROJECTS.map(
            (p) => `${p.name.padEnd(10)} ${p.year}  ${p.category} — ${p.status}`,
          ).join('\n'),
        )
        break
      case 'experience':
        push(
          'output',
          EXPERIENCE.map(
            (e) => `${e.period.padEnd(16)} ${e.role} @ ${e.company}`,
          ).join('\n'),
        )
        break
      case 'contact':
        push(
          'output',
          `email     ${PROFILE.email}\ngithub    ${PROFILE.links.github}\nx         ${PROFILE.links.x}\nlinkedin  ${PROFILE.links.linkedin}`,
        )
        break
      case 'open': {
        const valid: AppId[] = ['assistant', 'projects', 'experience', 'contact', 'terminal']
        const target = args[0] as AppId
        if (valid.includes(target)) {
          push('output', `launching ${target}…`)
          openApp(target)
        } else {
          push('output', `open: unknown app '${args[0] ?? ''}'. try: assistant, projects, experience, contact`)
        }
        break
      }
      case 'clear':
        setLines([])
        break
      default:
        push('output', `command not found: ${name}. type 'help'.`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const idx = hIndex < 0 ? history.length - 1 : Math.max(0, hIndex - 1)
      setHIndex(idx)
      setValue(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIndex < 0) return
      const idx = hIndex + 1
      if (idx >= history.length) {
        setHIndex(-1)
        setValue('')
      } else {
        setHIndex(idx)
        setValue(history[idx])
      }
    }
  }

  return (
    <div
      className="nexus-scrollbar h-full overflow-auto bg-[oklch(0.13_0.004_270)] p-4 font-mono text-[13px] leading-relaxed"
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap break-words">
          {line.type === 'input' ? (
            <div className="flex gap-2">
              <span className="text-primary">{PROFILE.handle}@nexus</span>
              <span className="text-muted-foreground">~</span>
              <span className="text-foreground">{line.text}</span>
            </div>
          ) : line.type === 'system' ? (
            <p className="text-muted-foreground">{line.text}</p>
          ) : (
            <p className="text-foreground/80">{line.text}</p>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <span className="text-primary">{PROFILE.handle}@nexus</span>
        <span className="text-muted-foreground">~</span>
        <input
          ref={inputRef}
          value={value}
          autoFocus
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent text-foreground caret-primary outline-none"
          aria-label="Terminal input"
        />
      </div>
    </div>
  )
}
