'use client'

import { useEffect, useState } from 'react'
import {
  VISITOR_LOCATION_STORAGE_KEY,
  guessLocationFromTimezone,
  type VisitorLocation,
} from '@/lib/os/visitor-location'

export function useVisitorLocation() {
  const [location, setLocation] = useState<VisitorLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(VISITOR_LOCATION_STORAGE_KEY)
      if (cached) {
        setLocation(JSON.parse(cached) as VisitorLocation)
        setLoading(false)
        return
      }
    } catch {
      // ignore invalid cache
    }

    let cancelled = false

    fetch('/api/visitor-location')
      .then((res) => res.json())
      .then((data: { location?: VisitorLocation | null }) => {
        if (cancelled) return

        const resolved =
          data.location ??
          guessLocationFromTimezone(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          )

        setLocation(resolved)
        try {
          sessionStorage.setItem(
            VISITOR_LOCATION_STORAGE_KEY,
            JSON.stringify(resolved),
          )
        } catch {
          // ignore storage failures
        }
      })
      .catch(() => {
        if (cancelled) return
        const fallback = guessLocationFromTimezone(
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        )
        setLocation(fallback)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { location, loading }
}
