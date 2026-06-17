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
import {
  applySettingsToDocument,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type NexusSettings,
} from '@/lib/os/settings'

interface SettingsContextValue {
  settings: NexusSettings
  updateSettings: (patch: Partial<NexusSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NexusSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    applySettingsToDocument(loaded)
  }, [])

  const updateSettings = useCallback((patch: Partial<NexusSettings>) => {
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
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
