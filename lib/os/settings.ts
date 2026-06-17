export type WallpaperId = 'grid' | 'gradient' | 'aurora' | 'solid'

export interface NexusSettings {
  wallpaper: WallpaperId
  showGrid: boolean
  accentHue: number
  reducedMotion: boolean
  skipBoot: boolean
}

export const DEFAULT_SETTINGS: NexusSettings = {
  wallpaper: 'grid',
  showGrid: true,
  accentHue: 240,
  reducedMotion: false,
  skipBoot: false,
}

export const WALLPAPER_OPTIONS: { id: WallpaperId; label: string }[] = [
  { id: 'grid', label: 'System Grid' },
  { id: 'gradient', label: 'Soft Gradient' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'solid', label: 'Solid Desk' },
]

const STORAGE_KEY = 'nexus-settings'

export function loadSettings(): NexusSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: NexusSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function applySettingsToDocument(settings: NexusSettings) {
  const root = document.documentElement
  root.style.setProperty('--nexus-accent-hue', String(settings.accentHue))
  root.style.setProperty('--primary', `oklch(0.7 0.13 ${settings.accentHue})`)
  root.style.setProperty('--ring', `oklch(0.7 0.13 ${settings.accentHue})`)
  root.style.setProperty('--accent', `oklch(0.7 0.13 ${settings.accentHue})`)
  root.dataset.nexusWallpaper = settings.wallpaper
  root.dataset.nexusGrid = settings.showGrid ? 'on' : 'off'
  root.dataset.nexusReducedMotion = settings.reducedMotion ? 'on' : 'off'
}
