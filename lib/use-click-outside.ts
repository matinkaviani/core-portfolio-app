'use client'

import { useEffect, useRef } from 'react'

/** Calls handler when a pointerdown occurs outside the referenced element. */
export function useClickOutside<T extends HTMLElement>(
  active: boolean,
  handler: () => void,
) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!active) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler()
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handler()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active, handler])
  return ref
}
