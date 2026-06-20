'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { APPS, type AppId } from '@/lib/os-data'
import {
  clampWindowSize,
  getViewportSize,
  isMobileViewport,
} from '@/lib/os/viewport'
import { loadSession, saveSession } from '@/lib/os/window-session'

export type AppParams = Record<string, string>

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
  appParams: Partial<Record<AppId, AppParams>>
  openApp: (id: AppId, params?: AppParams) => void
  closeApp: (id: AppId) => void
  closeAllApps: () => void
  focusApp: (id: AppId) => void
  minimizeApp: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  moveWindow: (id: AppId, x: number, y: number) => void
  resizeWindow: (id: AppId, next: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => void
  isOpen: (id: AppId) => boolean
  getAppParams: (id: AppId) => AppParams
  setAppParams: (id: AppId, params: AppParams) => void
}

const OSContext = createContext<OSContextValue | null>(null)

function initialPosition(index: number, w: number, h: number) {
  if (typeof window === 'undefined') {
    return { x: 120 + index * 36, y: 90 + index * 32, w, h }
  }
  const { w: vw, h: vh } = getViewportSize()
  const mobile = isMobileViewport(vw)
  const clamped = clampWindowSize(w, h, vw, vh, mobile)
  const maxX = Math.max(8, vw - clamped.w - 8)
  const maxY = Math.max(40, vh - clamped.h - (mobile ? 80 : 100))
  const x = Math.min(maxX, mobile ? 8 : 100 + index * 40)
  const y = Math.min(maxY, mobile ? 44 : 80 + index * 34)
  return { x, y, w: clamped.w, h: clamped.h }
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeId, setActiveId] = useState<AppId | null>(null)
  const [appParams, setAppParamsState] = useState<Partial<Record<AppId, AppParams>>>({})
  const zRef = useRef(10)
  const openCount = useRef(0)
  const hydratedRef = useRef(false)

  // Restore the previous session (window layout, z-order, params) after mount.
  // Runs once on the client to avoid SSR/hydration mismatch.
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    const session = loadSession()
    if (!session) return

    const { w: vw, h: vh } = getViewportSize()
    const mobile = isMobileViewport(vw)

    const restored: WindowState[] = session.windows.map((win) => {
      const clamped = clampWindowSize(win.w, win.h, vw, vh, mobile)
      const maxX = Math.max(8, vw - clamped.w - 8)
      const maxY = Math.max(40, vh - clamped.h - (mobile ? 80 : 100))
      return {
        id: win.id,
        x: Math.min(Math.max(8, win.x), maxX),
        y: Math.min(Math.max(40, win.y), maxY),
        w: clamped.w,
        h: clamped.h,
        z: win.z,
        minimized: win.minimized,
        maximized: mobile ? true : win.maximized,
      }
    })

    zRef.current = restored.reduce((max, w) => Math.max(max, w.z), 10)
    openCount.current = restored.length
    setWindows(restored)
    setActiveId(session.activeId)
    setAppParamsState(session.appParams)
  }, [])

  // Persist the session whenever layout/state changes (after hydration).
  useEffect(() => {
    if (!hydratedRef.current) return
    const handle = setTimeout(() => {
      saveSession({
        windows: windows.map((w) => ({
          id: w.id,
          x: w.x,
          y: w.y,
          w: w.w,
          h: w.h,
          z: w.z,
          minimized: w.minimized,
          maximized: w.maximized,
        })),
        activeId,
        appParams,
      })
    }, 250)
    return () => clearTimeout(handle)
  }, [windows, activeId, appParams])

  const setAppParams = useCallback((id: AppId, params: AppParams) => {
    setAppParamsState((prev) => ({ ...prev, [id]: params }))
  }, [])

  const getAppParams = useCallback(
    (id: AppId) => appParams[id] ?? {},
    [appParams],
  )

  const focusApp = useCallback((id: AppId) => {
    zRef.current += 1
    const z = zRef.current
    setActiveId(id)
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
    )
  }, [])

  const openApp = useCallback((id: AppId, params?: AppParams) => {
    if (params) {
      setAppParamsState((prev) => ({ ...prev, [id]: params }))
    }
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
      const mobile = isMobileViewport()
      const pos = initialPosition(openCount.current, meta.size.w, meta.size.h)
      openCount.current += 1

      const nextWindows = mobile
        ? prev.map((w) => ({ ...w, minimized: true }))
        : prev

      return [
        ...nextWindows,
        {
          id,
          x: pos.x,
          y: pos.y,
          w: pos.w,
          h: pos.h,
          z,
          minimized: false,
          maximized: mobile,
        },
      ]
    })
    setActiveId(id)
  }, [])

  const closeApp = useCallback((id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const closeAllApps = useCallback(() => {
    setWindows([])
    setActiveId(null)
  }, [])

  const minimizeApp = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    )
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const toggleMaximize = useCallback((id: AppId) => {
    zRef.current += 1
    const z = zRef.current
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, maximized: !w.maximized, z, minimized: false }
          : w,
      ),
    )
    setActiveId(id)
  }, [])

  const moveWindow = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }, [])

  const resizeWindow = useCallback(
    (id: AppId, next: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...next } : w)),
      )
    },
    [],
  )

  const isOpen = useCallback(
    (id: AppId) => windows.some((w) => w.id === id),
    [windows],
  )

  const value = useMemo(
    () => ({
      windows,
      activeId,
      appParams,
      openApp,
      closeApp,
      closeAllApps,
      focusApp,
      minimizeApp,
      toggleMaximize,
      moveWindow,
      resizeWindow,
      isOpen,
      getAppParams,
      setAppParams,
    }),
    [
      windows,
      activeId,
      appParams,
      openApp,
      closeApp,
      closeAllApps,
      focusApp,
      minimizeApp,
      toggleMaximize,
      moveWindow,
      resizeWindow,
      isOpen,
      getAppParams,
      setAppParams,
    ],
  )

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>
}

export function useOS() {
  const ctx = useContext(OSContext)
  if (!ctx) throw new Error('useOS must be used within OSProvider')
  return ctx
}
