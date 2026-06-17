'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { useOS, type WindowState } from './os-context'
import { useContextMenu } from './context-menu'
import { APPS, type AppId } from '@/lib/os-data'
import { cn } from '@/lib/utils'

interface AppWindowProps {
  win: WindowState
  children: ReactNode
}

const MIN_W = 360
const MIN_H = 260

type ResizeDir = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw'

export function AppWindow({ win, children }: AppWindowProps) {
  const {
    focusApp,
    closeApp,
    minimizeApp,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    activeId,
  } = useOS()
  const { openContextMenu } = useContextMenu()
  const meta = APPS[win.id as AppId]
  const active = activeId === win.id
  const dragControls = useDragControls()
  const [bounds, setBounds] = useState({ w: 1200, h: 800 })
  const [resizing, setResizing] = useState(false)

  useEffect(() => {
    const update = () =>
      setBounds({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maximized = win.maximized

  function startResize(e: React.PointerEvent, dir: ResizeDir) {
    e.preventDefault()
    e.stopPropagation()
    focusApp(win.id)
    setResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const start = { x: win.x, y: win.y, w: win.w, h: win.h }
    const maxRight = bounds.w - 8
    const maxBottom = bounds.h - 8

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let { x, y, w, h } = start

      if (dir.includes('e')) {
        w = Math.min(maxRight - start.x, Math.max(MIN_W, start.w + dx))
      }
      if (dir.includes('s')) {
        h = Math.min(maxBottom - start.y, Math.max(MIN_H, start.h + dy))
      }
      if (dir.includes('w')) {
        const proposed = Math.max(MIN_W, start.w - dx)
        const clamped = Math.min(proposed, start.x + start.w - 40)
        x = start.x + (start.w - clamped)
        w = clamped
      }
      if (dir.includes('n')) {
        const proposed = Math.max(MIN_H, start.h - dy)
        const minTop = 40
        const clamped = Math.min(proposed, start.y + start.h - minTop)
        y = Math.max(minTop, start.y + (start.h - clamped))
        h = clamped
      }
      resizeWindow(win.id, { x, y, w, h })
    }

    function onUp() {
      setResizing(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  // Position is driven entirely by the x/y transform (the same channel drag
  // uses) so a leftover drag transform can never desync from left/top.
  // Maximized windows are centered in the usable area between the menu bar
  // (~36px) and the dock (~88px) with an equal 12px gap on every side.
  const MENU_BAR = 36
  const DOCK = 88
  const GAP = 12
  const geometry = maximized
    ? {
        x: GAP,
        y: MENU_BAR + GAP,
        width: bounds.w - GAP * 2,
        height: bounds.h - MENU_BAR - DOCK - GAP * 2,
      }
    : { x: win.x, y: win.y, width: win.w, height: win.h }

  // Minimize target: bottom-center (the dock), shrink + fade down into it.
  const minimizedAnim = {
    opacity: 0,
    scale: 0.18,
    x: bounds.w / 2 - 60,
    y: bounds.h - 40,
    width: 120,
    height: 80,
  }

  return (
    <motion.div
      data-nexus-window
      drag={!maximized && !resizing}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={{
        left: 4,
        top: 40,
        right: Math.max(4, bounds.w - 100),
        bottom: Math.max(40, bounds.h - 120),
      }}
      onDragEnd={(_, info) => {
        moveWindow(win.id, win.x + info.offset.x, win.y + info.offset.y)
      }}
      className={cn('absolute left-0 top-0', win.minimized && 'pointer-events-none')}
      style={{ zIndex: win.z }}
      initial={{ opacity: 0, scale: 0.96, ...geometry }}
      animate={
        win.minimized
          ? minimizedAnim
          : {
              opacity: 1,
              scale: 1,
              ...geometry,
            }
      }
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
      onMouseDown={() => !win.minimized && focusApp(win.id)}
    >
      <div
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card shadow-2xl',
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
          onDoubleClick={() => toggleMaximize(win.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            openContextMenu(e.clientX, e.clientY, {
              type: 'window',
              appId: win.id,
            })
          }}
          className={cn(
            'group/title flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 select-none',
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
              className="group flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-destructive/90 transition-transform hover:scale-110"
            >
              <svg
                viewBox="0 0 10 10"
                className="h-2 w-2 text-black/0 group-hover:text-black/60"
              >
                <path
                  d="M2.5 2.5l5 5M7.5 2.5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => minimizeApp(win.id)}
              aria-label="Minimize window"
              className="group flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-amber-400/90 transition-transform hover:scale-110"
            >
              <svg
                viewBox="0 0 10 10"
                className="h-2 w-2 text-black/0 group-hover:text-black/60"
              >
                <path
                  d="M2.2 5h5.6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => toggleMaximize(win.id)}
              aria-label={maximized ? 'Restore window' : 'Maximize window'}
              className="group flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-emerald-400/90 transition-transform hover:scale-110"
            >
              <svg
                viewBox="0 0 10 10"
                className="h-2 w-2 text-black/0 group-hover:text-black/60"
              >
                <path
                  d="M3 3h4v4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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

        {/* Resize handles — only when not maximized */}
        {!maximized && (
          <>
            <ResizeHandle dir="n" onStart={startResize} className="inset-x-3 top-0 h-1.5 cursor-ns-resize" />
            <ResizeHandle dir="s" onStart={startResize} className="inset-x-3 bottom-0 h-1.5 cursor-ns-resize" />
            <ResizeHandle dir="w" onStart={startResize} className="inset-y-3 left-0 w-1.5 cursor-ew-resize" />
            <ResizeHandle dir="e" onStart={startResize} className="inset-y-3 right-0 w-1.5 cursor-ew-resize" />
            <ResizeHandle dir="nw" onStart={startResize} className="left-0 top-0 h-3 w-3 cursor-nwse-resize" />
            <ResizeHandle dir="ne" onStart={startResize} className="right-0 top-0 h-3 w-3 cursor-nesw-resize" />
            <ResizeHandle dir="sw" onStart={startResize} className="bottom-0 left-0 h-3 w-3 cursor-nesw-resize" />
            <ResizeHandle dir="se" onStart={startResize} className="bottom-0 right-0 h-3 w-3 cursor-nwse-resize" />
          </>
        )}
      </div>
    </motion.div>
  )
}

function ResizeHandle({
  dir,
  onStart,
  className,
}: {
  dir: ResizeDir
  onStart: (e: React.PointerEvent, dir: ResizeDir) => void
  className: string
}) {
  return (
    <div
      onPointerDown={(e) => onStart(e, dir)}
      className={cn('absolute z-10 touch-none', className)}
      aria-hidden
    />
  )
}
