export interface Achievement {
  id: string
  title: string
  description: string
  glyph: string
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_login',
    title: 'Signed In',
    description: 'Completed the CORE login screen.',
    glyph: 'IN',
  },
  {
    id: 'spotlight',
    title: 'Spotlight',
    description: 'Opened the command palette.',
    glyph: '⌘K',
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Opened the Finder.',
    glyph: 'FD',
  },
  {
    id: 'terminal_master',
    title: 'Shell User',
    description: 'Ran a terminal command.',
    glyph: '>_',
  },
  {
    id: 'sudo',
    title: 'Nice Try',
    description: 'Attempted sudo in the terminal.',
    glyph: '🔐',
  },
  {
    id: 'konami',
    title: 'Cheat Code',
    description: 'Entered the Konami code.',
    glyph: '↑↑',
  },
  {
    id: 'all_apps',
    title: 'Power User',
    description: 'Opened every app on the desktop.',
    glyph: 'ALL',
  },
  {
    id: 'recruiter',
    title: 'Recruiter Mode',
    description: 'Used AI recruiter matching.',
    glyph: 'HR',
  },
  {
    id: 'deep_link',
    title: 'Deep Link',
    description: 'Arrived via a shareable URL.',
    glyph: 'URL',
  },
  {
    id: 'settings_tinkerer',
    title: 'Customizer',
    description: 'Changed a system setting.',
    glyph: '⚙',
  },
]

const STORAGE_KEY = 'core-achievements'

export function loadUnlockedAchievements(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function saveUnlockedAchievements(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function getAchievement(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
