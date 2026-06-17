'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { useOS, type WindowState } from './os-context'
import { APPS, type AppId } from '@/lib/os-data'
import { cn } from '@/lib/utils'

interface AppWindowProps {
  win: WindowState
  children: ReactNode
}

export function AppWindow({ win, children }: AppWindowProps) {
  const { focusApp, closeApp, minimizeApp, toggleMaximize, moveWindow, activeId } =
    useOS()
  const meta = APPS[win.id as AppId]
  const active = activeId === win.id
  const dragControls = useDragControls()
  const [bounds, setBounds] = useState({ w: 1200, h: 800 })

  useEffect(() => {
    const update = () =>
      setBounds({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (win.minimized) return null

  const maximized = win.maximized
  const style = maximized
    ? { left: 12, top: 44, width: bounds.w - 24, height: bounds.h - 110 }
    : { left: win.x, top: win.y, width: win.w, height: win.h }

  return (
    <motion.div
      drag={!maximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={{
        left: -win.x + 4,
        top: -win.y + 40,
        right: Math.max(0, bounds.w - win.x - 100),
        bottom: Math.max(0, bounds.h - win.y - 120),
      }}
      onDragEnd={(_, info) => {
        moveWindow(win.id, win.x + info.offset.x, win.y + info.offset.y)
      }}
      className="absolute"
      style={{ zIndex: win.z }}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        left: style.left,
        top: style.top,
        width: style.width,
        height: style.height,
      }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      onMouseDown={() => focusApp(win.id)}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card shadow-2xl',
          active
            ? 'border-border shadow-black/50 ring-1 ring-primary/10'
            : 'border-border/60 shadow-black/30',
        )}
      >
        <div
          onPointerDown={(e) => {
            if (!maximized) dragControls.start(e)
            focusApp(win.id)
          }}
          className={cn(
            'flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 select-none',
            active ? 'bg-card' : 'bg-card/70',
            maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
          )}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => closeApp(win.id)}
              aria-label="Close window"
              className="group flex h-3 w-3 items-center justify-center rounded-full bg-destructive/90"
            >
              <span className="text-[9px] leading-none text-black/0 group-hover:text-black/60">
                ×
              </span>
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => minimizeApp(win.id)}
              aria-label="Minimize window"
              className="h-3 w-3 rounded-full bg-amber-400/90"
            />
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => toggleMaximize(win.id)}
              aria-label="Maximize window"
              className="h-3 w-3 rounded-full bg-emerald-400/90"
            />
          </div>
          <div className="pointer-events-none flex flex-1 items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="font-mono text-[10px] text-primary/80">
              {meta.glyph}
            </span>
            <span>{meta.name}</span>
          </div>
          <div className="w-12" />
        </div>
        <div className="nexus-scrollbar min-h-0 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
