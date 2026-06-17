export const MOBILE_BREAKPOINT = 768

export const SHELL = {
  menuBar: 36,
  dock: 88,
  dockMobile: 72,
  gap: 12,
  gapMobile: 8,
} as const

export function isMobileViewport(
  width = typeof window !== 'undefined' ? window.innerWidth : 1024,
) {
  return width < MOBILE_BREAKPOINT
}

export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { w: 1024, h: 768 }
  }
  return { w: window.innerWidth, h: window.innerHeight }
}

export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0 }
  }
  const style = getComputedStyle(document.documentElement)
  const top = parseFloat(style.getPropertyValue('--nexus-safe-top')) || 0
  const bottom = parseFloat(style.getPropertyValue('--nexus-safe-bottom')) || 0
  return { top, bottom }
}

export function getShellInsets(mobile = isMobileViewport()) {
  const gap = mobile ? SHELL.gapMobile : SHELL.gap
  const dock = mobile ? SHELL.dockMobile : SHELL.dock
  const safe = getSafeAreaInsets()
  return {
    menuBar: SHELL.menuBar + safe.top,
    dock: dock + safe.bottom,
    gap,
  }
}

export function getMaximizedGeometry(
  width: number,
  height: number,
  mobile = isMobileViewport(width),
) {
  const { menuBar, dock, gap } = getShellInsets(mobile)
  return {
    x: gap,
    y: menuBar + gap,
    width: Math.max(200, width - gap * 2),
    height: Math.max(200, height - menuBar - dock - gap * 2),
  }
}

export function clampWindowSize(
  w: number,
  h: number,
  width: number,
  height: number,
  mobile = isMobileViewport(width),
) {
  const { menuBar, dock, gap } = getShellInsets(mobile)
  const maxW = width - gap * 2
  const maxH = height - menuBar - dock - gap
  const minW = mobile ? Math.min(280, width - 8) : 320
  const minH = mobile ? 200 : 260
  return {
    w: Math.max(minW, Math.min(w, maxW)),
    h: Math.max(minH, Math.min(h, maxH)),
  }
}
