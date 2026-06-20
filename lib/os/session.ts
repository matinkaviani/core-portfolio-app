const VISITOR_KEY = 'core-visitor'

export function getStoredVisitor(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(VISITOR_KEY)
}

export function setStoredVisitor(name: string) {
  sessionStorage.setItem(VISITOR_KEY, name)
}

export function clearStoredVisitor() {
  sessionStorage.removeItem(VISITOR_KEY)
}

export function hasActiveSession(): boolean {
  return Boolean(getStoredVisitor())
}
