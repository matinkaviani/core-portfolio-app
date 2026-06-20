'use client'

import { useEffect, useState } from 'react'
import {
  type AppId,
  type ProjectItem,
} from '@/lib/os-data'
import type {
  PortfolioProfile,
  SkillCategory,
} from '@/lib/content/load-portfolio'
import { AnimatePresence, motion } from 'framer-motion'
import { AssistantApp } from '../apps/assistant-app'
import { ContactApp } from '../apps/contact-app'
import { ExperienceApp } from '../apps/experience-app'
import { FinderApp } from '../apps/finder-app'
import { ProjectsApp } from '../apps/projects-app'
import { ResumeApp } from '../apps/resume-app'
import { SettingsApp } from '../apps/settings-app'
import { TerminalApp } from '../apps/terminal-app'
import { AppWindow } from './app-window'
import {
  isContextMenuExcluded,
  useContextMenu,
} from './context-menu'
import { Dock } from './dock'
import { LiveCursors } from './live-cursors'
import { MenuBar } from './menu-bar'
import { useOS } from './os-context'
import { usePortfolio } from './portfolio-context'
import { useSettings, useReducedMotion } from './settings-context'
import { useDeepLinks } from './use-deep-links'
import { useGlobalShortcuts } from './use-global-shortcuts'
import { useVisitorLocation } from './use-visitor-location'
import { cn } from '@/lib/utils'

function renderApp(id: AppId) {
  switch (id) {
    case 'terminal':
      return <TerminalApp />
    case 'assistant':
      return <AssistantApp />
    case 'projects':
      return <ProjectsApp />
    case 'experience':
      return <ExperienceApp />
    case 'resume':
      return <ResumeApp />
    case 'contact':
      return <ContactApp />
    case 'finder':
      return <FinderApp />
    case 'settings':
      return <SettingsApp />
  }
}

function wallpaperClass(wallpaper: string) {
  if (wallpaper === 'gradient') return 'core-wallpaper-gradient'
  if (wallpaper === 'aurora') return 'core-wallpaper-aurora'
  return 'core-wallpaper-solid'
}

export function Desktop({
  visitorName,
  ownerName,
}: {
  visitorName: string
  ownerName: string
}) {
  const { windows, openApp } = useOS()
  const portfolio = usePortfolio()
  const { settings } = useSettings()
  const { openContextMenu } = useContextMenu()
  const hasWindows = windows.length > 0

  useDeepLinks(true)
  useGlobalShortcuts(true)

  const onDesktopContextMenu = (e: React.MouseEvent) => {
    if (isContextMenuExcluded(e.target)) return
    e.preventDefault()
    openContextMenu(e.clientX, e.clientY, { type: 'desktop' })
  }

  return (
    <main
      className={cn(
        'relative h-dvh w-full overflow-hidden bg-background',
        wallpaperClass(settings.wallpaper),
      )}
      onContextMenu={onDesktopContextMenu}
    >
      <MenuBar />

      {settings.showGrid && (
        <div aria-hidden className="core-grid pointer-events-none absolute inset-0" />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <AnimatePresence>
        {!hasWindows && (
          <WelcomePanel
            profile={portfolio.profile}
            projects={portfolio.projects}
            skills={portfolio.skills}
            visitorName={visitorName}
            ownerName={ownerName}
            onOpen={(id) => openApp(id)}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pt-[calc(2.25rem+env(safe-area-inset-top))]">
        <AnimatePresence>
          {windows.map((win) => (
            <AppWindow key={win.id} win={win}>
              {renderApp(win.id)}
            </AppWindow>
          ))}
        </AnimatePresence>
      </div>

      <Dock />

      <LiveCursors />
    </main>
  )
}

const PRIMARY_ACTIONS: { id: AppId; label: string; hint: string }[] = [
  { id: 'terminal', label: 'Open Terminal', hint: '⌘⇧L' },
  { id: 'assistant', label: 'Ask the AI', hint: '⌘⇧A' },
  { id: 'projects', label: 'View Work', hint: '' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
} as const

function WelcomePanel({
  profile,
  projects,
  skills,
  visitorName,
  ownerName,
  onOpen,
}: {
  profile: PortfolioProfile
  projects: ProjectItem[]
  skills: SkillCategory[]
  visitorName: string
  ownerName: string
  onOpen: (id: AppId) => void
}) {
  const reducedMotion = useReducedMotion()
  const { location: visitorLocation, loading: visitorLocationLoading } =
    useVisitorLocation()
  const totalSkills = skills.reduce((n, c) => n + c.skills.length, 0)
  const focusWords = skills
    .map((c) => c.skills[0])
    .filter((s): s is string => Boolean(s))
  const liveProjects = projects.filter((p) => p.status === 'Live').length
  const social = [
    profile.links.github && {
      label: 'GitHub',
      href: `https://${profile.links.github}`,
    },
    profile.links.linkedin && {
      label: 'LinkedIn',
      href: `https://${profile.links.linkedin}`,
    },
    profile.email && {
      label: 'Email',
      href: `mailto:${profile.email}`,
    },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.5 }}
      className="core-scrollbar absolute inset-0 z-10 overflow-x-hidden overflow-y-auto px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(2.75rem+env(safe-area-inset-top)+0.75rem)] sm:px-6 sm:pb-32 sm:pt-[calc(3.5rem+env(safe-area-inset-top))] lg:flex lg:items-center lg:justify-center lg:overflow-hidden lg:px-6 lg:pb-28 lg:pt-16"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid w-full max-w-5xl gap-5 py-2 sm:gap-6 sm:py-4 lg:grid-cols-5 lg:items-center lg:gap-6 lg:py-0"
      >
        {/* System console — shown first on mobile for quick glance */}
        <motion.div variants={item} className="order-1 lg:order-2 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border core-glass shadow-xl shadow-black/30 sm:rounded-2xl sm:shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 sm:px-4 sm:py-2.5">
              <span className="h-2 w-2 rounded-full bg-destructive/70 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70 sm:h-2.5 sm:w-2.5" />
              <span className="ml-1 font-mono text-[10px] text-muted-foreground sm:ml-2 sm:text-[11px]">
                system.status
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <Clock />

              <StatsPanel
                projects={projects.length}
                live={liveProjects}
                skills={totalSkills}
                stacks={skills.length}
              />

              <div className="mt-3 hidden space-y-1 font-mono text-[11px] sm:mt-4 sm:block sm:space-y-1.5">
                <InfoRow label="user" value={visitorName} />
                <InfoRow label="host" value={`${ownerName.split(' ')[0]}-os`} />
                <InfoRow
                  label="location"
                  value={
                    visitorLocationLoading
                      ? 'Detecting…'
                      : (visitorLocation?.label ?? 'Unknown')
                  }
                />
              </div>
            </div>
          </div>

          <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:mt-3 md:block">
            <span className="md:hidden">Tap </span>
            <span className="hidden md:inline">Press </span>
            <span className="font-mono text-primary">⌘K</span>
            <span className="hidden md:inline"> for Spotlight</span>
            <span className="md:hidden"> in the menu bar for Spotlight</span>
          </p>
        </motion.div>

        {/* Identity */}
        <div className="order-2 lg:order-1 lg:col-span-3">
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-2 font-mono text-[10px] sm:gap-3 sm:text-[11px]"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300 sm:gap-2 sm:px-2.5 sm:py-1">
              <span className="relative flex h-1.5 w-1.5">
                {!reducedMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              ONLINE
            </span>
            <span className="hidden uppercase tracking-[0.2em] text-muted-foreground sm:inline">
              CORE · Portfolio OS
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:mt-5 sm:text-4xl lg:text-6xl"
          >
            <span className="bg-linear-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
              {profile.name}
            </span>
            <span
              className={cn(
                'ml-0.5 inline-block h-[0.78em] w-[3px] translate-y-[0.08em] bg-primary align-middle sm:ml-1',
                !reducedMotion && 'animate-pulse',
              )}
            />
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-2 text-base text-muted-foreground sm:mt-3 sm:text-xl"
          >
            {profile.role}
          </motion.p>

          {focusWords.length > 0 && (
            <motion.div
              variants={item}
              className="mt-3 flex items-center gap-2 font-mono text-xs sm:mt-4 sm:text-sm"
            >
              <span className="text-primary/70">{'>'}</span>
              <span className="text-muted-foreground">focus:</span>
              <RotatingText words={focusWords} />
            </motion.div>
          )}

          <motion.p
            variants={item}
            className="mt-4 line-clamp-4 max-w-prose text-pretty text-sm leading-relaxed text-foreground/70 sm:mt-5 sm:line-clamp-none"
          >
            {profile.bio}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-5 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap"
          >
            {PRIMARY_ACTIONS.map((action, i) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onOpen(action.id)}
                className={cn(
                  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all sm:w-auto sm:justify-start sm:py-2 hover:sm:-translate-y-0.5',
                  i === 0
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'border border-border bg-card/60 text-foreground/80 hover:border-primary/40 hover:text-foreground',
                )}
              >
                {action.label}
                {action.hint && (
                  <span
                    className={cn(
                      'hidden rounded px-1.5 py-0.5 font-mono text-[10px] sm:inline',
                      i === 0
                        ? 'bg-primary-foreground/15 text-primary-foreground/90'
                        : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {action.hint}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {social.length > 0 && (
            <motion.div
              variants={item}
              className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:flex sm:flex-wrap"
            >
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:min-h-0 sm:justify-start sm:py-1.5"
                >
                  {s.label}
                  <span aria-hidden className="text-[10px] text-primary/70">
                    ↗
                  </span>
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatsPanel({
  projects,
  live,
  skills,
  stacks,
}: {
  projects: number
  live: number
  skills: number
  stacks: number
}) {
  const stats = [
    { label: 'Projects', value: projects, note: 'selected work' },
    { label: 'Live', value: live, note: 'in production' },
    { label: 'Skills', value: skills, note: 'across stacks' },
    { label: 'Stacks', value: stacks, note: 'categories' },
  ]

  return (
    <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-border">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center rounded-lg border border-border bg-card/80 p-2 text-center sm:min-h-[5.5rem] sm:items-stretch sm:rounded-none sm:border-0 sm:p-3.5 sm:text-left"
        >
          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[10px]">
            {stat.label}
          </p>
          <p className="mt-1 font-mono text-xl font-semibold leading-none tracking-tight text-foreground tabular-nums sm:mt-2 sm:text-3xl">
            {stat.value}
          </p>
          <p className="mt-0.5 hidden text-[10px] leading-tight text-muted-foreground/80 sm:block">
            {stat.note}
          </p>
        </div>
      ))}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate pl-2 text-foreground/90">{value}</span>
    </div>
  )
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeShort = now
    ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'
  const timeFull = now
    ? now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--'
  const date = now
    ? now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <>
      <div className="flex items-baseline justify-between gap-2 sm:hidden">
        <p className="font-mono text-lg font-semibold tracking-tight text-foreground tabular-nums">
          {timeShort}
        </p>
        <p className="text-[11px] text-muted-foreground">{date}</p>
      </div>
      <div className="hidden sm:block">
        <p className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums lg:text-3xl">
          {timeFull}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>
      </div>
    </>
  )
}

function RotatingText({ words }: { words: string[] }) {
  const reducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      2200,
    )
    return () => clearInterval(timer)
  }, [words.length, reducedMotion])

  if (reducedMotion) {
    return <span className="text-primary">{words[0]}</span>
  }

  return (
    <span className="relative inline-flex h-5 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-primary"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
