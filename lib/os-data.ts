export type AppId =
  | 'terminal'
  | 'assistant'
  | 'projects'
  | 'experience'
  | 'contact'

export interface ProjectItem {
  id: string
  name: string
  category: string
  year: string
  description: string
  stack: string[]
  status: 'Live' | 'Archived' | 'In progress'
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

export const PROFILE = {
  name: 'Alex Rivera',
  handle: 'alex',
  role: 'Software Engineer & Interface Designer',
  location: 'San Francisco, CA',
  email: 'hello@nexus.dev',
  bio: 'I build polished software and tools for thinking. Currently focused on developer experience, design systems, and the small interactions that make interfaces feel alive.',
  links: {
    github: 'github.com/alexrivera',
    x: 'x.com/alexrivera',
    linkedin: 'linkedin.com/in/alexrivera',
  },
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'orbit',
    name: 'Orbit',
    category: 'Developer Tools',
    year: '2025',
    description:
      'A command-driven control plane for cloud infrastructure. Keyboard-first, zero context-switching, sub-50ms interactions.',
    stack: ['TypeScript', 'Next.js', 'Rust', 'WebSocket'],
    status: 'Live',
  },
  {
    id: 'prism',
    name: 'Prism',
    category: 'Design Systems',
    year: '2024',
    description:
      'Token-based theming engine that compiles a single source of truth into platform-native styles for web, iOS, and Android.',
    stack: ['TypeScript', 'Style Dictionary', 'Figma API'],
    status: 'Live',
  },
  {
    id: 'cadence',
    name: 'Cadence',
    category: 'Productivity',
    year: '2024',
    description:
      'A local-first task runner that turns plain-text notes into a structured, queryable timeline of your work.',
    stack: ['Rust', 'SQLite', 'Tauri'],
    status: 'In progress',
  },
  {
    id: 'signal',
    name: 'Signal',
    category: 'AI',
    year: '2023',
    description:
      'Streaming inference gateway with smart routing, caching, and observability for multi-model applications.',
    stack: ['Go', 'gRPC', 'Redis', 'AI SDK'],
    status: 'Live',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    category: 'Data Visualization',
    year: '2022',
    description:
      'Interactive canvas for rendering large graph datasets at 60fps using WebGL instancing and spatial indexing.',
    stack: ['WebGL', 'TypeScript', 'Web Workers'],
    status: 'Archived',
  },
]

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Staff Engineer',
    company: 'Meridian',
    period: '2023 — Present',
    location: 'San Francisco',
    summary:
      'Lead the platform interface group, owning the design system and the core editor experience.',
    highlights: [
      'Rebuilt the command palette, cutting median navigation time by 38%.',
      'Established a token pipeline adopted across 9 product teams.',
      'Mentored 6 engineers through interface and systems work.',
    ],
  },
  {
    id: 'exp-2',
    role: 'Senior Frontend Engineer',
    company: 'Northwind',
    period: '2020 — 2023',
    location: 'Remote',
    summary:
      'Owned the customer-facing dashboard and real-time collaboration features.',
    highlights: [
      'Shipped a presence + cursor system used by 200k weekly users.',
      'Reduced bundle size by 44% with route-level code splitting.',
      'Drove the migration to a fully typed component library.',
    ],
  },
  {
    id: 'exp-3',
    role: 'Product Engineer',
    company: 'Loom Labs',
    period: '2018 — 2020',
    location: 'New York',
    summary:
      'Early engineer building the first version of the analytics product.',
    highlights: [
      'Designed and built the charting layer from scratch.',
      'Implemented the onboarding flow that lifted activation by 22%.',
    ],
  },
]

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
    size: { w: 680, h: 460 },
    glyph: '>_',
  },
  assistant: {
    id: 'assistant',
    name: 'Assistant',
    description: 'AI assistant',
    size: { w: 560, h: 600 },
    glyph: 'AI',
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    description: 'Selected work',
    size: { w: 760, h: 560 },
    glyph: 'PR',
  },
  experience: {
    id: 'experience',
    name: 'Experience',
    description: 'Career timeline',
    size: { w: 680, h: 560 },
    glyph: 'EX',
  },
  contact: {
    id: 'contact',
    name: 'Contact',
    description: 'Get in touch',
    size: { w: 540, h: 520 },
    glyph: 'CT',
  },
}

export const APP_ORDER: AppId[] = [
  'terminal',
  'assistant',
  'projects',
  'experience',
  'contact',
]
