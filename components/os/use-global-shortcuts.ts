'use client'

import { useEffect } from 'react'
import { APP_ORDER, type AppId } from '@/lib/os-data'
import { useOS } from './os-context'
import { useAchievements } from './achievements-context'
import { useCommandPalette } from './command-palette'
import { useContextMenu } from './context-menu'
import { useMissionControl } from './mission-control'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

export function useGlobalShortcuts(enabled: boolean) {
  const { openApp, closeApp, activeId, windows } = useOS()
  const { unlock } = useAchievements()
  const { open, openPalette, closePalette } = useCommandPalette()
  const { isOpen: contextMenuOpen, closeContextMenu } = useContextMenu()
  const missionControl = useMissionControl()

  useEffect(() => {
    if (!enabled) return

    let konamiIndex = 0

    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      const typing = isEditableTarget(e.target)

      // ⌘J — command palette / Spotlight (⌘K is hijacked by Chrome to focus
      // the address bar and can't be reliably intercepted).
      if (meta && !e.shiftKey && key === 'j') {
        e.preventDefault()
        e.stopPropagation()
        openPalette()
        return
      }

      // ⌃↑ open Mission Control · ⌃↓ close · F3 toggle
      if (e.ctrlKey && !e.metaKey && key === 'arrowup' && !typing) {
        e.preventDefault()
        e.stopPropagation()
        missionControl.open()
        return
      }
      if (
        (e.ctrlKey && !e.metaKey && key === 'arrowdown' && !typing) ||
        key === 'f3'
      ) {
        e.preventDefault()
        e.stopPropagation()
        if (key === 'f3') missionControl.toggle()
        else missionControl.close()
        return
      }

      if (e.key === 'Escape') {
        if (missionControl.active) {
          e.preventDefault()
          e.stopPropagation()
          missionControl.close()
          return
        }
        if (open) {
          e.preventDefault()
          e.stopPropagation()
          closePalette()
          return
        }
        if (contextMenuOpen) {
          e.preventDefault()
          e.stopPropagation()
          closeContextMenu()
          return
        }
        if (activeId) {
          e.preventDefault()
          e.stopPropagation()
          closeApp(activeId)
          return
        }
      }

      // ⌘⇧L — terminal (avoids browser-reserved ⌘T / ⌘L)
      if (meta && e.shiftKey && key === 'l' && !typing) {
        e.preventDefault()
        e.stopPropagation()
        openApp('terminal')
        return
      }

      // ⌘⇧K — assistant (⌘⇧A is Chrome's "Search tabs")
      if (meta && e.shiftKey && key === 'k' && !typing) {
        e.preventDefault()
        e.stopPropagation()
        openApp('assistant')
        return
      }

      // Note: ⌘W (close window) is intentionally NOT bound — Chrome reserves it
      // to close the tab and ignores preventDefault. Use Esc to close the
      // active window instead (handled above).

      const expected = KONAMI[konamiIndex]
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konamiIndex += 1
        if (konamiIndex === KONAMI.length) {
          konamiIndex = 0
          unlock('konami')
          openApp('settings')
        }
      } else {
        konamiIndex = e.key === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [
    enabled,
    open,
    openPalette,
    closePalette,
    contextMenuOpen,
    closeContextMenu,
    openApp,
    closeApp,
    activeId,
    unlock,
    missionControl,
  ])

  // Trackpad swipe: two-finger swipe up opens Mission Control, swipe down closes.
  // (Browsers can't read true three-finger gestures — those are captured by the OS —
  // so we use the wheel stream that trackpad swipes actually produce.)
  useEffect(() => {
    if (!enabled) return

    const TRIGGER = 140
    const IDLE_RESET_MS = 220
    let accUp = 0
    let accDown = 0
    let lastAt = 0

    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      if (now - lastAt > IDLE_RESET_MS) {
        accUp = 0
        accDown = 0
      }
      lastAt = now

      if (missionControl.active) {
        // swipe down to dismiss (natural scrolling → deltaY < 0)
        if (e.deltaY < 0) {
          accDown += -e.deltaY
          accUp = 0
          if (accDown > TRIGGER) {
            missionControl.close()
            accDown = 0
          }
        } else {
          accUp = 0
          accDown = 0
        }
        return
      }

      // Only open from the desktop background (ignore scrolling inside windows),
      // and only when there is at least one window to manage.
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-core-window]')) {
        accUp = 0
        return
      }
      if (windows.length === 0) {
        accUp = 0
        return
      }

      // swipe up to open (natural scrolling → deltaY > 0)
      if (e.deltaY > 0) {
        accUp += e.deltaY
        accDown = 0
        if (accUp > TRIGGER) {
          missionControl.open()
          accUp = 0
        }
      } else {
        accUp = 0
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [enabled, missionControl, windows.length])

  useEffect(() => {
    if (!enabled) return
    const opened = new Set(windows.map((w) => w.id))
    const hasAll = APP_ORDER.every((id: AppId) => opened.has(id))
    if (hasAll) unlock('all_apps')
  }, [enabled, windows, unlock])
}
