'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOS } from './os-context'
import { usePortfolio } from './portfolio-context'
import { useAchievements } from './achievements-context'
import { APPS, APP_ORDER } from '@/lib/os-data'
import { flattenFiles, buildContentTree } from '@/lib/content/files'
import { cn } from '@/lib/utils'

export interface CommandPaletteItem {
  id: string
  label: string
  group: string
  keywords?: string
  action: () => void
}

interface CommandPaletteContextValue {
  open: boolean
  openPalette: () => void
  closePalette: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(
    () => ({
      open,
      openPalette: () => setOpen(true),
      closePalette: () => setOpen(false),
    }),
    [open],
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPaletteOverlay />
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return ctx
}

function CommandPaletteOverlay() {
  const { open, closePalette } = useCommandPalette()
  const { openApp } = useOS()
  const portfolio = usePortfolio()
  const { unlock } = useAchievements()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<CommandPaletteItem[]>(() => {
    const list: CommandPaletteItem[] = []

    for (const id of APP_ORDER) {
      const meta = APPS[id]
      list.push({
        id: `app-${id}`,
        label: `Open ${meta.name}`,
        group: 'Applications',
        keywords: `${meta.name} ${meta.description}`,
        action: () => openApp(id),
      })
    }

    for (const project of portfolio.projects) {
      list.push({
        id: `project-${project.id}`,
        label: project.name,
        group: 'Projects',
        keywords: `${project.category} ${project.stack.join(' ')}`,
        action: () => openApp('projects', { project: project.id }),
      })
    }

    const files = flattenFiles(buildContentTree(portfolio))
    for (const file of files) {
      list.push({
        id: `file-${file.path}`,
        label: file.path,
        group: 'Files',
        keywords: file.name,
        action: () => openApp('finder', { file: file.path }),
      })
    }

    list.push(
      {
        id: 'recruiter',
        label: 'Open Recruiter Mode',
        group: 'Assistant',
        keywords: 'ai hire job match',
        action: () => openApp('assistant', { mode: 'recruiter' }),
      },
      {
        id: 'cmd-help',
        label: 'Open Terminal',
        group: 'Commands',
        keywords: 'terminal shell help',
        action: () => openApp('terminal'),
      },
    )

    return list
  }, [openApp, portfolio])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items.slice(0, 12)
    return items
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q) ||
          item.keywords?.toLowerCase().includes(q),
      )
      .slice(0, 12)
  }, [items, query])

  useEffect(() => {
    if (open) {
      unlock('spotlight')
      setQuery('')
      setIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open, unlock])

  useEffect(() => setIndex(0), [query])

  const run = useCallback(
    (item: CommandPaletteItem) => {
      item.action()
      closePalette()
    },
    [closePalette],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && filtered[index]) {
      e.preventDefault()
      run(filtered[index])
    } else if (e.key === 'Escape') {
      closePalette()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/40 backdrop-blur-sm"
            onClick={closePalette}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="fixed top-[6%] left-1/2 z-[86] w-[min(calc(100vw-1rem),560px)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover/95 shadow-2xl shadow-black/50 backdrop-blur-xl sm:top-[14%]"
          >
            <div className="border-b border-border px-4 py-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search apps, projects, files, commands…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                ⌘K · Spotlight
              </p>
            </div>
            <ul className="max-h-80 overflow-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results
                </li>
              ) : (
                filtered.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => run(item)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        i === index
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary/70',
                      )}
                    >
                      <span>
                        <span className="block font-medium">{item.label}</span>
                        <span
                          className={cn(
                            'text-[11px]',
                            i === index
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          {item.group}
                        </span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
