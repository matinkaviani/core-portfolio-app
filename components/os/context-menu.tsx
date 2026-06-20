'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOS } from './os-context'
import { usePortfolio } from './portfolio-context'
import { useSession } from './session-context'
import { APPS, APP_ORDER, type AppId } from '@/lib/os-data'
import { cn } from '@/lib/utils'

export type ContextMenuTarget =
  | { type: 'desktop' }
  | { type: 'dock'; appId: AppId }
  | { type: 'window'; appId: AppId }

interface ContextMenuState {
  x: number
  y: number
  target: ContextMenuTarget
}

interface ContextMenuItem {
  label: string
  shortcut?: string
  action?: () => void
  disabled?: boolean
  divider?: boolean
}

interface ContextMenuContextValue {
  openContextMenu: (
    x: number,
    y: number,
    target: ContextMenuTarget,
  ) => void
  closeContextMenu: () => void
  isOpen: boolean
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

const MENU_WIDTH = 224
const MENU_ITEM_HEIGHT = 34
const MENU_PADDING = 12

function clampPosition(x: number, y: number, itemCount: number) {
  if (typeof window === 'undefined') return { x, y }

  const estimatedHeight = itemCount * MENU_ITEM_HEIGHT + MENU_PADDING
  const maxX = Math.max(8, window.innerWidth - MENU_WIDTH - 8)
  const maxY = Math.max(8, window.innerHeight - estimatedHeight - 8)

  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(8, y), maxY),
  }
}

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null)

  const openContextMenu = useCallback(
    (x: number, y: number, target: ContextMenuTarget) => {
      setMenu({ x, y, target })
    },
    [],
  )

  const closeContextMenu = useCallback(() => setMenu(null), [])

  useEffect(() => {
    if (!menu) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeContextMenu()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menu, closeContextMenu])

  const value = useMemo(
    () => ({ openContextMenu, closeContextMenu, isOpen: menu !== null }),
    [openContextMenu, closeContextMenu, menu],
  )

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
      <ContextMenuLayer menu={menu} onClose={closeContextMenu} />
    </ContextMenuContext.Provider>
  )
}

export function useContextMenu() {
  const ctx = useContext(ContextMenuContext)
  if (!ctx) {
    throw new Error('useContextMenu must be used within ContextMenuProvider')
  }
  return ctx
}

function ContextMenuLayer({
  menu,
  onClose,
}: {
  menu: ContextMenuState | null
  onClose: () => void
}) {
  const os = useOS()
  const { profile } = usePortfolio()
  const { logout } = useSession()

  const items = useMemo<ContextMenuItem[]>(() => {
    if (!menu) return []

    const run = (action?: () => void) => {
      action?.()
      onClose()
    }

    if (menu.target.type === 'desktop') {
      const hasWindows = os.windows.length > 0
      return [
        {
          label: 'New Terminal',
          shortcut: '⌘⇧L',
          action: () => run(() => os.openApp('terminal')),
        },
        {
          label: 'New Assistant Chat',
          shortcut: '⌘⇧A',
          action: () => run(() => os.openApp('assistant')),
        },
        { divider: true, label: '' },
        {
          label: 'Open Projects',
          action: () => run(() => os.openApp('projects')),
        },
        {
          label: 'Open Experience',
          action: () => run(() => os.openApp('experience')),
        },
        {
          label: 'Open Contact',
          action: () => run(() => os.openApp('contact')),
        },
        {
          label: 'Open Finder',
          action: () => run(() => os.openApp('finder')),
        },
        {
          label: 'Open Settings',
          action: () => run(() => os.openApp('settings')),
        },
        { divider: true, label: '' },
        {
          label: 'Open All Apps',
          action: () =>
            run(() => APP_ORDER.forEach((id) => os.openApp(id))),
        },
        {
          label: 'Close All Windows',
          disabled: !hasWindows,
          action: () => run(() => os.closeAllApps()),
        },
        { divider: true, label: '' },
        {
          label: 'About This Portfolio',
          action: () => run(() => os.openApp('experience')),
        },
        {
          label: `Email ${profile.email}`,
          action: () => run(() => os.openApp('contact')),
        },
        { divider: true, label: '' },
        {
          label: 'Log Out',
          action: () => run(() => logout()),
        },
      ]
    }

    if (menu.target.type === 'dock') {
      const appId = menu.target.appId
      const meta = APPS[appId]
      const open = os.isOpen(appId)
      const win = os.windows.find((w) => w.id === appId)
      const minimized = win?.minimized ?? false
      const maximized = win?.maximized ?? false

      return [
        {
          label: open ? `Show ${meta.name}` : `Open ${meta.name}`,
          action: () =>
            run(() => (open ? os.focusApp(appId) : os.openApp(appId))),
        },
        {
          label: minimized ? 'Restore' : 'Minimize',
          disabled: !open,
          action: () =>
            run(() =>
              minimized ? os.focusApp(appId) : os.minimizeApp(appId),
            ),
        },
        {
          label: maximized ? 'Restore Window' : 'Enter Full Screen',
          disabled: !open,
          action: () => run(() => os.toggleMaximize(appId)),
        },
        {
          label: `Close ${meta.name}`,
          disabled: !open,
          action: () => run(() => os.closeApp(appId)),
        },
        { divider: true, label: '' },
        {
          label: 'Open All Apps',
          action: () =>
            run(() => APP_ORDER.forEach((id) => os.openApp(id))),
        },
      ]
    }

    const appId = menu.target.appId
    const meta = APPS[appId]
    const win = os.windows.find((w) => w.id === appId)
    const maximized = win?.maximized ?? false

    return [
      {
        label: 'Minimize',
        shortcut: '⌘M',
        action: () => run(() => os.minimizeApp(appId)),
      },
      {
        label: maximized ? 'Exit Full Screen' : 'Enter Full Screen',
        shortcut: '⌃⌘F',
        action: () => run(() => os.toggleMaximize(appId)),
      },
      {
        label: 'Close Window',
        shortcut: '⌘W',
        action: () => run(() => os.closeApp(appId)),
      },
      { divider: true, label: '' },
      {
        label: 'Bring to Front',
        action: () => run(() => os.focusApp(appId)),
      },
      { divider: true, label: '' },
      {
        label: `New ${meta.name}`,
        action: () => run(() => os.openApp(appId)),
      },
    ]
  }, [menu, onClose, os, profile.email, logout])

  const position = menu
    ? clampPosition(menu.x, menu.y, items.filter((i) => !i.divider).length)
    : null

  return (
    <AnimatePresence>
      {menu && position && (
        <>
          <motion.div
            key="context-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[80]"
            onContextMenu={(e) => {
              e.preventDefault()
              onClose()
            }}
            onPointerDown={onClose}
            aria-hidden
          />
          <motion.div
            key="context-menu"
            role="menu"
            data-core-context-menu
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{ left: position.x, top: position.y, width: MENU_WIDTH }}
            className="fixed z-[90] origin-top-left overflow-hidden rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
            onContextMenu={(e) => e.preventDefault()}
          >
            {items.map((item, idx) =>
              item.divider ? (
                <div
                  key={`divider-${idx}`}
                  className="my-1 h-px bg-border"
                  role="separator"
                />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={item.action}
                  className={cn(
                    'flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors',
                    item.disabled
                      ? 'cursor-not-allowed text-muted-foreground/40'
                      : 'cursor-pointer text-popover-foreground hover:bg-primary hover:text-primary-foreground',
                  )}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="font-mono text-[11px] opacity-60">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ),
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function isContextMenuExcluded(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      '[data-core-window], [data-core-dock], [data-core-menubar], [data-core-context-menu]',
    ),
  )
}
