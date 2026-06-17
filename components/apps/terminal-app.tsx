'use client'

import { useEffect, useRef, useState } from 'react'
import { useOS } from '../os/os-context'
import { usePortfolio } from '../os/portfolio-context'
import { useAchievements } from '../os/achievements-context'
import { useSession } from '../os/session-context'
import { flattenFiles, buildContentTree } from '@/lib/content/files'
import type { AppId } from '@/lib/os-data'

interface Line {
  id: number
  type: 'input' | 'output' | 'system'
  text: string
}

let lineId = 0
const next = () => ++lineId

function buildHelp(name: string): string {
  return `Available commands:
  help          show this list
  about         who is ${name}
  projects      list selected work
  experience    show career timeline
  skills        show skill set
  contact       how to reach me
  ls            list /content files
  cat <file>    read a content file
  chat          open AI assistant
  open <app>    launch an app
  whoami        current session user
  date          current date and time
  clear         clear the screen
  logout        end session and return to login`
}

const VALID_APPS: AppId[] = [
  'assistant',
  'projects',
  'experience',
  'contact',
  'terminal',
  'finder',
  'settings',
]

export function TerminalApp() {
  const { openApp } = useOS()
  const portfolio = usePortfolio()
  const { profile, projects, experience, skills } = portfolio
  const { unlock } = useAchievements()
  const { logout } = useSession()
  const files = flattenFiles(buildContentTree(portfolio))
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
    unlock('terminal_master')

    const [name, ...args] = cmd.toLowerCase().split(/\s+/)

    switch (name) {
      case 'help':
        push('output', buildHelp(profile.name))
        break
      case 'about':
        push('output', `${profile.name} — ${profile.role}\n${profile.bio}`)
        break
      case 'whoami':
        push('output', `${profile.handle}@nexus`)
        break
      case 'date':
        push('output', new Date().toString())
        break
      case 'projects':
        push(
          'output',
          projects
            .map(
              (p) =>
                `${p.name.padEnd(22)} ${p.year}  ${p.category} — ${p.status}`,
            )
            .join('\n'),
        )
        break
      case 'experience':
        push(
          'output',
          experience
            .map(
              (e) => `${e.period.padEnd(16)} ${e.role} @ ${e.company}`,
            )
            .join('\n'),
        )
        break
      case 'skills':
        push(
          'output',
          skills
            .map((group) => `${group.name}: ${group.skills.join(', ')}`)
            .join('\n'),
        )
        break
      case 'contact':
        push(
          'output',
          `email     ${profile.email}\ngithub    ${profile.links.github}\nlinkedin  ${profile.links.linkedin}\nlocation  ${profile.location}`,
        )
        break
      case 'ls':
        push(
          'output',
          files.map((f) => f.path).join('\n'),
        )
        break
      case 'cat': {
        const path = args.join(' ')
        const file = files.find(
          (f) => f.path === path || f.path.endsWith(`/${path}`),
        )
        if (file?.content) {
          push('output', file.content)
        } else {
          push('output', `cat: ${path || '(missing path)'}: No such file`)
        }
        break
      }
      case 'sudo':
        unlock('sudo')
        push(
          'output',
          'Nice try. This portfolio runs in user mode only — no root access granted.',
        )
        break
      case 'chat':
        push('output', 'launching assistant…')
        openApp('assistant')
        break
      case 'open': {
        const target = args[0] as AppId
        if (VALID_APPS.includes(target)) {
          push('output', `launching ${target}…`)
          openApp(target)
          if (target === 'finder') unlock('explorer')
        } else {
          push(
            'output',
            `open: unknown app '${args[0] ?? ''}'. try: assistant, projects, finder, settings`,
          )
        }
        break
      }
      case 'clear':
        setLines([])
        break
      case 'logout':
        push('output', 'ending session…')
        logout()
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
      className="nexus-scrollbar h-full overflow-x-auto overflow-y-auto bg-[oklch(0.13_0.004_270)] p-3 font-mono text-xs leading-relaxed sm:p-4 sm:text-[13px]"
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap break-words">
          {line.type === 'input' ? (
            <div className="flex gap-2">
              <span className="text-primary">{profile.handle}@nexus</span>
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
        <span className="text-primary">{profile.handle}@nexus</span>
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
