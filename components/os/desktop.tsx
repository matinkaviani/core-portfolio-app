'use client'

import { APP_ORDER, APPS, type AppId } from '@/lib/os-data'
import { AnimatePresence, motion } from 'framer-motion'
import { AssistantApp } from '../apps/assistant-app'
import { ContactApp } from '../apps/contact-app'
import { ExperienceApp } from '../apps/experience-app'
import { FinderApp } from '../apps/finder-app'
import { ProjectsApp } from '../apps/projects-app'
import { SettingsApp } from '../apps/settings-app'
import { TerminalApp } from '../apps/terminal-app'
import { AppWindow } from './app-window'
import {
  isContextMenuExcluded,
  useContextMenu,
} from './context-menu'
import { Dock } from './dock'
import { MenuBar } from './menu-bar'
import { useOS } from './os-context'
import { usePortfolio } from './portfolio-context'
import { useSettings } from './settings-context'
import { useDeepLinks } from './use-deep-links'
import { useGlobalShortcuts } from './use-global-shortcuts'
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
    case 'contact':
      return <ContactApp />
    case 'finder':
      return <FinderApp />
    case 'settings':
      return <SettingsApp />
  }
}

function wallpaperClass(wallpaper: string) {
  if (wallpaper === 'gradient') return 'nexus-wallpaper-gradient'
  if (wallpaper === 'aurora') return 'nexus-wallpaper-aurora'
  return 'nexus-wallpaper-solid'
}

export function Desktop({
  visitorName,
  ownerName,
}: {
  visitorName: string
  ownerName: string
}) {
  const { windows, openApp } = useOS()
  const { profile } = usePortfolio()
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
        <div aria-hidden className="nexus-grid pointer-events-none absolute inset-0" />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <AnimatePresence>
        {!hasWindows && (
          <WelcomePanel
            profile={profile}
            visitorName={visitorName}
            ownerName={ownerName}
            onOpen={(id) => openApp(id)}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pt-9">
        <AnimatePresence>
          {windows.map((win) => (
            <AppWindow key={win.id} win={win}>
              {renderApp(win.id)}
            </AppWindow>
          ))}
        </AnimatePresence>
      </div>

      <Dock />
    </main>
  )
}

function WelcomePanel({
  profile,
  visitorName,
  ownerName,
  onOpen,
}: {
  profile: { name: string; role: string; bio: string }
  visitorName: string
  ownerName: string
  onOpen: (id: AppId) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-10 flex items-center justify-center px-6"
    >
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            NEXUS · Portfolio OS
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{profile.role}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="text-foreground">{visitorName}</span> ·{' '}
            {ownerName}&apos;s desktop
          </p>
          <p className="mt-4 max-w-prose text-pretty text-sm leading-relaxed text-foreground/70">
            {profile.bio}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {APP_ORDER.map((id) => {
            const meta = APPS[id]
            return (
              <button
                key={id}
                type="button"
                onClick={() => onOpen(id)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-card"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-mono text-xs font-semibold text-primary">
                  {meta.glyph}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {meta.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
              </button>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          Tip: press <span className="font-mono text-primary">⌘K</span> for
          Spotlight, or open the Terminal and type{' '}
          <span className="font-mono text-primary">help</span>.
        </motion.p>
      </div>
    </motion.div>
  )
}
