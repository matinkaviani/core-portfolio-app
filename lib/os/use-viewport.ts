'use client'

import { useEffect, useState } from 'react'
import { getViewportSize, isMobileViewport } from './viewport'

export function useViewport() {
  const [size, setSize] = useState(getViewportSize)
  const [isMobile, setIsMobile] = useState(() => isMobileViewport())

  useEffect(() => {
    const onResize = () => {
      setSize(getViewportSize())
      setIsMobile(isMobileViewport())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return { width: size.w, height: size.h, isMobile }
}
