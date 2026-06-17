'use client'

import { useEffect } from 'react'
import { useOS } from './os-context'
import { useAchievements } from './achievements-context'
import {
  buildDeepLink,
  parseDeepLink,
  updateBrowserUrl,
} from '@/lib/os/deep-links'
import type { AppId } from '@/lib/os-data'

export function useDeepLinks(enabled: boolean) {
  const { openApp } = useOS()
  const { unlock } = useAchievements()

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const link = parseDeepLink(window.location.search)
    if (!link.app) return

    unlock('deep_link')

    const params: Record<string, string> = {}
    if (link.project) params.project = link.project
    if (link.file) params.file = link.file
    if (link.mode) params.mode = link.mode

    openApp(link.app, Object.keys(params).length ? params : undefined)

    if (link.app === 'finder') unlock('explorer')
  }, [enabled, openApp, unlock])
}

export function syncDeepLink(app?: AppId, params?: Record<string, string>) {
  if (typeof window === 'undefined') return
  updateBrowserUrl({
    app,
    project: params?.project,
    file: params?.file,
    mode: params?.mode,
  })
}

export function clearDeepLink(app: AppId) {
  if (typeof window === 'undefined') return
  // Only clear if the URL currently points at this app, so closing one app
  // doesn't wipe another app's deep-link params.
  if (parseDeepLink(window.location.search).app !== app) return
  updateBrowserUrl({})
}

export function copyDeepLink(app: AppId, params?: Record<string, string>) {
  if (typeof window === 'undefined') return ''
  const url = `${window.location.origin}${window.location.pathname}${buildDeepLink({ app, ...params })}`
  return url
}
