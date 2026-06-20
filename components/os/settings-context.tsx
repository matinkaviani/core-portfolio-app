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
import { MotionConfig } from 'framer-motion'
import {
  applySettingsToDocument,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type CoreSettings,
} from '@/lib/os/settings'

interface SettingsContextValue {
  settings: CoreSettings
  updateSettings: (patch: Partial<CoreSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CoreSettings>(() =>
    typeof window !== 'undefined' ? loadSettings() : DEFAULT_SETTINGS,
  )

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    applySettingsToDocument(loaded)
  }, [])

  const updateSettings = useCallback((patch: Partial<CoreSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      applySettingsToDocument(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
    applySettingsToDocument(DEFAULT_SETTINGS)
  }, [])

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  )

  return (
    <SettingsContext.Provider value={value}>
      <MotionConfig reducedMotion={settings.reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export function useReducedMotion() {
  const { settings } = useSettings()
  return settings.reducedMotion
}
