'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { APPS, APP_ORDER, type AppId } from '@/lib/os-data'
import { cn } from '@/lib/utils'
import { AppIcon } from './app-icons'
import { useOS } from './os-context'
import { useReducedMotion } from './settings-context'

interface MissionControlContextValue {
  active: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const MissionControlContext = createContext<MissionControlContextValue | null>(
  null,
)

export function MissionControlProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)

  const value = useMemo<MissionControlContextValue>(
    () => ({
      active,
      open: () => setActive(true),
      close: () => setActive(false),
      toggle: () => setActive((v) => !v),
    }),
    [active],
  )

  return (
    <MissionControlContext.Provider value={value}>
      {children}
      <MissionControlOverlay />
    </MissionControlContext.Provider>
  )
}

export function useMissionControl() {
  const ctx = useContext(MissionControlContext)
  if (!ctx) {
    throw new Error(
      'useMissionControl must be used within MissionControlProvider',
    )
  }
  return ctx
}

function gridColumns(count: number): string {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  return 'grid-cols-2 lg:grid-cols-3'
}

function MissionControlOverlay() {
  const { active, close } = useMissionControl()
  const { windows, focusApp, openApp, closeApp } = useOS()
  const reducedMotion = useReducedMotion()
  const [previews, setPreviews] = useState<Partial<Record<AppId, string>>>({})

  const openWindows = windows

  // Snapshot the live content of each visible window when Mission Control opens.
  // The windows stay mounted behind the overlay, so they capture real state.
  useEffect(() => {
    if (!active) {
      setPreviews({})
      return
    }

    let cancelled = false
    const capture = async () => {
      const { toPng } = await import('html-to-image')
      for (const win of windows) {
        if (cancelled) return
        if (win.minimized) continue
        const node = document.querySelector(
          `[data-window-id="${win.id}"]`,
        ) as HTMLElement | null
        if (!node || node.clientWidth === 0) continue
        try {
          const dataUrl = await toPng(node, {
            width: node.clientWidth,
            height: node.clientHeight,
            pixelRatio: 0.6,
            cacheBust: true,
            backgroundColor: 'transparent',
          })
          if (!cancelled) {
            setPreviews((prev) => ({ ...prev, [win.id]: dataUrl }))
          }
        } catch {
          // iframes / tainted canvases can't be captured — fall back to icon.
        }
      }
    }

    void capture()
    return () => {
      cancelled = true
    }
  }, [active, windows])

  const handleSelect = (id: AppId) => {
    focusApp(id)
    close()
  }

  const handleLaunch = (id: AppId) => {
    openApp(id)
    close()
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-88 flex flex-col bg-black/70 backdrop-blur-xl"
          onClick={close}
        >
          <div className="flex items-center justify-center pt-[calc(2.75rem+env(safe-area-inset-top))]">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Mission Control
            </p>
          </div>

          {/* Window previews */}
          <div className="flex flex-1 items-center justify-center overflow-auto px-6 py-6">
            {openWindows.length === 0 ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground"
              >
                No open windows — launch an app below.
              </motion.p>
            ) : (
              <div
                className={cn(
                  'grid w-full max-w-5xl gap-4 sm:gap-6',
                  gridColumns(openWindows.length),
                )}
              >
                {openWindows.map((win, i) => {
                  const meta = APPS[win.id]
                  return (
                    <motion.button
                      key={win.id}
                      type="button"
                      initial={
                        reducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 18, scale: 0.96 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: reducedMotion ? 0 : 0.04 * i,
                        type: 'spring',
                        stiffness: 260,
                        damping: 24,
                      }}
                      whileHover={reducedMotion ? undefined : { y: -4, scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(win.id)
                      }}
                      className="group/card relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-2xl shadow-black/40 outline-none ring-primary/50 focus-visible:ring-2"
                    >
                      {/* faux title bar */}
                      <div className="flex items-center gap-2 border-b border-border bg-card/80 px-3 py-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                        <span className="ml-1 truncate text-[11px] font-medium text-muted-foreground">
                          {meta.name}
                          {win.minimized && ' · minimized'}
                        </span>

                        <span
                          role="button"
                          tabIndex={-1}
                          aria-label={`Close ${meta.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            closeApp(win.id)
                          }}
                          className="ml-auto flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover/card:opacity-100"
                        >
                          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                            <path
                              d="M2.5 2.5l5 5M7.5 2.5l-5 5"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </div>

                      {/* body preview — live snapshot when available */}
                      <div className="relative h-32 overflow-hidden bg-[oklch(0.16_0.004_270)] sm:h-36">
                        {previews[win.id] && !win.minimized ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={previews[win.id]}
                            alt={`${meta.name} preview`}
                            className="h-full w-full object-cover object-top"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center gap-3 p-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-primary">
                              <AppIcon id={win.id} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {meta.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {win.minimized ? 'Minimized' : meta.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Launcher strip */}
          <div className="flex items-center justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card/70 p-2 backdrop-blur-xs">
              {APP_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Open ${APPS[id].name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLaunch(id)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-foreground/70 transition-colors hover:border-border hover:bg-secondary hover:text-foreground"
                >
                  <AppIcon id={id} />
                </button>
              ))}
            </div>
          </div>

          <p className="pointer-events-none pb-3 text-center text-[11px] text-muted-foreground">
            Swipe down with two fingers · or press{' '}
            <span className="font-mono text-primary">Esc</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
