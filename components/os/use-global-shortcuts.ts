'use client'

import { useEffect } from 'react'
import { APP_ORDER, type AppId } from '@/lib/os-data'
import { useOS } from './os-context'
import { useAchievements } from './achievements-context'
import { useCommandPalette } from './command-palette'
import { useContextMenu } from './context-menu'

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

  useEffect(() => {
    if (!enabled) return

    let konamiIndex = 0

    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      const typing = isEditableTarget(e.target)

      if (meta && key === 'k') {
        e.preventDefault()
        e.stopPropagation()
        openPalette()
        return
      }

      if (e.key === 'Escape') {
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

      // ⌘⇧L — terminal (avoids browser-reserved ⌘T)
      if (meta && e.shiftKey && key === 'l' && !typing) {
        e.preventDefault()
        e.stopPropagation()
        openApp('terminal')
        return
      }

      // ⌘⇧A — assistant (avoids browser-reserved ⌘N / ⌘J)
      if (meta && e.shiftKey && key === 'a' && !typing) {
        e.preventDefault()
        e.stopPropagation()
        openApp('assistant')
        return
      }

      if (meta && key === 'w' && activeId) {
        e.preventDefault()
        e.stopPropagation()
        closeApp(activeId)
        return
      }

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
  ])

  useEffect(() => {
    if (!enabled) return
    const opened = new Set(windows.map((w) => w.id))
    const hasAll = APP_ORDER.every((id: AppId) => opened.has(id))
    if (hasAll) unlock('all_apps')
  }, [enabled, windows, unlock])
}
