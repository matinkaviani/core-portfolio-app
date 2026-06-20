'use client'

import { APPS, APP_ORDER } from '@/lib/os-data'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useContextMenu } from './context-menu'
import { useOS } from './os-context'

export function Dock() {
  const { openApp, isOpen, activeId, focusApp } = useOS()
  const { openContextMenu } = useContextMenu()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center overflow-visible px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
      <motion.nav
        data-core-dock
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto flex items-end gap-0.5 overflow-visible rounded-2xl border border-border core-glass p-1.5 shadow-2xl shadow-black/40 sm:gap-1.5 sm:p-2 backdrop-blur-xs"
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
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openContextMenu(e.clientX, e.clientY, { type: 'dock', appId: id })
              }}
              className="group relative flex shrink-0 flex-col items-center overflow-visible"
              aria-label={`Open ${meta.name}`}
            >
              <motion.span
                whileHover={{ y: -6, scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border font-mono text-xs font-semibold transition-colors sm:h-12 sm:w-12 sm:text-sm',
                  active
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border bg-card text-foreground/80 group-hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    id === 'settings' && 'text-lg leading-none sm:text-[22px]',
                  )}
                >
                  {meta.glyph}
                </span>
              </motion.span>
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
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
