'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  guessLocationFromTimezone,
  type VisitorLocation,
} from '@/lib/os/visitor-location'

async function fetchVisitorLocation(): Promise<VisitorLocation> {
  const res = await fetch('/api/visitor-location', { cache: 'no-store' })
  const data = (await res.json()) as { location?: VisitorLocation | null }

  return (
    data.location ??
    guessLocationFromTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  )
}

export function useVisitorLocation() {
  const [location, setLocation] = useState<VisitorLocation | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)

    try {
      const next = await fetchVisitorLocation()
      setLocation(next)
    } catch {
      setLocation(
        guessLocationFromTimezone(
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh(true)
  }, [refresh])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refresh(false)
      }
    }

    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  return { location, loading }
}
