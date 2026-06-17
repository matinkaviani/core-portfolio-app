'use client'

import { useEffect } from 'react'
import { APP_ORDER, type AppId } from '@/lib/os-data'
import { useOS } from './os-context'
import { useAchievements } from './achievements-context'
import { useCommandPalette } from './command-palette'

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

export function useGlobalShortcuts(enabled: boolean) {
  const { openApp, closeApp, activeId, windows } = useOS()
  const { unlock } = useAchievements()
  const { openPalette } = useCommandPalette()

  useEffect(() => {
    if (!enabled) return

    let konamiIndex = 0

    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openPalette()
        return
      }

      if (meta && e.key.toLowerCase() === 't') {
        e.preventDefault()
        openApp('terminal')
        return
      }

      if (meta && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        openApp('assistant')
        return
      }

      if (meta && e.key.toLowerCase() === 'w' && activeId) {
        e.preventDefault()
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

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, openPalette, openApp, closeApp, activeId, unlock])

  useEffect(() => {
    if (!enabled) return
    const opened = new Set(windows.map((w) => w.id))
    const hasAll = APP_ORDER.every((id: AppId) => opened.has(id))
    if (hasAll) unlock('all_apps')
  }, [enabled, windows, unlock])
}
