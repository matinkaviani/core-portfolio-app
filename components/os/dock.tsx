'use client'

import { motion } from 'framer-motion'
import { useOS } from './os-context'
import { APPS, APP_ORDER } from '@/lib/os-data'
import { cn } from '@/lib/utils'

export function Dock() {
  const { openApp, isOpen, activeId, focusApp } = useOS()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto flex items-end gap-1.5 rounded-2xl border border-border nexus-glass p-2 shadow-2xl shadow-black/40"
        aria-label="Application dock"
      >
        {APP_ORDER.map((id) => {
          const meta = APPS[id]
          const open = isOpen(id)
          const active = activeId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => (open ? focusApp(id) : openApp(id))}
              className="group relative flex flex-col items-center"
              aria-label={`Open ${meta.name}`}
            >
              <motion.span
                whileHover={{ y: -8, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border font-mono text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border bg-card text-foreground/80 group-hover:text-foreground',
                )}
              >
                {meta.glyph}
              </motion.span>
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {meta.name}
              </span>
              <span
                className={cn(
                  'mt-1 h-1 w-1 rounded-full transition-colors',
                  open ? 'bg-primary' : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
