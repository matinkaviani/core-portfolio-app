import { APPS, type AppId } from '@/lib/os-data'

export interface PersistedWindow {
  id: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
}

export interface PersistedSession {
  v: number
  windows: PersistedWindow[]
  activeId: AppId | null
  appParams: Partial<Record<AppId, Record<string, string>>>
}

const STORAGE_KEY = 'core-window-session'
const SESSION_VERSION = 1

function isValidAppId(id: unknown): id is AppId {
  return typeof id === 'string' && id in APPS
}

export function loadSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedSession>
    if (!parsed || parsed.v !== SESSION_VERSION || !Array.isArray(parsed.windows)) {
      return null
    }

    const seen = new Set<AppId>()
    const windows = parsed.windows.filter((w): w is PersistedWindow => {
      if (!w || !isValidAppId(w.id) || seen.has(w.id)) return false
      seen.add(w.id)
      return (
        Number.isFinite(w.x) &&
        Number.isFinite(w.y) &&
        Number.isFinite(w.w) &&
        Number.isFinite(w.h)
      )
    })

    if (windows.length === 0) return null

    const activeId = isValidAppId(parsed.activeId) ? parsed.activeId : null
    const appParams: PersistedSession['appParams'] = {}
    if (parsed.appParams && typeof parsed.appParams === 'object') {
      for (const [key, val] of Object.entries(parsed.appParams)) {
        if (isValidAppId(key) && val && typeof val === 'object') {
          appParams[key] = val as Record<string, string>
        }
      }
    }

    return { v: SESSION_VERSION, windows, activeId, appParams }
  } catch {
    return null
  }
}

export function saveSession(session: Omit<PersistedSession, 'v'>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: SESSION_VERSION, ...session }),
    )
  } catch {
    // storage full / unavailable — non-fatal
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
