'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const BOOT_LINES = [
  'NEXUS OS v2.4.1 — initializing',
  'mounting /portfolio ........... ok',
  'loading interface kernel ...... ok',
  'starting window manager ....... ok',
  'spawning ai-assistant daemon .. ok',
  'indexing projects + experience  ok',
  'establishing secure session ... ok',
]

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
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
        setExiting(true)
        setTimeout(onComplete, 620)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      lineTimers.forEach(clearTimeout)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background nexus-grid"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="w-full max-w-md px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card font-mono text-sm font-semibold text-primary">
                N
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  NEXUS
                </p>
                <p className="text-xs text-muted-foreground">Portfolio OS</p>
              </div>
            </motion.div>

            <div className="min-h-[150px] space-y-1.5 font-mono text-xs">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
