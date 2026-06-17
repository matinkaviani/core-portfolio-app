'use client'

import {
  ACHIEVEMENTS,
  getAchievement,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
  type Achievement,
} from '@/lib/os/achievements'
import { AnimatePresence, motion } from 'framer-motion'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface AchievementsContextValue {
  unlocked: string[]
  unlock: (id: string) => void
  isUnlocked: (id: string) => boolean
}

const AchievementsContext = createContext<AchievementsContextValue | null>(null)

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<string[]>(() =>
    typeof window !== 'undefined' ? loadUnlockedAchievements() : [],
  )
  const [toast, setToast] = useState<Achievement | null>(null)

  const unlock = useCallback((id: string) => {
    const persisted = loadUnlockedAchievements()
    if (persisted.includes(id)) {
      setUnlocked(persisted)
      return
    }
    const next = [...persisted, id]
    saveUnlockedAchievements(next)
    setUnlocked(next)
    const achievement = getAchievement(id)
    if (achievement) setToast(achievement)
  }, [])

  const isUnlocked = useCallback(
    (id: string) => unlocked.includes(id),
    [unlocked],
  )

  const value = useMemo(
    () => ({ unlocked, unlock, isUnlocked }),
    [unlocked, unlock, isUnlocked],
  )

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {toast && (
          <AchievementToast
            achievement={toast}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </AchievementsContext.Provider>
  )
}

function AchievementToast({
  achievement,
  onDone,
}: {
  achievement: Achievement
  onDone: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      className="fixed bottom-[max(6rem,env(safe-area-inset-bottom))] left-4 right-4 z-95 overflow-hidden rounded-xl border border-border bg-popover/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:left-auto sm:right-4 sm:w-72"
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
        Achievement unlocked
      </p>
      <div className="mt-2 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-mono text-xs font-semibold text-primary">
          {achievement.glyph}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {achievement.title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {achievement.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext)
  if (!ctx) {
    throw new Error('useAchievements must be used within AchievementsProvider')
  }
  return ctx
}

export function AchievementsList() {
  const { unlocked, isUnlocked } = useAchievements()
  return (
    <div className="space-y-2">
      {ACHIEVEMENTS.map((a) => (
        <div
          key={a.id}
          className={`flex items-center gap-3 rounded-lg border p-3 ${
            isUnlocked(a.id)
              ? 'border-primary/30 bg-primary/5'
              : 'border-border bg-card/40 opacity-50'
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card font-mono text-[10px] font-semibold text-primary">
            {a.glyph}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.description}</p>
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">
        {unlocked.length} / {ACHIEVEMENTS.length} unlocked
      </p>
    </div>
  )
}
