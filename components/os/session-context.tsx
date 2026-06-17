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
import { clearStoredVisitor, getStoredVisitor, setStoredVisitor } from '@/lib/os/session'

interface SessionContextValue {
  visitorName: string
  booted: boolean
  sessionChecked: boolean
  sessionKey: number
  skipBoot: boolean
  login: (name: string) => void
  logout: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({
  children,
  skipBoot,
}: {
  children: ReactNode
  skipBoot: boolean
}) {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [booted, setBooted] = useState(false)
  const [visitorName, setVisitorName] = useState('Guest')
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    const stored = getStoredVisitor()
    if (stored) {
      setVisitorName(stored)
      setBooted(true)
    }
    setSessionChecked(true)
  }, [])

  const login = useCallback((name: string) => {
    setStoredVisitor(name)
    setVisitorName(name)
    setBooted(true)
  }, [])

  const logout = useCallback(() => {
    clearStoredVisitor()
    setVisitorName('Guest')
    setBooted(false)
    setSessionKey((key) => key + 1)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const value = useMemo(
    () => ({
      visitorName,
      booted,
      sessionChecked,
      sessionKey,
      login,
      logout,
      skipBoot,
    }),
    [visitorName, booted, sessionChecked, sessionKey, login, logout, skipBoot],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
