'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useOS } from './os-context'
import { AppWindow } from './app-window'
import { MenuBar } from './menu-bar'
import { Dock } from './dock'
import { APP_ORDER, APPS, PROFILE, type AppId } from '@/lib/os-data'
import { TerminalApp } from '../apps/terminal-app'
import { AssistantApp } from '../apps/assistant-app'
import { ProjectsApp } from '../apps/projects-app'
import { ExperienceApp } from '../apps/experience-app'
import { ContactApp } from '../apps/contact-app'

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
  }
}

export function Desktop() {
  const { windows, openApp } = useOS()
  const hasWindows = windows.length > 0

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background nexus-grid">
      <MenuBar />

      {/* ambient corner glow, subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <AnimatePresence>
        {!hasWindows && <WelcomePanel onOpen={openApp} />}
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

function WelcomePanel({ onOpen }: { onOpen: (id: AppId) => void }) {
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
            {PROFILE.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{PROFILE.role}</p>
          <p className="mt-4 max-w-prose text-pretty text-sm leading-relaxed text-foreground/70">
            {PROFILE.bio}
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
          Tip: open the Terminal and type{' '}
          <span className="font-mono text-primary">help</span>, or chat with the
          Assistant.
        </motion.p>
      </div>
    </motion.div>
  )
}
