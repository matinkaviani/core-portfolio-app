// Shared wire protocol for the multiplayer cursor presence feature.
// Pure TypeScript (no DOM / no Worker globals) so it can be imported by both
// the React client and the Durable Object.

export interface PeerState {
  id: string
  color: string
  name: string
  x: number
  y: number
}

export type ServerMessage =
  | { t: 'welcome'; id: string; color: string; name: string; peers: PeerState[] }
  | { t: 'join'; peer: PeerState }
  | { t: 'move'; id: string; x: number; y: number }
  | { t: 'leave'; id: string }

export type ClientMessage = { t: 'move'; x: number; y: number }

export const CURSOR_PATH = '/api/cursors'

export const CURSOR_COLORS = [
  '#f97316',
  '#22c55e',
  '#3b82f6',
  '#e11d48',
  '#a855f7',
  '#14b8a6',
  '#eab308',
  '#ec4899',
] as const

const ADJECTIVES = [
  'Swift',
  'Quiet',
  'Lunar',
  'Neon',
  'Cosmic',
  'Amber',
  'Vivid',
  'Hidden',
  'Bold',
  'Calm',
]

const ANIMALS = [
  'Falcon',
  'Otter',
  'Fox',
  'Heron',
  'Lynx',
  'Wren',
  'Orca',
  'Ibex',
  'Moth',
  'Raven',
]

export function randomLabel(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${a} ${b}`
}

export function pickColor(seed: number): string {
  return CURSOR_COLORS[seed % CURSOR_COLORS.length]
}
