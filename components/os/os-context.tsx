'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { APPS, type AppId } from '@/lib/os-data'

export interface WindowState {
  id: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
}

interface OSContextValue {
  windows: WindowState[]
  activeId: AppId | null
  openApp: (id: AppId) => void
  closeApp: (id: AppId) => void
  focusApp: (id: AppId) => void
  minimizeApp: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  moveWindow: (id: AppId, x: number, y: number) => void
  isOpen: (id: AppId) => boolean
}

const OSContext = createContext<OSContextValue | null>(null)

function initialPosition(index: number, w: number, h: number) {
  if (typeof window === 'undefined') {
    return { x: 120 + index * 36, y: 90 + index * 32 }
  }
  const maxX = Math.max(40, window.innerWidth - w - 60)
  const maxY = Math.max(60, window.innerHeight - h - 140)
  const x = Math.min(maxX, 100 + index * 40)
  const y = Math.min(maxY, 80 + index * 34)
  return { x, y }
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeId, setActiveId] = useState<AppId | null>(null)
  const zRef = useRef(10)
  const openCount = useRef(0)

  const focusApp = useCallback((id: AppId) => {
    zRef.current += 1
    const z = zRef.current
    setActiveId(id)
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, z, minimized: false } : w,
      ),
    )
  }, [])

  const openApp = useCallback(
    (id: AppId) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id)
        zRef.current += 1
        const z = zRef.current
        if (existing) {
          return prev.map((w) =>
            w.id === id ? { ...w, z, minimized: false } : w,
          )
        }
        const meta = APPS[id]
        const pos = initialPosition(openCount.current, meta.size.w, meta.size.h)
        openCount.current += 1
        return [
          ...prev,
          {
            id,
            x: pos.x,
            y: pos.y,
            w: meta.size.w,
            h: meta.size.h,
            z,
            minimized: false,
            maximized: false,
          },
        ]
      })
      setActiveId(id)
    },
    [],
  )

  const closeApp = useCallback(
    (id: AppId) => {
      setWindows((prev) => prev.filter((w) => w.id !== id))
      setActiveId((cur) => (cur === id ? null : cur))
    },
    [],
  )

  const minimizeApp = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    )
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const toggleMaximize = useCallback(
    (id: AppId) => {
      zRef.current += 1
      const z = zRef.current
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, maximized: !w.maximized, z, minimized: false } : w,
        ),
      )
      setActiveId(id)
    },
    [],
  )

  const moveWindow = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w)),
    )
  }, [])

  const isOpen = useCallback(
    (id: AppId) => windows.some((w) => w.id === id),
    [windows],
  )

  const value = useMemo(
    () => ({
      windows,
      activeId,
      openApp,
      closeApp,
      focusApp,
      minimizeApp,
      toggleMaximize,
      moveWindow,
      isOpen,
    }),
    [
      windows,
      activeId,
      openApp,
      closeApp,
      focusApp,
      minimizeApp,
      toggleMaximize,
      moveWindow,
      isOpen,
    ],
  )

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>
}

export function useOS() {
  const ctx = useContext(OSContext)
  if (!ctx) throw new Error('useOS must be used within OSProvider')
  return ctx
}
