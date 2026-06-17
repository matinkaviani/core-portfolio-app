'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOS } from './os-context'
import { usePortfolio } from './portfolio-context'
import { useSession } from './session-context'
import { APPS, APP_ORDER, type AppId } from '@/lib/os-data'
import { useClickOutside } from '@/lib/use-click-outside'
import { cn } from '@/lib/utils'

function useClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

interface MenuItem {
  label: string
  shortcut?: string
  action?: () => void
  disabled?: boolean
  divider?: boolean
}

export function MenuBar() {
  const {
    activeId,
    windows,
    openApp,
    closeApp,
    minimizeApp,
    toggleMaximize,
    focusApp,
  } = useOS()
  const { profile } = usePortfolio()
  const { logout } = useSession()
  const now = useClock()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [widget, setWidget] = useState<null | 'clock'>(null)

  const activeName = activeId ? APPS[activeId].name : 'Finder'
  const hasActive = Boolean(activeId)

  const closeAll = useCallback(() => {
    setOpenMenu(null)
    setWidget(null)
  }, [])

  const menus = useMemo<Record<string, MenuItem[]>>(() => {
    return {
      [profile.name.split(' ')[0]]: [
        { label: 'About This Portfolio', action: () => openApp('experience') },
        { divider: true, label: '' },
        { label: 'View Projects', shortcut: '⌘1', action: () => openApp('projects') },
        { label: 'Contact', shortcut: '⌘2', action: () => openApp('contact') },
        { divider: true, label: '' },
        { label: 'Log Out', action: () => logout() },
      ],
      File: [
        { label: 'New Terminal', shortcut: '⌘T', action: () => openApp('terminal') },
        { label: 'New Assistant Chat', shortcut: '⌘N', action: () => openApp('assistant') },
        { divider: true, label: '' },
        {
          label: 'Close Window',
          shortcut: '⌘W',
          disabled: !hasActive,
          action: () => activeId && closeApp(activeId),
        },
      ],
      View: [
        {
          label: activeId && windows.find((w) => w.id === activeId)?.maximized
            ? 'Exit Full Screen'
            : 'Enter Full Screen',
          shortcut: '⌃⌘F',
          disabled: !hasActive,
          action: () => activeId && toggleMaximize(activeId),
        },
        {
          label: 'Minimize',
          shortcut: '⌘M',
          disabled: !hasActive,
          action: () => activeId && minimizeApp(activeId),
        },
      ],
      Window: [
        ...(windows.length
          ? windows.map((w) => ({
              label: `${w.minimized ? '— ' : ''}${APPS[w.id].name}`,
              action: () => focusApp(w.id),
            }))
          : [{ label: 'No Open Windows', disabled: true }]),
        { divider: true, label: '' },
        {
          label: 'Open All Apps',
          action: () => APP_ORDER.forEach((id: AppId) => openApp(id)),
        },
      ],
      Help: [
        { label: 'Open Terminal & type "help"', action: () => openApp('terminal') },
        { label: 'Ask the Assistant', action: () => openApp('assistant') },
        { divider: true, label: '' },
        { label: `Email ${profile.email}`, action: () => openApp('contact') },
      ],
    }
  }, [
    profile.name,
    profile.email,
    logout,
    activeId,
    windows,
    hasActive,
    openApp,
    closeApp,
    minimizeApp,
    toggleMaximize,
    focusApp,
  ])

  const menuRef = useClickOutside<HTMLDivElement>(openMenu !== null, closeAll)
  const widgetRef = useClickOutside<HTMLDivElement>(widget !== null, closeAll)

  const time = now
    ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '--:--'
  const day = now
    ? now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : ''

  const menuNames = Object.keys(menus)

  return (
    <header
      data-nexus-menubar
      className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-between border-b border-border nexus-glass px-3 text-xs"
    >
      <div ref={menuRef} className="flex items-center gap-1">
        <div className="flex items-center gap-2 px-2 font-semibold tracking-tight">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-primary font-mono text-[9px] font-bold text-primary-foreground">
            N
          </span>
          <span className="hidden text-foreground sm:inline">NEXUS</span>
        </div>

        {menuNames.map((name, i) => (
          <div key={name} className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((cur) => (cur === name ? null : name))
              }
              onPointerEnter={() => openMenu && setOpenMenu(name)}
              className={cn(
                'rounded-md px-2 py-1 font-medium transition-colors',
                i === 0 ? 'text-foreground' : 'text-muted-foreground',
                openMenu === name
                  ? 'bg-secondary text-foreground'
                  : 'hover:bg-secondary/60 hover:text-foreground',
                i > 1 ? 'hidden md:inline-block' : i > 0 ? 'hidden sm:inline-block' : '',
              )}
              aria-haspopup="menu"
              aria-expanded={openMenu === name}
            >
              {name}
            </button>

            <AnimatePresence>
              {openMenu === name && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.14, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-1 min-w-56 origin-top-left overflow-hidden rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                  {menus[name].map((item, idx) =>
                    item.divider ? (
                      <div
                        key={`d-${idx}`}
                        className="my-1 h-px bg-border"
                        role="separator"
                      />
                    ) : (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={() => {
                          item.action?.()
                          closeAll()
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors',
                          item.disabled
                            ? 'cursor-not-allowed text-muted-foreground/40'
                            : 'cursor-pointer text-popover-foreground hover:bg-primary hover:text-primary-foreground',
                        )}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="font-mono text-[11px] opacity-60">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-muted-foreground sm:inline">
          {activeName}
        </span>
        <div ref={widgetRef} className="relative">
          <button
            type="button"
            onClick={() => setWidget((cur) => (cur ? null : 'clock'))}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1 font-medium transition-colors',
              widget
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            aria-haspopup="dialog"
            aria-expanded={widget !== null}
            aria-label="Open date and time"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="tabular-nums text-foreground">{time}</span>
          </button>

          <AnimatePresence>
            {widget === 'clock' && now && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-1 w-72 origin-top-right overflow-hidden rounded-xl border border-border bg-popover/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl"
              >
                <ClockWidget now={now} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function ClockWidget({ now }: { now: Date }) {
  const fullTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const fullDate = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = now.toLocaleDateString([], { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="text-center">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {fullTime}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{fullDate}</p>
      </div>

      <div className="my-3 h-px bg-border" />

      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-primary">
        {monthName}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="py-1 text-muted-foreground/60">
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={cn(
              'flex h-7 items-center justify-center rounded-md tabular-nums',
              d === null && 'opacity-0',
              d === today
                ? 'bg-primary font-semibold text-primary-foreground'
                : 'text-foreground/80',
            )}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}
