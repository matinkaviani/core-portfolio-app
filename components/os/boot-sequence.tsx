'use client'

import { setStoredVisitor } from '@/lib/os/session'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './settings-context'

const BOOT_LINES = [
  'CORE OS v2.4.1 — initializing',
  'mounting /portfolio ........... ok',
  'loading interface kernel ...... ok',
  'starting window manager ....... ok',
  'spawning ai-assistant daemon .. ok',
  'indexing projects + experience  ok',
  'establishing secure session ... ok',
]

interface BootSequenceProps {
  onComplete: (visitorName: string) => void
  ownerName: string
  skipBoot?: boolean
}

export function BootSequence({
  onComplete,
  ownerName,
  skipBoot = false,
}: BootSequenceProps) {
  const [phase, setPhase] = useState<'boot' | 'login' | 'exit'>(skipBoot ? 'login' : 'boot')
  const [visibleLines, setVisibleLines] = useState(skipBoot ? BOOT_LINES.length : 0)
  const [progress, setProgress] = useState(skipBoot ? 100 : 0)
  const [visitorName, setVisitorName] = useState('')
  const doneRef = useRef(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (skipBoot || phase !== 'boot') return

    if (reducedMotion) {
      setVisibleLines(BOOT_LINES.length)
      setProgress(100)
      setPhase('login')
      return
    }

    let raf = 0
    const lineTimers: ReturnType<typeof setTimeout>[] = []

    BOOT_LINES.forEach((_, i) => {
      lineTimers.push(
        setTimeout(() => setVisibleLines((v) => Math.max(v, i + 1)), 180 + i * 200),
      )
    })

    const start = performance.now()
    const duration = 1900
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / duration) * 100)
      setProgress(pct)
      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else if (!doneRef.current) {
        doneRef.current = true
        setPhase('login')
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      lineTimers.forEach(clearTimeout)
    }
  }, [phase, skipBoot, reducedMotion])

  const signIn = useCallback(() => {
    const name = visitorName.trim() || 'Guest'
    setStoredVisitor(name)
    setPhase('exit')
    setTimeout(() => onComplete(name), reducedMotion ? 0 : 520)
  }, [visitorName, onComplete, reducedMotion])

  useEffect(() => {
    if (phase !== 'login') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') signIn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, signIn])

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-background core-grid px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="w-full max-w-md px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-primary">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                  <path
                    d="M7 8l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 16h4"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  CORE
                </p>
                <p className="text-xs text-muted-foreground">Portfolio OS</p>
              </div>
            </motion.div>

            {phase === 'boot' ? (
              <>
                <div className="min-h-[150px] space-y-1.5 font-mono text-xs">
                  {BOOT_LINES.slice(0, visibleLines).map((line) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span className="text-primary">›</span>
                      <span>{line}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                    <span>booting</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  Login
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to explore {ownerName}&apos;s portfolio desktop.
                </p>
                <label className="mt-5 block text-xs font-medium text-muted-foreground">
                  Display name (optional)
                </label>
                <input
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Guest"
                  className="mt-1.5 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={signIn}
                  className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Enter desktop
                </button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Press Enter to continue
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
