export type AppId =
  | 'terminal'
  | 'assistant'
  | 'projects'
  | 'experience'
  | 'contact'
  | 'settings'
  | 'finder'

export interface ProjectItem {
  id: string
  name: string
  category: string
  year: string
  description: string
  stack: string[]
  status: 'Live' | 'Archived' | 'In progress'
  challenges?: string[]
  outcome?: string
  sections?: Record<string, string>
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  location: string
  summary: string
  highlights: string[]
}

export interface AppMeta {
  id: AppId
  name: string
  description: string
  /** default window size */
  size: { w: number; h: number }
  /** monogram shown in dock + windows */
  glyph: string
}

export const APPS: Record<AppId, AppMeta> = {
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command-line interface',
    size: { w: 820, h: 540 },
    glyph: '>_',
  },
  assistant: {
    id: 'assistant',
    name: 'Core',
    description: 'AI assistant',
    size: { w: 720, h: 680 },
    glyph: 'AI',
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    description: 'Selected work',
    size: { w: 920, h: 640 },
    glyph: 'PR',
  },
  experience: {
    id: 'experience',
    name: 'Experience',
    description: 'Career timeline',
    size: { w: 800, h: 620 },
    glyph: 'EX',
  },
  contact: {
    id: 'contact',
    name: 'Contact',
    description: 'Get in touch',
    size: { w: 640, h: 580 },
    glyph: 'CT',
  },
  finder: {
    id: 'finder',
    name: 'Finder',
    description: 'Browse /content',
    size: { w: 860, h: 600 },
    glyph: 'FD',
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'System preferences',
    size: { w: 640, h: 560 },
    glyph: '⚙',
  },
}

export const APP_ORDER: AppId[] = [
  'terminal',
  'assistant',
  'projects',
  'experience',
  'contact',
  'finder',
  'settings',
]
