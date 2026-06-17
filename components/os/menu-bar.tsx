'use client'

import { useEffect, useState } from 'react'
import { useOS } from './os-context'
import { APPS } from '@/lib/os-data'

function useClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])
  return now
}

export function MenuBar() {
  const { activeId } = useOS()
  const now = useClock()
  const activeName = activeId ? APPS[activeId].name : 'Finder'

  const time = now
    ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '--:--'
  const day = now
    ? now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    : ''

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-9 items-center justify-between border-b border-border nexus-glass px-3 text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-primary font-mono text-[9px] font-bold text-primary-foreground">
            N
          </span>
          <span className="text-foreground">NEXUS</span>
        </div>
        <span className="hidden text-muted-foreground sm:inline">
          {activeName}
        </span>
        <nav className="hidden items-center gap-3 text-muted-foreground md:flex">
          <span>File</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </nav>
      </div>
      <div className="flex items-center gap-3 font-medium text-muted-foreground">
        <span className="hidden h-2 w-2 rounded-full bg-primary/80 sm:inline-block" />
        <span className="hidden sm:inline">{day}</span>
        <span className="tabular-nums text-foreground">{time}</span>
      </div>
    </header>
  )
}
