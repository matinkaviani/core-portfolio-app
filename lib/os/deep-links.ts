import type { AppId } from '@/lib/os-data'

export interface DeepLinkState {
  app?: AppId
  project?: string
  file?: string
  mode?: string
}

const VALID_APPS = new Set<AppId>([
  'terminal',
  'assistant',
  'projects',
  'experience',
  'resume',
  'contact',
  'settings',
  'finder',
])

export function parseDeepLink(search: string): DeepLinkState {
  const params = new URLSearchParams(search)
  const app = params.get('app') as AppId | null
  return {
    app: app && VALID_APPS.has(app) ? app : undefined,
    project: params.get('project') ?? undefined,
    file: params.get('file') ?? undefined,
    mode: params.get('mode') ?? undefined,
  }
}

export function buildDeepLink(state: DeepLinkState): string {
  const params = new URLSearchParams()
  if (state.app) params.set('app', state.app)
  if (state.project) params.set('project', state.project)
  if (state.file) params.set('file', state.file)
  if (state.mode) params.set('mode', state.mode)
  const qs = params.toString()
  return qs ? `?${qs}` : '/'
}

export function updateBrowserUrl(state: DeepLinkState, replace = true) {
  if (typeof window === 'undefined') return
  const url = buildDeepLink(state)
  const next = url === '/' ? window.location.pathname : `${window.location.pathname}${url}`
  if (replace) {
    window.history.replaceState(null, '', next)
  } else {
    window.history.pushState(null, '', next)
  }
}
